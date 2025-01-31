import { decodeDynamicField } from "@latticexyz/protocol-parser/internal";
import { StorageAdapterLog } from "@latticexyz/store-sync";

import { RecordData } from "@/util/common";

/**
 * Convert a database record to a MUD typed log.
 *
 * @param record - The record to convert
 * @returns The log
 */
export function recordToLog(
  record: Omit<RecordData, "recordBlockNumber">,
): StorageAdapterLog & { eventName: "Store_SetRecord" } {
  return {
    address: record.address,
    eventName: "Store_SetRecord",
    args: {
      tableId: record.tableId,
      keyTuple: decodeDynamicField("bytes32[]", record.keyBytes),
      staticData: record.staticData ?? "0x",
      encodedLengths: record.encodedLengths ?? "0x",
      dynamicData: record.dynamicData ?? "0x",
    },
  } as const;
}
