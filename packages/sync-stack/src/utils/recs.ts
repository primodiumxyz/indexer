import { mapObject } from "@latticexyz/common/utils";
import { KeySchema, SchemaToPrimitives } from "@latticexyz/protocol-parser/internal";
import { Entity } from "@latticexyz/recs";
import { ValueSchema } from "@latticexyz/store/internal";
import { concatHex, encodeAbiParameters, Hex, stringToHex } from "viem";

import { StoreTable } from "@/types";

/**
 * Converts a hex key tuple to an entity.
 *
 * @param hexKeyTuple - The hex key tuple to convert
 * @returns The entity
 */
export function hexKeyTupleToEntity(hexKeyTuple: readonly Hex[]): Entity {
  return concatHex(hexKeyTuple as Hex[]) as Entity;
}

/**
 * Encodes a key tuple into an entity.
 *
 * @param keySchema - The key schema
 * @param key - The key to encode
 * @returns The entity
 */
export function encodeEntity<TKeySchema extends KeySchema>(
  keySchema: TKeySchema,
  key: SchemaToPrimitives<TKeySchema>,
): Entity {
  if (Object.keys(keySchema).length !== Object.keys(key).length) {
    throw new Error(
      `key length ${Object.keys(key).length} does not match key schema length ${Object.keys(keySchema).length}`,
    );
  }
  return hexKeyTupleToEntity(
    Object.entries(keySchema).map(([keyName, type]) => encodeAbiParameters([{ type }], [key[keyName]])),
  );
}

/**
 * Gets the entity for a table.
 *
 * @param table - The table to get the entity for
 * @returns The entity
 */
export function getTableEntity(table: Pick<StoreTable, "address" | "namespace" | "name">): Entity {
  return encodeEntity(
    { address: "address", namespace: "bytes16", name: "bytes16" },
    {
      address: table.address,
      namespace: stringToHex(table.namespace, { size: 16 }),
      name: stringToHex(table.name, { size: 16 }),
    },
  );
}

/**
 * Flattens a schema into a type.
 *
 * @param schema - The schema to flatten
 * @returns The flattened schema
 */
export function flattenSchema<schema extends ValueSchema>(
  schema: schema,
): { readonly [k in keyof schema]: schema[k]["type"] } {
  return mapObject(schema, (value) => value.type);
}
