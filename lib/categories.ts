import { pool } from "./db";

// Fetch all categories for a user
export const getUserCategories = async (userId: number) => {
  const res = await pool.query(
    "SELECT * FROM categories WHERE user_id=$1",
    [userId]
  );
  return res.rows;
};

// Find or create category
export const findOrCreateCategory = async (
  name: string,
  userId: number
) => {
  const normalized = name.toLowerCase().trim();

  let res = await pool.query(
    "SELECT * FROM categories WHERE name=$1 AND user_id=$2",
    [normalized, userId]
  );

  if (res.rowCount === 0) {
    res = await pool.query(
      "INSERT INTO categories (name, user_id) VALUES ($1,$2) RETURNING *",
      [normalized, userId]
    );
  }

  return res.rows[0];
};