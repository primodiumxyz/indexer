import { Reader, SyncFunctions, SyncOptions } from "../../types";

export function createSync(options: SyncOptions): SyncFunctions {
  const { reader, writer } = options;
  const unsubscribe: (() => void)[] = [];

  const sync: SyncFunctions = {
    start: (onProgress, error) => {
      function subToReader(reader: Reader, index: number) {
        onProgress && onProgress(index, 0n, 0);
        unsubscribe.push(
          reader.subscribe((block) => {
            for (const log of block.logs) {
              Array.isArray(writer) ? writer.forEach((write) => write(log)) : writer(log);
            }
            onProgress && onProgress(index, block.blockNumber, block.progress ?? 1);
          }, error)
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
