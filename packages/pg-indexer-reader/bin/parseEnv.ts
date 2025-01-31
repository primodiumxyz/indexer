import { isHex } from "viem";
import { z, ZodError, ZodTypeAny } from "zod";

// Host and port the indexer is listening on
export const frontendEnvSchema = z.object({
  INDEXER_HOST: z.string().default("0.0.0.0"),
  INDEXER_PORT: z.coerce.number().positive().default(3001),
});

// Configuration for the MUD indexer writer
export const indexerEnvSchema = z.intersection(
  z.object({
    // The block it should start indexing from
    START_BLOCK: z.coerce.bigint().nonnegative().default(0n),
    // The maximum amount of blocks to fetch and store per batch
    MAX_BLOCK_RANGE: z.coerce.bigint().positive().default(1000n),
    // The polling interval in milliseconds
    POLLING_INTERVAL: z.coerce.number().positive().default(1000),
    // The address of the world contract
    STORE_ADDRESS: z
      .string()
      .optional()
      .transform((input) => (input === "" ? undefined : input))
      .refine((input) => input === undefined || isHex(input)),
  }),
  z.union([
    // The URL and WebSocket URL of the RPC endpoint
    z.object({
      RPC_HTTP_URL: z.string(),
      RPC_WS_URL: z.string().optional(),
    }),
    z.object({
      RPC_HTTP_URL: z.string().optional(),
      RPC_WS_URL: z.string(),
    }),
  ]),
);

// Parse and validate the environment variables
export function parseEnv<TSchema extends ZodTypeAny>(envSchema: TSchema): z.infer<TSchema> {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof ZodError) {
      const { _errors, ...invalidEnvVars } = error.format();
      console.error(`\nMissing or invalid environment variables:\n\n  ${Object.keys(invalidEnvVars).join("\n  ")}\n`);
      process.exit(1);
    }
    throw error;
  }
}
