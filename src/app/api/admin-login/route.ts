import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    const expected = process.env.ADMIN_PASSWORD;

    if (!expected) {
      return NextResponse.json(
        { error: "Admin password is not configured on the server." },
        { status: 500 }
      );
    }

    if (typeof password !== "string" || password !== expected) {
      return NextResponse.json(
        { error: "Incorrect password." },
        { status: 401 }
      );
    }

    // Password is correct
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("admin-login error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
