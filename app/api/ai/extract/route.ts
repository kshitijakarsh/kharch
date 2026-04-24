import { NextRequest, NextResponse } from "next/server";
import { extractExpense } from "@/lib/llm";
import { getUserCategories, findOrCreateCategory } from "@/lib/categories";
import { addExpense } from "@/lib/expenses";
import { updateUserSalary } from "@/lib/users";
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
    
    if (extracted.type === 'salary_update') {
      await updateUserSalary(parseInt(userId), extracted.amount);
      return NextResponse.json({ 
        success: true, 
        type: 'salary_update',
        amount: extracted.amount,
        message: `Salary updated to ₹${extracted.amount.toLocaleString()}`
      });
    }

    // Expense logic
    const category = await findOrCreateCategory(extracted.category, parseInt(userId));
    await addExpense(extracted, parseInt(userId), category.id);

    return NextResponse.json({ 
      success: true, 
      type: 'expense',
      expense: {
        ...extracted,
        category: category.name
      }
    });
  } catch (error) {
    console.error("AI Extraction Error:", error);
    return NextResponse.json({ error: "Failed to parse input" }, { status: 500 });
  }
}
