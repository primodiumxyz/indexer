import { Reader, Sync, SyncOptions } from "../../types";

export function createSync(options: SyncOptions): Sync {
  const { reader, writer } = options;
  const unsubscribe: (() => void)[] = [];

  const sync: Sync = {
    start: () => {
      function subToReader(reader: Reader) {
        unsubscribe.push(
          reader.subscribe((block) => {
            for (const log of block.logs) {
              Array.isArray(writer)
                ? writer.forEach((write) => write(log))
                : writer(log);
            }
          })
        );
      }

      Array.isArray(reader)
        ? reader.forEach((read) => subToReader(read))
        : subToReader(reader);
    },

    unsubscribe: () => {
      unsubscribe.forEach((unsub) => {
        unsub();
      });
    },
  };

  return sync;
}
