import { z } from "zod";

// This defines EXACTLY what we accept from LLM
export const ExpenseSchema = z.object({
  amount: z.number().positive(),
  category: z.string().min(1),
  description: z.string().optional(),
  isNewCategory: z.boolean(),
});

export type Expense = z.infer<typeof ExpenseSchema>;