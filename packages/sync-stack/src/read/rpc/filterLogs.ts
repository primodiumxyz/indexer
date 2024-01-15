import { EventEmitter } from "events";
import { fetchLogs } from "@latticexyz/block-logs-stream";
import { storeEventsAbi } from "@latticexyz/store";
import { StorageAdapterBlock } from "@latticexyz/store-sync";
import { ReaderFilterRpcParams, Reader } from "../../types";

export function filterLogs(args: ReaderFilterRpcParams): Reader {
  return {
    subscribe: (userCallback: (block: StorageAdapterBlock) => void) => {
      const eventEmitter = new EventEmitter();

      eventEmitter.on("update", userCallback);

      try {
        (async () => {
          for await (const { logs, toBlock } of fetchLogs({
            events: storeEventsAbi,
            ...args,
          })) {
            eventEmitter.emit("update", { blockNumber: toBlock, logs });
          }
        })();
      } catch (error) {
        console.error(error);
      } finally {
        eventEmitter.removeAllListeners("update");
      }

      return () => {
        eventEmitter.removeAllListeners("update");
      };
    },
  };
}
