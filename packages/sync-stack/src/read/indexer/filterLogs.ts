import { EventEmitter } from "events";
import { StorageAdapterBlock } from "@latticexyz/store-sync";
import { ReaderFilterIndexerParams, Reader } from "../../types";
import { isStorageAdapterBlockIndexer, processJSONStream } from "../../utils/common";

export const filterLogs = (args: ReaderFilterIndexerParams): Reader => {
  const { indexerUrl, filter } = args;
  return {
    subscribe: (userCallback) => {
      const eventEmitter = new EventEmitter();

      // Listen for the 'update' event
      eventEmitter.on("update", userCallback);

      // Start fetching the logs
      (async () => {
        try {
          const urlEncodedQuery = encodeURIComponent(JSON.stringify(filter));
          const url = `${indexerUrl}/api/logs?input=${urlEncodedQuery}`;
          for await (const result of processJSONStream(url)) {
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
              logs: result.logs,
              progress: result.chunk / result.totalChunks,
            });
          }
        } catch (error) {
          console.error(error);
        } finally {
          eventEmitter.removeAllListeners("update");
        }
      })();

      return () => {
        eventEmitter.removeAllListeners("update");
      };
    },
  };
};
