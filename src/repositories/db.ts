import { Pool, PoolConfig } from "pg";
import environment from "../environment";

let client: Pool;

const config: PoolConfig = {
  user: environment.DATABASE_USER,
  host: environment.DATABASE_HOST,
  database: environment.DATABASE_NAME,
  password: environment.DATABASE_PASSWORD,
  port: parseInt(environment.DATABASE_PORT || "5432"),
  ssl: environment.DISABLE_SSL ? false : { rejectUnauthorized: false },
};

try {
  const pool = new Pool(config);
  client = pool;
} catch (error) {
  process.exit(1);
}

export default client;
