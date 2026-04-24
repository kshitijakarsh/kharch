import { z } from "zod";

const BaseSchema = z.object({
  amount: z.number().positive(),
});

const ExpenseSchema = BaseSchema.extend({
  type: z.literal("expense"),
  category: z.string().min(1),
  description: z.string().optional(),
  isNewCategory: z.boolean(),
});

const SalarySchema = BaseSchema.extend({
  type: z.literal("salary_update"),
});

export const LLMResponseSchema = z.discriminatedUnion("type", [
  ExpenseSchema,
  SalarySchema,
]);

export type LLMResponse = z.infer<typeof LLMResponseSchema>;
export type Expense = z.infer<typeof ExpenseSchema>;