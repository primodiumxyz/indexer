import { z } from "zod";
import { dbQuerySchema, filterSchema, querySchema } from "./utils/schema";
import { Hex, PublicClient } from "viem";
import { StoreEventsAbi } from "@latticexyz/store";
import { FetchLogsOptions } from "@latticexyz/block-logs-stream";
import { StorageAdapterBlock, StorageAdapterLog } from "@latticexyz/store-sync";
import { World } from "@latticexyz/recs";
import { ResolvedStoreConfig, StoreConfig } from "@latticexyz/store";

export type Query = z.infer<typeof querySchema>;

export type DecodedIndexerQuery = z.input<typeof dbQuerySchema>;

export type LogFilter = z.input<typeof filterSchema>;

export type FetchAndFilterLogsOptions = Omit<FetchLogsOptions<StoreEventsAbi>, "events"> & {
  logFilter?: LogFilter["filters"];
};

export type ReaderSubscribeRpcParams = {
  publicClient: PublicClient;
  address: Hex;
  logFilter?: LogFilter["filters"];
};

export type Reader = {
  subscribe: (callback: (block: StorageAdapterBlock & { progress?: number }) => void) => () => void;
};

export type ReaderFilterIndexerParams = {
  indexerUrl: string;
  filter: LogFilter;
};

export type ReaderQueryDecodedIndexerParams = {
  indexerUrl: string;
  query: DecodedIndexerQuery;
};

export type ReaderFilterRpcParams = Omit<FetchLogsOptions<StoreEventsAbi>, "events"> & {
  filter?: LogFilter;
};

export type Writer = (log: StorageAdapterLog) => void;

export type WriterRecsParams = {
  world: World;
  tables: ResolvedStoreConfig<StoreConfig>["tables"];
};

export type WriterAdapterFunctions = {
  set: (log: StorageAdapterLog & { eventName: "Store_SetRecord" }) => void;
  updateStatic: (log: StorageAdapterLog & { eventName: "Store_SpliceStaticData" }) => void;
  updateDynamic: (log: StorageAdapterLog & { eventName: "Store_SpliceDynamicData" }) => void;
  delete: (log: StorageAdapterLog & { eventName: "Store_DeleteRecord" }) => void;
};

export type SyncOptions = {
  reader: Reader | Reader[];
  writer: Writer | Writer[];
};

export type Sync = {
  start: (onProgress?: (index: number, blockNumber: bigint, progress: number) => void) => void;
  unsubscribe: () => void;
};
