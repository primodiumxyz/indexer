import { Read } from "../../../src";
import { WORLD_ADDRESS, INDEXER_URL } from "../../_constants";
import { storeTables } from "@latticexyz/store-sync";

// queries table register records
const reader = Read.fromIndexer.filter({
  indexerUrl: INDEXER_URL,
  filter: {
    address: WORLD_ADDRESS,
    filters: [
      {
        tableId: storeTables.Tables.tableId,
      },
    ],
  },
});

reader.subscribe((logs) => {
  console.log(logs);
});
