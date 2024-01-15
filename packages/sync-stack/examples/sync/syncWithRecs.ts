import { createWorld } from "@latticexyz/recs";
import { Sync } from "../../src";
import { WORLD_ADDRESS } from "../_constants";
import { createPublicClient, http } from "viem";
import { localhost } from "viem/chains";
import { recsStorage } from "@latticexyz/store-sync/recs";
import { resolveConfig } from "@latticexyz/store";
import config from "../../../contracts/mud.config";
import { transportObserver } from "@latticexyz/common";

const publicClient = createPublicClient({
  transport: transportObserver(http()),
  chain: localhost,
});

const world = createWorld();
const tables = resolveConfig(config).tables;
recsStorage({
  world,
  tables,
});

const sync = Sync.withLiveRPCRecsSync({
  address: WORLD_ADDRESS,
  publicClient,
  world,
  tables,
  logFilter: [
    {
      tableId: tables.OwnedBy.tableId,
    },
    {
      tableId: tables.Position.tableId,
    },
  ],
});

//start the sync
sync.start();

// stop listening after 10 seconds
setTimeout(() => {
  sync.unsubscribe();
}, 50000);
