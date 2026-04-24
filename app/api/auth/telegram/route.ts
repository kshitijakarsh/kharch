import { NextRequest, NextResponse } from "next/server";
import { validateTelegramData, parseTelegramUser } from "@/lib/telegramAuth";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { initData } = await request.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return NextResponse.json({ error: "Bot token not configured" }, { status: 500 });
    }

    const isValid = validateTelegramData(initData, botToken);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid Telegram data" }, { status: 401 });
    }

    const user = parseTelegramUser(initData);
    if (!user || !user.id) {
      return NextResponse.json({ error: "User data missing" }, { status: 400 });
    }

    // Set a session cookie
    const cookieStore = await cookies();
    cookieStore.set("session_user_id", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
