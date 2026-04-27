import { NextRequest, NextResponse } from "next/server";
import { getStats, getDailyStats, getRecentExpenses } from "@/lib/expenses";
import { getUserSalary } from "@/lib/users";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;
  const userId = sessionUserId || searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const uid = parseInt(userId);
    const [week, month, daily, expenses, salary] = await Promise.all([
      getStats(uid, "week"),
      getStats(uid, "month"),
      getDailyStats(uid),
      getRecentExpenses(uid, 50),
      getUserSalary(uid),
    ]);

    return NextResponse.json({
      user: { userId, isLoggedIn: true },
      stats: { week, month, daily, salary },
      expenses
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
