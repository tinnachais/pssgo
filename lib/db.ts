import { Pool } from "pg";

// using a global variable for NextJS HMR to avoid creating too many connections
// during hot reloading in development.
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

export const pool = globalForDb.pool ?? new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

// Helper query function
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};
