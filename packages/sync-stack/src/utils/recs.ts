import { Entity } from "@latticexyz/recs";
import { KeySchema, SchemaToPrimitives } from "@latticexyz/protocol-parser/internal";
import { mapObject } from "@latticexyz/common/utils";
import { ValueSchema } from "@latticexyz/store/internal";
import { stringToHex, encodeAbiParameters, Hex, concatHex } from "viem";
import { Table } from "@latticexyz/store-sync";

export function hexKeyTupleToEntity(hexKeyTuple: readonly Hex[]): Entity {
  return concatHex(hexKeyTuple as Hex[]) as Entity;
}

export function encodeEntity<TKeySchema extends KeySchema>(
  keySchema: TKeySchema,
  key: SchemaToPrimitives<TKeySchema>
): Entity {
  if (Object.keys(keySchema).length !== Object.keys(key).length) {
    throw new Error(
      `key length ${Object.keys(key).length} does not match key schema length ${Object.keys(keySchema).length}`
    );
  }
  return hexKeyTupleToEntity(
    Object.entries(keySchema).map(([keyName, type]) => encodeAbiParameters([{ type }], [key[keyName]]))
  );
}

export function getTableEntity(table: Pick<Table, "address" | "namespace" | "name">): Entity {
  return encodeEntity(
    { address: "address", namespace: "bytes16", name: "bytes16" },
    {
      address: table.address,
      namespace: stringToHex(table.namespace, { size: 16 }),
      name: stringToHex(table.name, { size: 16 }),
    }
  );
}

export function flattenSchema<schema extends ValueSchema>(
  schema: schema
): { readonly [k in keyof schema]: schema[k]["type"] } {
  return mapObject(schema, (value) => value.type);
}
