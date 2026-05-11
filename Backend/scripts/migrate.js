import fs from "fs";
import path from "path";
import { pool } from "../src/config/db.js";

async function migrate() {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                filename TEXT UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

    const result = await pool.query("SELECT filename FROM migrations");

    const executed = result.rows.map((r) => r.filename);

    const files = fs.readdirSync("./migrations").sort();

    for (const file of files) {
      if (executed.includes(file)) {
        continue;
      }

      const sql = fs.readFileSync(path.join("./migrations", file), "utf8");

      console.log(`Running ${file}`);

      await pool.query(sql);

      await pool.query("INSERT INTO migrations(filename) VALUES($1)", [file]);
    }

    console.log("Migrations complete");
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

migrate();
