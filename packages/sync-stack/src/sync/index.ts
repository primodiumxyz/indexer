import * as sync from "./factories";

/** A factory for creating a sync stack (with both a reader & writer). */
export const Sync = {
  withCustom: sync.createSync,
  withLiveRPCRecsSync: sync.liveRPCRecsSync,
  withRPCRecsSync: sync.RPCRecsSync,
  withFilterIndexerRecsSync: sync.filterIndexerRecsSync,
  withQueryDecodedIndexerRecsSync: sync.queryDecodedIndexerRecsSync,
};
