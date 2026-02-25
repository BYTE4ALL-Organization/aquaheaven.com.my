import { NextRequest, NextResponse } from "next/server";
import { addContactToResend } from "@/lib/resend";

/**
 * POST /api/newsletter/subscribe
 * Body: { email: string }
 * Adds the email to Resend as a contact and to your newsletter list (segment).
 * Requires RESEND_API_KEY and either RESEND_SEGMENT_ID or RESEND_AUDIENCE_ID so the
 * contact is added to a list in Resend.
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

    const segmentId = process.env.RESEND_SEGMENT_ID?.trim() || null;
    const audienceId = process.env.RESEND_AUDIENCE_ID?.trim() || null;
    if (!segmentId && !audienceId) {
      console.error("Newsletter: RESEND_SEGMENT_ID or RESEND_AUDIENCE_ID must be set so contacts are added to a list.");
      return NextResponse.json(
        { success: false, error: "Newsletter list not configured" },
        { status: 503 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Email service not configured" },
        { status: 503 }
      );
    }

    const result = await addContactToResend({
      email,
      segmentId: segmentId || undefined,
      audienceId: audienceId || undefined,
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
