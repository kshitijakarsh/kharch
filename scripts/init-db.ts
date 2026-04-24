import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function initDb() {
  console.log("🚀 Initializing database (HTTP)...");
  
  const sql = neon(process.env.DATABASE_URL!);

  try {
    console.log("Creating categories table...");
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        user_id BIGINT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name, user_id)
      );
    `;

    console.log("Creating expenses table...");
    await sql`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        amount DECIMAL(12, 2) NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        description TEXT,
        user_id BIGINT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;


    console.log("✅ Database initialized successfully!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
  } finally {
    process.exit(0);
  }
}

initDb();