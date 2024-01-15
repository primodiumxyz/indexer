import { EventEmitter } from "events";
import { StorageAdapterBlock } from "@latticexyz/store-sync";
import { ReaderFilterIndexerParams, Reader } from "../../types";
import { isStorageAdapterBlock, processJSONStream } from "../../utils/common";

export const filterLogs = (args: ReaderFilterIndexerParams): Reader => {
  const { indexerUrl, filter } = args;
  return {
    subscribe: (userCallback: (block: StorageAdapterBlock) => void) => {
      const eventEmitter = new EventEmitter();

      // Listen for the 'update' event
      eventEmitter.on("update", userCallback);

      // Start fetching the logs
      (async () => {
        try {
          const urlEncodedQuery = encodeURIComponent(JSON.stringify(filter));
          const url = `${indexerUrl}/api/logs?input=${urlEncodedQuery}`;
          for await (const result of processJSONStream(url)) {
            if (!isStorageAdapterBlock(result)) {
              eventEmitter.emit("update", {
                blockNumber: 0n,
                logs: [],
              } as StorageAdapterBlock);
              return;
            }

            eventEmitter.emit("update", {
              ...result,
              blockNumber: BigInt(result.blockNumber),
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
