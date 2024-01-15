import { createWorld } from "@latticexyz/recs";
import { Read, Write } from "../../src";
import { WORLD_ADDRESS } from "../_constants";
import { createPublicClient, http } from "viem";
import { localhost } from "viem/chains";
import { recsStorage } from "@latticexyz/store-sync/recs";
import { resolveConfig } from "@latticexyz/store";
import config from "../../../contracts/mud.config";

const publicClient = createPublicClient({
  transport: http(),
  chain: localhost,
});

const stream = Read.fromRPC.subscribe({
  publicClient,
  address: WORLD_ADDRESS,
});

const world = createWorld();
const tables = resolveConfig(config).tables;
recsStorage({
  world,
  tables,
});
const writer = Write.toRecs({ world, tables });

const unsub = stream.subscribe((block) => {
  for (const l of block.logs) {
    writer(l);
  }
});

//stop listening after 10 seconds
setTimeout(() => {
  unsub?.();
}, 300000);
