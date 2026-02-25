import { NextRequest, NextResponse } from "next/server";
import { addContactToResend } from "@/lib/resend";

/**
 * POST /api/newsletter/subscribe
 * Body: { email: string }
 * Adds the email to Resend as a contact. If RESEND_AUDIENCE_ID is set, the contact
 * is added to that audience (newsletter list).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const audienceId = process.env.RESEND_AUDIENCE_ID ?? null;
    const result = await addContactToResend({
      email,
      audienceId,
    });

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error ?? "Subscription failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
