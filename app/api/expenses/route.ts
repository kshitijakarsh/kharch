import { NextRequest, NextResponse } from "next/server";
import { getRecentExpenses } from "@/lib/expenses";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;
  const userId = sessionUserId || searchParams.get("userId");
  const limit = searchParams.get("limit") || "10";

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const expenses = await getRecentExpenses(parseInt(userId), parseInt(limit));
    return NextResponse.json(expenses);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}
