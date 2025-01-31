import { isHex } from "viem";
import { z } from "zod";

/** Schema for filtering logs. */
export const filterSchema = z.object({
  address: z.string().refine(isHex).optional(),
  filters: z
    .array(
      z.object({
        tableId: z.string().refine(isHex),
        key0: z.string().refine(isHex).optional(),
        key1: z.string().refine(isHex).optional(),
      }),
    )
    .default([]),
});

/** Schema for including columns in the query. */
const includeClauseSchema = z.array(
  z.object({
    tableId: z.string().refine(isHex),
    on: z.string().default("__key_bytes"),
  }),
);

/** Schema for a where clause. */
const whereClauseSchema = z.object({
  column: z.coerce.string(),
  operation: z.enum(["eq", "neq", "lt", "lte", "gt", "gte"]),
  value: z.coerce.string(),
});

/** Schema for a query. */
export const querySchema = z
  .object({
    tableId: z.string().refine(isHex),
    where: whereClauseSchema.optional(),
    and: whereClauseSchema.array().optional(),
    or: whereClauseSchema.array().optional(),
    include: includeClauseSchema.optional(),
  })
  .refine(
    (data) => {
      const fields = ["where", "and", "or"];
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const definedFields = fields.filter((field) => data[field] !== undefined);
      return definedFields.length <= 1;
    },
    {
      message: "Only one of 'where', 'and', or 'or' can be defined at a time",
      path: ["where", "and", "or"],
    },
  );

/** Schema for a database query. */
export const dbQuerySchema = z.object({
  address: z.string().refine(isHex),
  queries: z.array(querySchema),
});
