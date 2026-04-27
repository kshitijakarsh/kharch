import { NextRequest, NextResponse } from "next/server";
import { getUserCategories, findOrCreateCategory } from "@/lib/categories";
import { addExpense, getCustomStats } from "@/lib/expenses";
import { updateUserSalary } from "@/lib/users";
import { cookies } from "next/headers";
import { processAIRequest } from "@/lib/llm";
import { LLMResponseSchema } from "@/lib/validator";

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

    const extracted = await processAIRequest(text, categoryNames);
    const result = LLMResponseSchema.parse(extracted);
    
    if (result.type === 'query') {
      const total = await getCustomStats(parseInt(userId), result.category, result.start_date, result.end_date);
      const catMsg = result.category ? ` on ${result.category}` : "";
      return NextResponse.json({
        success: true,
        type: 'query',
        message: `You spent a total of ₹${total.toLocaleString()}${catMsg} between ${result.start_date} and ${result.end_date}.`
      });
    }

    if (result.type === 'salary_update') {
      await updateUserSalary(parseInt(userId), result.amount);
      return NextResponse.json({ 
        success: true, 
        type: 'salary_update',
        amount: result.amount,
        message: `Salary updated to ₹${result.amount.toLocaleString()}`
      });
    }

    if (result.type === 'expense') {
      const category = await findOrCreateCategory(result.category, parseInt(userId));
      await addExpense({
        ...result,
        amount: result.amount || 0,
        category: category.name,
        date: result.date,
        isNewCategory: false
      }, parseInt(userId), category.id);

      let message = `Recorded ₹${(result.amount || 0).toLocaleString()} for ${category.name}.`;
      if (result.date) {
        const formattedDate = new Date(result.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        message = `Recorded ₹${(result.amount || 0).toLocaleString()} for ${category.name} on ${formattedDate}.`;
      }

      return NextResponse.json({ 
        success: true, 
        type: 'expense',
        message,
        expense: {
          amount: result.amount || 0,
          category: category.name,
          description: result.description,
          date: result.date
        }
      });
    }

    if (result.type === 'unsupported') {
      return NextResponse.json({
        success: true,
        type: 'unsupported',
        message: result.message || "I'm not sure how to handle that. Try recording an expense!"
      });
    }

    return NextResponse.json({ error: "Unsupported command type" }, { status: 400 });

  } catch (error) {
    console.error("Command Processing Error:", error);
    return NextResponse.json({ error: "Failed to process command" }, { status: 500 });
  }
}
