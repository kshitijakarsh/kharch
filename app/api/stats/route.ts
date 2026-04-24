import { NextRequest, NextResponse } from "next/server";
import { getStats, getDailyStats } from "@/lib/expenses";
import { getUserSalary } from "@/lib/users";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;
  const userId = sessionUserId || searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const [week, month, daily, salary] = await Promise.all([
      getStats(parseInt(userId), "week"),
      getStats(parseInt(userId), "month"),
      getDailyStats(parseInt(userId)),
      getUserSalary(parseInt(userId)),
    ]);
    return NextResponse.json({ week, month, daily, salary });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
