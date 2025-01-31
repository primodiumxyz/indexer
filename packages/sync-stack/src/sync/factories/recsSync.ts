import { Read } from "@/read";
import { createSync } from "@/sync/factories/customSync";
import {
  ReaderFilterIndexerParams,
  ReaderFilterRpcParams,
  ReaderQueryDecodedIndexerParams,
  ReaderSubscribeRpcParams,
  WriterRecsParams,
} from "@/types";
import { Write } from "@/write";

/**
 * Creates a live RPC sync using Recs.
 *
 * @param args - The {@link ReaderSubscribeRpcParams} & {@link WriterRecsParams}
 * @returns A {@link Sync}
 */
export function liveRPCRecsSync(args: ReaderSubscribeRpcParams & WriterRecsParams) {
  const { world, tables, address, logFilter, publicClient } = args;

  return createSync({
    reader: Read.fromRPC.subscribe({
      address: address,
      publicClient: publicClient,
      logFilter: logFilter,
    }),
    writer: Write.toRecs({ world, tables }),
  });
}

/**
 * Creates a filtered RPC sync using Recs.
 *
 * @param args - The {@link ReaderFilterRpcParams} & {@link WriterRecsParams}
 * @returns A {@link Sync}
 */
export function RPCRecsSync(args: ReaderFilterRpcParams & WriterRecsParams) {
  const { world, tables, address, filter, publicClient, fromBlock, toBlock, maxBlockRange, maxRetryCount } = args;

  return createSync({
    reader: Read.fromRPC.filter({
      address: address,
      publicClient: publicClient,
      filter,
      fromBlock,
      toBlock,
      maxBlockRange,
      maxRetryCount,
    }),
    writer: Write.toRecs({ world, tables }),
  });
}

/**
 * Creates a filtered indexer sync using Recs.
 *
 * @param args - The {@link WriterRecsParams} & {@link ReaderFilterIndexerParams}
 * @returns A {@link Sync}
 */
export function filterIndexerRecsSync(args: WriterRecsParams & ReaderFilterIndexerParams) {
  const { world, tables, filter, indexerUrl } = args;

  return createSync({
    reader: Read.fromIndexer.filter({
      filter: filter,
      indexerUrl,
    }),
    writer: Write.toRecs({ world, tables }),
  });
}

/**
 * Creates a query decoded indexer sync using Recs.
 *
 * @param args - The {@link WriterRecsParams} & {@link ReaderQueryDecodedIndexerParams}
 * @returns A {@link Sync}
 */
export const queryDecodedIndexerRecsSync = (args: WriterRecsParams & ReaderQueryDecodedIndexerParams) => {
  const { world, tables, indexerUrl, query } = args;

  return createSync({
    reader: Read.fromDecodedIndexer.query({
      indexerUrl,
      query,
    }),
    writer: Write.toRecs({ world, tables }),
  });
};
