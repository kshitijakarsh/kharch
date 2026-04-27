import { z } from "zod";

const BaseSchema = z.object({
  amount: z.number().positive(),
});

const ExpenseSchema = BaseSchema.extend({
  type: z.literal("expense"),
  category: z.string().min(1),
  description: z.string().optional(),
  date: z.string().optional(),
  isNewCategory: z.boolean(),
});

const SalarySchema = BaseSchema.extend({
  type: z.literal("salary_update"),
});

const IncomeSchema = BaseSchema.extend({
  type: z.literal("extra_income"),
  description: z.string().optional(),
});

const QuerySchema = z.object({
  type: z.literal("query"),
  category: z.string().nullable(),
  start_date: z.string(),
  end_date: z.string(),
});

const UnsupportedSchema = z.object({
  type: z.literal("unsupported"),
  message: z.string().optional(),
});

export const LLMResponseSchema = z.discriminatedUnion("type", [
  ExpenseSchema.extend({ amount: z.number().optional() }), // In case AI misses it
  SalarySchema,
  IncomeSchema,
  QuerySchema,
  UnsupportedSchema,
]);

export type LLMResponse = z.infer<typeof LLMResponseSchema>;
export type Expense = z.infer<typeof ExpenseSchema>;
export type Income = z.infer<typeof IncomeSchema>;
export type Query = z.infer<typeof QuerySchema>;