import { NextRequest, NextResponse } from "next/server";
import getBot from "@/lib/bot";

let isInitialized = false;

export async function POST(request: NextRequest) {
  const update = await request.json();

  try {
    if (!isInitialized) {
      await getBot().init();
      isInitialized = true;
    }

    await getBot().handleUpdate(update);
  } catch (error) {
    console.error("Error handling update:", error);
  }

  return NextResponse.json({ status: "ok" });
}
