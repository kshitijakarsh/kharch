import { NextRequest, NextResponse } from "next/server";
import { extractExpense } from "@/lib/llm";
import { getUserCategories, findOrCreateCategory } from "@/lib/categories";
import { addExpense } from "@/lib/expenses";
import { ExpenseSchema } from "@/lib/validator";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user_id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await getUserCategories(parseInt(userId));
    const categoryNames = categories.map((c: any) => c.name);

    const extracted = await extractExpense(text, categoryNames);
    const expense = ExpenseSchema.parse(extracted);

    const category = await findOrCreateCategory(expense.category, parseInt(userId));
    await addExpense(expense, parseInt(userId), category.id);

    return NextResponse.json({ 
      success: true, 
      expense: {
        ...expense,
        category: category.name
      }
    });
  } catch (error) {
    console.error("AI Extraction Error:", error);
    return NextResponse.json({ error: "Failed to parse expense" }, { status: 500 });
  }
}
