import { hexToResource } from "@latticexyz/common";
import { isNotNull } from "@latticexyz/common/utils";
import { snakeCase } from "change-case";
import { PendingQuery, Row, Sql } from "postgres";

import { convertIfHexOtherwiseReturnString, Query, Record } from "@/util/common";

/**
 * Function to convert a single condition into SQL.
 *
 * @param sql - The SQL connection
 * @param schemaName - The name of the schema
 * @param dbTableName - The name of the table
 * @param where - The where clause
 * @returns The SQL query
 */
function _where(
  sql: Sql,
  schemaName: string,
  dbTableName: string,
  where: NonNullable<Query["where"]>,
): PendingQuery<Row[]> {
  const _condition = sql`${sql(schemaName)}.${sql(dbTableName)}.${sql(where.column)}`;
  const _value = convertIfHexOtherwiseReturnString(where.value);

  switch (where.operation) {
    case "eq":
      return sql`${_condition} = ${_value}`;
    case "neq":
      return sql`${_condition} != ${_value}`;
    case "lt":
      return sql`${_condition} < ${_value}`;
    case "lte":
      return sql`${_condition} <= ${_value}`;
    case "gt":
      return sql`${_condition} > ${_value}`;
    case "gte":
      return sql`${_condition} >= ${_value}`;
    default:
      throw new Error(`Unsupported operation: ${where.operation}`);
  }
}

/**
 * Function to combine conditions with AND logic.
 *
 * @param sql - The SQL connection
 * @param conditions - The conditions to AND
 * @returns The AND condition
 */
function _and(sql: Sql, conditions: PendingQuery<Row[]>[]): PendingQuery<Row[]> {
  return sql`(${conditions.reduce((query, condition) => sql`${query} AND ${condition}`)})`;
}

/**
 * Function to combine conditions with OR logic.
 *
 * @param sql - The SQL connection
 * @param conditions - The conditions to OR
 * @returns The OR condition
 */
function _or(sql: Sql, conditions: PendingQuery<Row[]>[]): PendingQuery<Row[]> {
  return sql`(${conditions.reduce((query, condition) => sql`${query} OR ${condition}`)})`;
}

/**
 * Function to combine queries with UNION ALL logic.
 *
 * @param sql - The SQL connection
 * @param queries - The queries to UNION ALL
 * @returns The UNION ALL query
 */
function _union(sql: Sql, queries: PendingQuery<Row[]>[]) {
  return queries.reduce((acc, query) => sql`${acc} UNION ALL ${query}`);
}

/**
 * Function to query filtered records from the database.
 *
 * @param sql - The SQL connection
 * @param query - The query to filter
 * @param address - The address of the world contract
 * @returns The filtered records
 */
function filterRecords(sql: Sql, query: PendingQuery<Row[]>, address: string) {
  return sql`
    WITH filter as (
     ${query}
    )
      SELECT 
        '0x' || encode(address, 'hex') AS address,
        '0x' || encode(mud.records.table_id, 'hex') AS "tableId",
        '0x' || encode(key_bytes, 'hex') AS "keyBytes",
        '0x' || encode(static_data, 'hex') AS "staticData",
        '0x' || encode(encoded_lengths, 'hex') AS "encodedLengths",
        '0x' || encode(dynamic_data, 'hex') AS "dynamicData",
        block_number AS "recordBlockNumber",
        log_index AS "logIndex"
      FROM mud.records
      JOIN filter on filter.__key_bytes = mud.records.key_bytes AND filter.table_id = mud.records.table_id
      WHERE mud.records.address = ${convertIfHexOtherwiseReturnString(address)} AND mud.records.is_deleted = false
  `;
}

function getRecordsForTableIDs(sql: Sql, address: string, tableIDs: string[]) {
  return sql`
      SELECT 
        '0x' || encode(address, 'hex') AS address,
        '0x' || encode(mud.records.table_id, 'hex') AS "tableId",
        '0x' || encode(key_bytes, 'hex') AS "keyBytes",
        '0x' || encode(static_data, 'hex') AS "staticData",
        '0x' || encode(encoded_lengths, 'hex') AS "encodedLengths",
        '0x' || encode(dynamic_data, 'hex') AS "dynamicData",
        block_number AS "recordBlockNumber",
        log_index AS "logIndex"
      FROM mud.records
      WHERE mud.records.address = ${convertIfHexOtherwiseReturnString(
        address,
      )} AND mud.records.is_deleted = false AND mud.records.table_id IN ${sql(
        tableIDs.map((id) => convertIfHexOtherwiseReturnString(id)),
      )}
  `;
}

/**
 * Function to convert a query object into an SQL query.
 *
 * @param sql - The SQL connection
 * @param address - The address of the world contract
 * @param query - The query to convert
 * @returns The SQL query
 */
export function toSQL(sql: Sql, address: string, query: Query[]): PendingQuery<Record[]> {
  const noConditionTableIDs: string[] = [];

  const queries = query
    .map(({ tableId, where, and, or, include }) => {
      const { name, namespace } = hexToResource(tableId);
      const dbTableName = `${snakeCase(namespace)}__${snakeCase(name)}`;
      const schema = address;

      if (!where && !and && !or && !include) {
        noConditionTableIDs.push(tableId);
        return null;
      }

      let whereClause: PendingQuery<Row[]> | undefined;
      if (where) {
        whereClause = _where(sql, schema, dbTableName, where);
      } else if (and) {
        whereClause = _and(
          sql,
          and.map((where) => _where(sql, schema, dbTableName, where)),
        );
      } else if (or) {
        whereClause = _or(
          sql,
          or.map((where) => _where(sql, schema, dbTableName, where)),
        );
      }

      let _query = sql`
        SELECT __key_bytes, ${convertIfHexOtherwiseReturnString(tableId)} as table_id 
        FROM ${sql(schema)}.${sql(dbTableName)}
        ${whereClause ? sql`WHERE ${whereClause}` : sql``}`;

      if (include && include.length) {
        const includeQueries = include.map(({ tableId: joinTableId, on }) => {
          const { name, namespace } = hexToResource(joinTableId);
          const joinSchema = address;
          const joinTableName = `${snakeCase(namespace)}__${snakeCase(name)}`;

          return sql`
            SELECT ${sql(joinSchema)}.${sql(joinTableName)}.__key_bytes, ${convertIfHexOtherwiseReturnString(
              joinTableId,
            )} as table_id
            FROM (${_query}) AS base
            JOIN ${sql(joinSchema)}.${sql(joinTableName)}
            ON ${sql(joinSchema)}.${sql(joinTableName)}.${sql(on)} = base.__key_bytes`;
        });

        _query = _union(sql, [_query, ...includeQueries]);
      }

      return _query;
    })
    .filter(isNotNull) as PendingQuery<Row[]>[];

  const filteredRecords = queries.length ? filterRecords(sql, _union(sql, queries), address) : null;

  const rawRecords = noConditionTableIDs.length ? getRecordsForTableIDs(sql, address, noConditionTableIDs) : null;

  const records = [filteredRecords, rawRecords].filter(isNotNull) as PendingQuery<Row[]>[];

  return sql<Record[]>`
    WITH
      config AS (
        SELECT
          version AS "indexerVersion",
          chain_id AS "chainId",
          block_number AS "chainBlockNumber"
        FROM mud.config
        LIMIT 1
      ),
      records as (
        ${_union(sql, records)}
      )
    SELECT * FROM records, config
    ORDER BY "records"."recordBlockNumber", "records"."logIndex" ASC
  `;
}
