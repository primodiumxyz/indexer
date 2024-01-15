import { Hex, stringToHex } from "viem";
import { z } from "zod";
import { dbQuerySchema, querySchema } from "../postgres/querySchema";
import { resourceToHex } from "@latticexyz/common";

export type RecordData = {
  address: Hex;
  tableId: Hex;
  keyBytes: Hex;
  staticData: Hex | null;
  encodedLengths: Hex | null;
  dynamicData: Hex | null;
  recordBlockNumber: string;
  logIndex: number;
};

export type RecordMetadata = {
  indexerVersion: string;
  chainId: string;
  chainBlockNumber: string;
  totalRows: number;
};

export type Record = RecordData & RecordMetadata;

export type Query = z.infer<typeof querySchema>;

export type DBQuery = z.infer<typeof dbQuerySchema>;

export function convertIfHexOtherwiseReturnString(inputString: string | Hex) {
  // Check if the string starts with '0x' followed by a valid hex sequence
  if (/^0x[0-9A-Fa-f]+$/.test(inputString)) {
    // Remove the '0x' prefix and convert the remaining part to a buffer
    return Buffer.from(inputString.slice(2), "hex");
  }
  return inputString;
}

export function tableNameToId(
  tableName: string,
  tableType: Query["tableType"]
): Hex {
  return resourceToHex({
    name: tableName,
    type: tableType,
    namespace: "",
  });
}
