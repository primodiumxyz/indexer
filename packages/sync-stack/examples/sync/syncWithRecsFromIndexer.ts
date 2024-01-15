import { createWorld } from "@latticexyz/recs";
import { Sync } from "../../src";
import { INDEXER_URL, WORLD_ADDRESS } from "../_constants";
import { recsStorage } from "@latticexyz/store-sync/recs";
import { resolveConfig } from "@latticexyz/store";
import config from "../../../contracts/mud.config";

// create recs world and components
const world = createWorld();
const tables = resolveConfig(config).tables;
recsStorage({
  world,
  tables,
});

// sync recs from query results whre score is greater than 100k
const sync = Sync.withQueryDecodedIndexerRecsSync({
  indexerUrl: INDEXER_URL,
  world,
  tables,
  query: {
    address: WORLD_ADDRESS,
    queries: [
      {
        tableName: "Score",
        where: {
          column: "value",
          operation: "gt",
          value: 100_000,
        },
      },
    ],
  },
});

//start the sync
sync.start();
