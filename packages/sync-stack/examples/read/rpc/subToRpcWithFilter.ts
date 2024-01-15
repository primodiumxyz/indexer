import { Read } from "../../../src";
import { WORLD_ADDRESS } from "../../_constants";
import { createPublicClient, http } from "viem";
import { localhost } from "viem/chains";

const publicClient = createPublicClient({
  transport: http(),
  chain: localhost,
});

const stream = Read.fromRPC.subscribe({
  publicClient,
  address: WORLD_ADDRESS,
  logFilter: [
    {
      tableId: "0x746200000000000000000000000000004c617374436c61696d65644174000000",
    },
  ],
});

const unsub = stream.subscribe((logs) => {
  console.log(logs);
});

//stop listening after 10 seconds
setTimeout(() => {
  unsub?.();
}, 10000);
