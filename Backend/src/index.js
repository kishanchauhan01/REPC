import dotenv from "dotenv";
dotenv.config();

import { app } from "./app.js";
import { db } from "./configs/db.js";

const PORT = process.env.PORT || 3002;

async function connectWithRetry(retries = 10) {
  while (retries) {
    try {
      await db.query("SELECT 1");
      console.log("✅ Database connected");
      return;
    } catch (error) {
      console.log("⏳ Waiting for database...");
      retries--;

      await new Promise((res) => setTimeout(res, 3000));
    }
  }

  throw new Error("Database connection failed");
}

async function startServer() {
  try {
    await connectWithRetry();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌", error.message);
    process.exit(1);
  }
}

startServer();
