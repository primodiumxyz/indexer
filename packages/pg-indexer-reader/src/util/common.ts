import { Hex } from "viem";
import { z } from "zod";

import { dbQuerySchema, querySchema } from "@/postgres/querySchema";

/**
 * Record data from the database.
 *
 * @param address - The address of the record
 * @param tableId - The identifier of the table
 * @param keyBytes - The key bytes
 * @param staticData - The static data
 * @param encodedLengths - The encoded lengths
 * @param dynamicData - The dynamic data
 * @param recordBlockNumber - The block number this record was indexed at
 * @param logIndex - The index of the log
 */
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

/**
 * Additional metadata about the records.
 *
 * @param indexerVersion - The version of the indexer
 * @param chainId - The chain ID
 * @param chainBlockNumber - The block number of the chain
 * @param totalRows - The total number of rows
 */
export type RecordMetadata = {
  indexerVersion: string;
  chainId: string;
  chainBlockNumber: string;
  totalRows: number;
};

/** A record with additional metadata. */
export type Record = RecordData & RecordMetadata;

/** A typed query. */
export type Query = z.infer<typeof querySchema>;

/** A typed database query. */
export type DBQuery = z.infer<typeof dbQuerySchema>;

/**
 * Convert a string to a buffer if it is a valid hex string.
 *
 * @param inputString - The input string
 * @returns The buffer
 */
export function convertIfHexOtherwiseReturnString(inputString: string | Hex) {
  // Check if the string starts with '0x' followed by a valid hex sequence
  if (/^0x[0-9A-Fa-f]+$/.test(inputString)) {
    // Remove the '0x' prefix and convert the remaining part to a buffer
    return Buffer.from(inputString.slice(2), "hex");
  }

  return inputString;
}
