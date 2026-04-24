import { NextRequest, NextResponse } from "next/server";
import { deleteExpense } from "@/lib/expenses";
import { cookies } from "next/headers";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(request.url);
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;
  const userId = sessionUserId || searchParams.get("userId");
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const success = await deleteExpense(parseInt(id), parseInt(userId));
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Expense not found or unauthorized" }, { status: 404 });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
