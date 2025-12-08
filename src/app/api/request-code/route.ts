import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import nodemailer from "nodemailer";

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

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error("SMTP settings are not fully configured");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: { user, pass },
  });
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const normalized = (email || "").trim().toLowerCase();

    if (!PENN_EMAIL_REGEX.test(normalized)) {
      return NextResponse.json(
        { error: "Please use a valid Penn email" },
        { status: 400 }
      );
    }

    const code = generateCode();
    const secretKey = getSecretKey();

    const token = await new SignJWT({ email: normalized, code })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("10m")
      .sign(secretKey);

    const transporter = getTransport();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER!;

    await transporter.sendMail({
      from,
      to: normalized,
      subject: "Your LocustGrub verification code",
      text: `Your LocustGrub verification code is ${code}. It expires in 10 minutes.`,
    });

    return NextResponse.json({ ok: true, token });
  } catch (error) {
    console.error("request-code error:", error);
    return NextResponse.json(
      { error: "Could not send verification email" },
      { status: 500 }
    );
  }
}
