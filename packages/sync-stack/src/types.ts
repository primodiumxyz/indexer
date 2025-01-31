import { FetchLogsOptions } from "@latticexyz/block-logs-stream";
import { UnionPick } from "@latticexyz/common/type-utils";
import { World } from "@latticexyz/recs";
import { StoreEventsAbi, StoreEventsAbiItem } from "@latticexyz/store";
import type { KeySchema, Table, ValueSchema } from "@latticexyz/store/internal";
import { Address, Hex, Log, PublicClient } from "viem";
import { z } from "zod";

import { dbQuerySchema, filterSchema, querySchema } from "@primodiumxyz/pg-indexer-reader/postgres/querySchema";

/** A TypeScript query object that can be used to query the database. */
export type Query = z.infer<typeof querySchema>;

/**
 * A TypeScript query object that can be used to query the database.
 *
 * Note: This type is used to query from a decoded indexer reader.
 */
export type DecodedIndexerQuery = z.input<typeof dbQuerySchema>;

/**
 * A TypeScript query object that can be used to query the database with filters.
 *
 * Note: This type is used to query either from a RPC or indexer filter reader.
 */
export type LogFilter = z.input<typeof filterSchema>;

/** Options for fetching and logs with filters. */
export type FetchAndFilterLogsOptions = Omit<FetchLogsOptions<StoreEventsAbi>, "events"> & {
  logFilter?: LogFilter["filters"];
};

/**
 * Options for subscribing to logs from RPC.
 *
 * @property publicClient - The viem {@link PublicClient} to use for subscribing to logs
 * @property address - The address of the contract to subscribe to
 * @property logFilter (optional) - The {@link LogFilter} to apply to the logs
 */
export type ReaderSubscribeRpcParams = {
  publicClient: PublicClient;
  address: Hex;
  logFilter?: LogFilter["filters"];
};

/**
 * A reader that can subscribe to logs from RPC or indexer.
 *
 * @property subscribe - A function that can subscribe to incoming {@link StorageAdapterBlock}
 * @property errorCallback (optional) - A function that can handle errors from the reader
 */
export type Reader = {
  subscribe: (
    callback: (block: StorageAdapterBlock & { progress?: number }) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errorCallback?: (err: any) => void,
  ) => () => void;
};

/**
 * Options for querying from an indexer reader with filters.
 *
 * @property indexerUrl - The URL of the indexer
 * @property filter - The {@link LogFilter} to apply to the logs
 */
export type ReaderFilterIndexerParams = {
  indexerUrl: string;
  filter: LogFilter;
};

/**
 * Options for querying from an indexer reader with a decoded query.
 *
 * @property indexerUrl - The URL of the indexer
 * @property query - The {@link DecodedIndexerQuery} to apply to the logs
 */
export type ReaderQueryDecodedIndexerParams = {
  indexerUrl: string;
  query: DecodedIndexerQuery;
};

/**
 * Options for querying from an RPC reader with filters.
 *
 * @property filter (optional) - The {@link LogFilter} to apply to the logs
 */
export type ReaderFilterRpcParams = Omit<FetchLogsOptions<StoreEventsAbi>, "events"> & {
  filter?: LogFilter;
};

/** A writer that can write record incoming {@link StorageAdapterLog} into a database. */
export type Writer = (log: StorageAdapterLog) => void;

/**
 * Options for creating a writer with MUD Recs.
 *
 * @property world - The MUD {@link World} to write to
 * @property tables - The tables that will get written to
 * @property overwrite (optional) - Whether to overwrite existing records
 */
export type WriterRecsParams = {
  world: World;
  tables: Record<string, Table>;
  overwrite?: boolean;
};

/** A writer adapter to process incoming {@link StorageAdapterLog} depending on the event type. */
export type WriterAdapterFunctions = {
  set: (log: StorageAdapterLog & { eventName: "Store_SetRecord" }) => void;
  updateStatic: (log: StorageAdapterLog & { eventName: "Store_SpliceStaticData" }) => void;
  updateDynamic: (log: StorageAdapterLog & { eventName: "Store_SpliceDynamicData" }) => void;
  delete: (log: StorageAdapterLog & { eventName: "Store_DeleteRecord" }) => void;
};

/**
 * Options for creating a sync.
 *
 * @property reader - The {@link Reader} (or array of {@link Reader}) to use for syncing
 * @property writer - The {@link Writer} (or array of {@link Writer}) to use for syncing
 */
export type SyncOptions = {
  reader: Reader | Reader[];
  writer: Writer | Writer[];
};

/** A sync function that can start and stop syncing. */
export type SyncFunctions = {
  start: (
    onProgress?: (index: number, blockNumber: bigint, progress: number) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error?: (err: any) => void,
  ) => void;
  unsubscribe: () => void;
};

/** A table namespace. */
export type TableNamespace = string;

/** A table name. */
export type TableName = string;

/** A log from the StoreEventsAbi. */
export type StoreEventsLog = Log<bigint, number, false, StoreEventsAbiItem, true, StoreEventsAbi>;

/** A block of logs from the StoreEventsAbi. */
export type BlockLogs = { blockNumber: StoreEventsLog["blockNumber"]; logs: readonly StoreEventsLog[] };

/** A log from the StoreEventsAbi with only the required fields. */
export type StorageAdapterLog = Partial<StoreEventsLog> & UnionPick<StoreEventsLog, "address" | "eventName" | "args">;

/** A block of logs from the StoreEventsAbi. */
export type StorageAdapterBlock = { blockNumber: BlockLogs["blockNumber"]; logs: readonly StorageAdapterLog[] };

/** A table from the Store. */
export type StoreTable = {
  address: Address;
  tableId: Hex;
  namespace: TableNamespace;
  name: TableName;
  keySchema: KeySchema;
  valueSchema: ValueSchema;
};
