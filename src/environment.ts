import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_USER: z.string(),
  DATABASE_HOST: z.string(),
  DATABASE_NAME: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_PORT: z.string().refine((val) => !isNaN(parseInt(val, 10)), {
    message: "DATABASE_PORT must be a valid number",
  }),
  DISABLE_SSL: z.string().optional(),
  PORT: z
    .string()
    .refine((val) => !isNaN(parseInt(val, 10)), {
      message: "PORT must be a valid number",
    })
    .optional(),
  API_TILES_URL: z.string(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error("Invalid environment variables:", env.error.format());
  process.exit(1);
}

const environment = env.data;
export default environment;
