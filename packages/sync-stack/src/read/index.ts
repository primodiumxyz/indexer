import * as indexer from "./indexer";
import * as rpc from "./rpc";

indexer.filterLogs;

/** A factory for creating a specific indexer reader. */
export const Read = {
  fromDecodedIndexer: {
    filter: indexer.filterLogs,
    query: indexer.queryLogs,
  },
  fromIndexer: { filter: indexer.filterLogs },
  fromRPC: { filter: rpc.filterLogs, subscribe: rpc.subscribeLogs },
};
