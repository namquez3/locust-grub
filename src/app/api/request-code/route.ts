import { NextResponse } from "next/server";
import { Resend } from "resend";
import { SignJWT } from "jose";

const PENN_EMAIL_REGEX = /^[^@]+@([^.]+\.)?upenn\.edu$/;

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getSecretKey() {
  const secret = process.env.EMAIL_TOKEN_SECRET;
  if (!secret) {
    throw new Error("EMAIL_TOKEN_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const normalized = (email || "").trim().toLowerCase();

    if (!PENN_EMAIL_REGEX.test(normalized)) {
      return NextResponse.json(
        { error: "Please use a valid Penn email (upenn.edu)" },
        { status: 400 }
      );
    }

    const code = generateCode();
    const secretKey = getSecretKey();

    const token = await new SignJWT({
      email: normalized,
      code,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("10m")
      .sign(secretKey);

    // send the email
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY is not set");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const from = process.env.RESEND_FROM || "LocustGrub <onboarding@resend.dev>";

    const result = await resend.emails.send({
      from,
      to: normalized,
      subject: "Your LocustGrub verification code",
      text: `Your LocustGrub verification code is ${code}. It expires in 10 minutes.`,
    });

    if (result.error) {
      console.error("Resend error:", result.error);
      return NextResponse.json(
        { error: "Could not send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, token });
  } catch (error) {
    console.error("request-code error:", error);
    return NextResponse.json(
      { error: "Could not send verification email" },
      { status: 500 }
    );
  }
}
