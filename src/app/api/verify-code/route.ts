import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

function getSecretKey() {
  const secret = process.env.EMAIL_TOKEN_SECRET;
  if (!secret) {
    throw new Error("EMAIL_TOKEN_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function POST(request: Request) {
  try {
    const { email, code, token } = await request.json();

    const normalizedEmail = (email || "").trim().toLowerCase();
    const codeStr = String(code || "").trim();
    const tokenStr = String(token || "").trim();

    if (!normalizedEmail || !codeStr || !tokenStr) {
      return NextResponse.json(
        { error: "Email, code, and token are required" },
        { status: 400 }
      );
    }

    const secretKey = getSecretKey();

    const { payload } = await jwtVerify(tokenStr, secretKey);

    const payloadEmail = String(payload.email || "");
    const payloadCode = String(payload.code || "");

    if (normalizedEmail !== payloadEmail) {
      return NextResponse.json(
        { error: "Email does not match token" },
        { status: 400 }
      );
    }

    if (codeStr !== payloadCode) {
      return NextResponse.json(
        { error: "Incorrect code" },
        { status: 400 }
      );
    }

    // if we reached here, the token was valid and not expired, and the code matches
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("verify-code error:", error);
    return NextResponse.json(
      { error: "Could not verify code. It may be expired or invalid." },
      { status: 400 }
    );
  }
}
