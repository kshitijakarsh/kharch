"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseSchema = void 0;
var zod_1 = require("zod");
// This defines EXACTLY what we accept from LLM
exports.ExpenseSchema = zod_1.z.object({
    amount: zod_1.z.number().positive(),
    category: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    isNewCategory: zod_1.z.boolean(),
});
