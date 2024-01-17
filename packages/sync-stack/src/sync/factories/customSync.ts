import { Reader, Sync, SyncOptions } from "../../types";

export function createSync(options: SyncOptions): Sync {
  const { reader, writer } = options;
  const unsubscribe: (() => void)[] = [];

  const sync: Sync = {
    start: (onProgress) => {
      function subToReader(reader: Reader, index: number) {
        onProgress && onProgress(index, 0n, 0);
        unsubscribe.push(
          reader.subscribe((block) => {
            onProgress && onProgress(index, block.blockNumber, block.progress ?? 1);
            for (const log of block.logs) {
              Array.isArray(writer) ? writer.forEach((write) => write(log)) : writer(log);
            }
          })
        );
      }

      Array.isArray(reader) ? reader.forEach((read, index) => subToReader(read, index)) : subToReader(reader, 0);
    },

    unsubscribe: () => {
      unsubscribe.forEach((unsub) => {
        unsub();
      });
    },
  };

  return sync;
}
