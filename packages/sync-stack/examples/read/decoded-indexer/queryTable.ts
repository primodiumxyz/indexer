import { Read } from "../../../src";
import { WORLD_ADDRESS, INDEXER_URL } from "../../_constants";

const reader = Read.fromDecodedIndexer.query({
  indexerUrl: INDEXER_URL,
  query: {
    address: WORLD_ADDRESS,
    queries: [
      {
        tableName: "Score",
      },
    ],
  },
});

reader.subscribe((logs) => {
  console.log(logs);
});
