import { NextResponse } from "next/server";

// Resend test endpoint disabled after switching to SMTP.
export async function GET() {
  return NextResponse.json({ ok: false, error: "resend test disabled" }, { status: 404 });
}
