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

      (async () => {
        try {
          for await (const { logs, toBlock } of fetchLogs({
            events: storeEventsAbi,
            fromBlock: args.fromBlock,
            toBlock: args.toBlock,
            publicClient: args.publicClient,
          })) {
            const blocks = Number(toBlock - args.fromBlock);
            const totalBlocks = Number(args.toBlock - args.fromBlock);
            eventEmitter.emit("update", { blockNumber: toBlock, logs, progress: blocks / totalBlocks });
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
}
