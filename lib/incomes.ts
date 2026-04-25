import { pool } from "./db";
import { Income } from "./validator";

export const addIncome = async (
  income: Income,
  userId: number
) => {
  const res = await pool.query(
    "INSERT INTO incomes (amount, description, user_id) VALUES ($1, $2, $3) RETURNING *",
    [income.amount, income.description || "", userId]
  );
  return res.rows[0];
};

export const getMonthlyExtraIncome = async (userId: number) => {
  const res = await pool.query(
    `SELECT SUM(amount) as total 
     FROM incomes 
     WHERE user_id = $1 
     AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())`,
    [userId]
  );
  return res.rows[0]?.total ? parseFloat(res.rows[0].total) : 0;
};
