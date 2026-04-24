import { pool } from "./db";

export async function updateUserSalary(userId: number, amount: number) {
  await pool.query(
    `INSERT INTO users (id, monthly_salary) 
     VALUES ($1, $2) 
     ON CONFLICT (id) DO UPDATE SET monthly_salary = $2`,
    [userId, amount]
  );
}

export async function getUserSalary(userId: number) {
  const res = await pool.query("SELECT monthly_salary FROM users WHERE id = $1", [userId]);
  return res.rows[0]?.monthly_salary ? parseFloat(res.rows[0].monthly_salary) : 0;
}
