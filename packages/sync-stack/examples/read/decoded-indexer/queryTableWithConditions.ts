import { Read } from "../../../src";
import { WORLD_ADDRESS, INDEXER_URL } from "../../_constants";

const reader = Read.fromDecodedIndexer.query({
  indexerUrl: INDEXER_URL,
  query: {
    address: WORLD_ADDRESS,
    queries: [
      {
        tableName: "Position",
        where: {
          column: "__key_bytes",
          operation: "eq",
          value: "0x83dd2fd6d9f822f4af640fef65513792462aedae397fa81159452ccc35327d0e",
        },
        include: [
          {
            tableName: "OwnedBy",
            on: "entity",
          },
        ],
      },
    ],
  },
});

reader.subscribe((logs) => {
  console.log(logs.logs);
});
