import { NextRequest, NextResponse } from "next/server";
import getBot from "@/lib/bot";

let isInitialized = false;

export async function POST(request: NextRequest) {
  const update = await request.json();
  const bot = getBot();

  try {
    if (!isInitialized) {
      await bot.init();
      isInitialized = true;
    }

    await bot.handleUpdate(update);
  } catch (error) {
    console.error("Error handling update:", error);
  }

  return NextResponse.json({ status: "ok" });
}
