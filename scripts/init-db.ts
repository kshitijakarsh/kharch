import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function initDb() {  
  const sql = neon(process.env.DATABASE_URL!);

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT PRIMARY KEY,
        monthly_salary DECIMAL(12, 2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        user_id BIGINT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name, user_id)
      );
    `;

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

    await sql`
      CREATE TABLE IF NOT EXISTS auth_codes (
        id SERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS incomes (
        id SERIAL PRIMARY KEY,
        amount DECIMAL(12, 2) NOT NULL,
        description TEXT,
        user_id BIGINT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // --- Performance Indexes ---
    await sql`CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_incomes_user ON incomes(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_auth_codes_user ON auth_codes(user_id)`;

  } catch (error) {
    console.error(" Database initialization failed:", error);
  } finally {
    process.exit(0);
  }
}

initDb();