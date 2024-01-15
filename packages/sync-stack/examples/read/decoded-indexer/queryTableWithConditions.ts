import { Read } from "../../../src";
import { WORLD_ADDRESS, INDEXER_URL } from "../../_constants";

const reader = Read.fromDecodedIndexer.query({
  indexerUrl: INDEXER_URL,
  query: {
    address: WORLD_ADDRESS,
    queries: [
      {
        tableName: "Score",
        and: [
          {
            column: "value",
            operation: "gt",
            value: 50_000_000n,
          },
          {
            column: "value",
            operation: "lte",
            value: 100_000_000n,
          },
        ],
      },
    ],
  },
});

reader.subscribe((logs) => {
  console.log(logs);
});
