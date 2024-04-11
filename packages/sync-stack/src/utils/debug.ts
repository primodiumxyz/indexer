import { debug as parentDebug } from "debug";

export const debug = parentDebug("primodium:sync-stack");
export const error = parentDebug("primodium:sync-stack");

// Pipe debug output to stdout instead of stderr
debug.log = console.debug.bind(console);

// Pipe error output to stderr
error.log = console.error.bind(console);
