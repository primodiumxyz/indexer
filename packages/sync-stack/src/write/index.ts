import * as writers from "./writers";

/**
 * A factory for creating a specific indexer writer (either with custom logic, console outputs or integrated with MUD
 * Recs).
 */
export const Write = {
  toCustom: writers.createWriter,
  toConsole: writers.consoleWriter,
  toRecs: writers.recsWriter,
};
