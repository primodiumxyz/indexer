import { EventEmitter } from "eventemitter3";

import { dbQuerySchema } from "@primodiumxyz/pg-indexer-reader/postgres/querySchema";
import { Reader, ReaderQueryDecodedIndexerParams, StorageAdapterBlock } from "@/types";
import { isStorageAdapterBlockIndexer, processJSONStream } from "@/utils/common";

/**
 * Creates a reader for query decoded indexer logs.
 *
 * @param params - The {@link ReaderQueryDecodedIndexerParams}
 * @returns A {@link Reader}
 */
export const queryLogs = (params: ReaderQueryDecodedIndexerParams): Reader => {
  const { indexerUrl, query } = params;
  return {
    subscribe: (userCallback, errorCallback) => {
      const eventEmitter = new EventEmitter();

      // Listen for the 'update' event
      eventEmitter.on("update", userCallback);

      // Listen for the 'error' event
      if (errorCallback) eventEmitter.on("error", errorCallback);

      (async () => {
        try {
          const parsedInput = dbQuerySchema.parse(query);
          const urlEncodedQuery = encodeURIComponent(JSON.stringify(parsedInput));
          const url = `${indexerUrl}/api/queryLogs?&input=${urlEncodedQuery}`;
          for await (const result of processJSONStream(url)) {
            ``;
            if (!isStorageAdapterBlockIndexer(result)) {
              eventEmitter.emit("update", {
                blockNumber: 0n,
                logs: [],
                progress: 1,
              } as StorageAdapterBlock);
              return;
            }

            eventEmitter.emit("update", {
              blockNumber: BigInt(result.blockNumber),
              progress: result.chunk / result.totalChunks,
              logs: result.logs,
            });
          }
        } catch (err) {
          eventEmitter.emit("error", err);
        } finally {
          eventEmitter.removeAllListeners("update");
          eventEmitter.removeAllListeners("error");
        }
      })();

      return () => {
        eventEmitter.removeAllListeners("update");
        eventEmitter.removeAllListeners("error");
      };
    },
  };
};
