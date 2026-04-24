import { pool } from "./db";
import { Expense } from "./validator";

export const addExpense = async (
  expense: Expense,
  userId: number,
  categoryId: number
) => {
  const res = await pool.query(
    "INSERT INTO expenses (amount, description, category_id, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
    [expense.amount, expense.description || "", categoryId, userId]
  );
  return res.rows[0];
};

export const getRecentExpenses = async (userId: number, limit: number = 5) => {
  const res = await pool.query(
    `SELECT e.*, c.name as category_name 
     FROM expenses e 
     JOIN categories c ON e.category_id = c.id 
     WHERE e.user_id = $1 
     ORDER BY e.created_at DESC 
     LIMIT $2`,
    [userId, limit]
  );
  return res.rows;
};

export const deleteExpense = async (id: number, userId: number) => {
  const res = await pool.query(
    "DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING *",
    [id, userId]
  );
  return res.rowCount !== 0;
};

export const getStats = async (userId: number, period: "week" | "month") => {
  const interval = period === "week" ? "7 days" : "1 month";
  const res = await pool.query(
    `SELECT c.name as category, SUM(e.amount) as total
     FROM expenses e
     JOIN categories c ON e.category_id = c.id
     WHERE e.user_id = $1 AND e.created_at > NOW() - INTERVAL '${interval}'
     GROUP BY c.name
     ORDER BY total DESC`,
    [userId]
  );
  return res.rows;
};

/** Daily spending totals for the current calendar month.
 *  Returns rows like { day: "Apr 01", total: "1250.00" }
 *  ordered by date ascending so the line chart plots left→right. */
export const getDailyStats = async (userId: number) => {
  const res = await pool.query(
    `SELECT TO_CHAR(DATE_TRUNC('day', e.created_at), 'Mon DD') AS day,
            SUM(e.amount) AS total
     FROM expenses e
     WHERE e.user_id = $1
       AND DATE_TRUNC('month', e.created_at) = DATE_TRUNC('month', NOW())
     GROUP BY DATE_TRUNC('day', e.created_at)
     ORDER BY DATE_TRUNC('day', e.created_at) ASC`,
    [userId]
  );
  return res.rows;
};
