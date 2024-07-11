import { z } from "zod";

export const statsSchema = z.object({
  tenant: z.string(),
  start: z.string().pipe(z.coerce.date()),
  end: z.string().pipe(z.coerce.date()),
  swX: z.string().pipe(z.coerce.number()),
  swY: z.string().pipe(z.coerce.number()),
  neX: z.string().pipe(z.coerce.number()),
  neY: z.string().pipe(z.coerce.number()),
});
