import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const db = {
  query: async (text, params) => {
    const client = await pool.connect();

    try {
      return await client.query(text, params);
    } catch (error) {
      console.error(error);
    } finally {
      client.release();
    }
  },
};

export { db, pool };
