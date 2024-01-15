import { EventEmitter } from "events";
import { StorageAdapterBlock } from "@latticexyz/store-sync";

import { ReaderQueryDecodedIndexerParams, Reader } from "../../types";
import { isStorageAdapterBlock, processJSONStream } from "../../utils/common";
import { dbQuerySchema } from "../../utils/schema";

export const queryLogs = (params: ReaderQueryDecodedIndexerParams): Reader => {
  const { indexerUrl, query } = params;
  return {
    subscribe: (userCallback: (block: StorageAdapterBlock) => void) => {
      const eventEmitter = new EventEmitter();

      // Listen for the 'update' event
      eventEmitter.on("update", userCallback);

      (async () => {
        try {
          const parsedInput = dbQuerySchema.parse(query);
          const urlEncodedQuery = encodeURIComponent(
            JSON.stringify(parsedInput)
          );
          const url = `${indexerUrl}/api/queryLogs?&input=${urlEncodedQuery}`;
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
