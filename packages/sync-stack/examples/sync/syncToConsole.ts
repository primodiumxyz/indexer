import { Read, Sync, Write } from "../../src";
import { WORLD_ADDRESS } from "../_constants";
import { createPublicClient, http } from "viem";
import { localhost } from "viem/chains";
import { transportObserver } from "@latticexyz/common";

const publicClient = createPublicClient({
  transport: transportObserver(http()),
  chain: localhost,
});

const sync = Sync.withCustom({
  reader: Read.fromRPC.subscribe({
    address: WORLD_ADDRESS,
    publicClient,
  }),
  writer: Write.toConsole,
});

//start the sync
sync.start();

// stop listening after 10 seconds
setTimeout(() => {
  sync.unsubscribe();
}, 1000 * 10);
