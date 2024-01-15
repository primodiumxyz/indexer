import { createPublicClient, http } from "viem";
import { localhost } from "viem/chains";

import { Read } from "../../../src";
import { WORLD_ADDRESS } from "../../_constants";

const publicClient = createPublicClient({
  transport: http(),
  chain: localhost,
});

const latestBlock = await publicClient.getBlockNumber();

// queries records for the last 10k blocks
const reader = Read.fromRPC.filter({
  address: WORLD_ADDRESS,
  publicClient,
  fromBlock: latestBlock - 10_000n,
  toBlock: latestBlock,
  maxBlockRange: 1_000n,
});

reader.subscribe((logs) => {
  console.log(logs);
});
