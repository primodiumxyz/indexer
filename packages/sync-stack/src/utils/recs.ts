import { Entity } from "@latticexyz/recs";
import { Table } from "@latticexyz/store-sync";
import { encodeEntity } from "@latticexyz/store-sync/recs";
import { mapObject } from "@latticexyz/common/utils";
import { ValueSchema } from "@latticexyz/store";
import { stringToHex } from "viem";

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
