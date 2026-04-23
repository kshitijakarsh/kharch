import { NextRequest, NextResponse } from "next/server";
import getBot from "@/lib/bot";

export async function POST(request: NextRequest) {
  const update = await request.json();

  try {
    await getBot().handleUpdate(update);
  } catch (error) {
    console.error("Error handling update:", error);
  }

  return NextResponse.json({ status: "ok" });
}
