import { StorageAdapterLog, Writer, WriterAdapterFunctions } from "@/types";
import { debug } from "@/utils/debug";

/** A custom writer that takes a set of {@link WriterAdapterFunctions} to process various types of incoming logs. */
export function createWriter(storeFn: WriterAdapterFunctions): Writer {
  return (log: StorageAdapterLog) => {
    switch (log.eventName) {
      case "Store_SetRecord":
        debug("setting new record in store");
        storeFn.set(log);
        break;
      case "Store_SpliceStaticData":
        debug("updating static data record in store");
        storeFn.updateStatic(log);
        break;
      case "Store_SpliceDynamicData":
        debug("updating dynamic data record in store");
        storeFn.updateDynamic(log);
        break;
      case "Store_DeleteRecord":
        debug("deleting record in store");
        storeFn.delete(log);
        break;
      default:
        debug("unknown event");
        break;
    }
  };
}
