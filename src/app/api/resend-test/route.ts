import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const from = process.env.RESEND_FROM || "LocustGrub <onboarding@resend.dev>";
    const to = "kelechitobike@upenn.edu";

    const result = await resend.emails.send({
      from,
      to,
      subject: "Resend test from LocustGrub",
      text: "If you see this, Resend is working.",
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("resend-test error:", error);
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    );
  }
}
