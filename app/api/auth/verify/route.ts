import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    // Check code in DB - find the user associated with this code
    const res = await pool.query(
      "SELECT user_id FROM auth_codes WHERE code = $1 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
      [code]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
    }

    const userId = res.rows[0].user_id;

    // Set a session cookie
    const cookieStore = await cookies();
    cookieStore.set("session_user_id", userId.toString(), {

      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    // Optional: Delete the code after use
    await pool.query("DELETE FROM auth_codes WHERE user_id = $1", [userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
