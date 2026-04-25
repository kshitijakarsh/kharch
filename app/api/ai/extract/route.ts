import { NextRequest, NextResponse } from "next/server";
import { getUserCategories, findOrCreateCategory } from "@/lib/categories";
import { addExpense } from "@/lib/expenses";
import { updateUserSalary } from "@/lib/users";
import { cookies } from "next/headers";
import { parseManualCommand } from "@/lib/parser";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user_id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = parseManualCommand(text);
    
    if (!parsed) {
      return NextResponse.json({ error: "Invalid command format. Use /add <amount> <category> [note]" }, { status: 400 });
    }

    if (parsed.type === 'salary_update') {
      await updateUserSalary(parseInt(userId), parsed.amount);
      return NextResponse.json({ 
        success: true, 
        type: 'salary_update',
        amount: parsed.amount,
        message: `Salary updated to ₹${parsed.amount.toLocaleString()}`
      });
    }

    // Expense logic
    if (parsed.type === 'expense') {
      const category = await findOrCreateCategory(parsed.category!, parseInt(userId));
      await addExpense({
        type: 'expense',
        amount: parsed.amount,
        category: category.name,
        description: parsed.description,
        isNewCategory: false
      }, parseInt(userId), category.id);

      return NextResponse.json({ 
        success: true, 
        type: 'expense',
        expense: {
          amount: parsed.amount,
          category: category.name,
          description: parsed.description
        }
      });
    }

    return NextResponse.json({ error: "Unsupported command type" }, { status: 400 });

  } catch (error) {
    console.error("Command Processing Error:", error);
    return NextResponse.json({ error: "Failed to process command" }, { status: 500 });
  }
}
