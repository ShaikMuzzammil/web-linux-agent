import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    // Validation
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    if (message.trim().length < 10) {
      return NextResponse.json({ error: "Message must be at least 10 characters." }, { status: 400 });
    }

    const session = await auth();

    // Save to DB (non-blocking — don't fail the request if DB is down)
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.contactMessage.create({
        data: {
          name:    name.trim(),
          email:   email.trim().toLowerCase(),
          subject: subject.trim(),
          message: message.trim(),
          userId:  session?.user?.id ?? null,
        },
      });
    } catch (dbErr) {
      console.error("[contact] DB save failed (non-fatal):", dbErr);
    }

    // Send emails (non-blocking)
    try {
      const { sendContactEmail, sendConfirmationEmail } = await import("@/lib/resend");
      await Promise.allSettled([
        sendContactEmail({ name, email, subject, message }),
        sendConfirmationEmail({ name, email, subject }),
      ]);
    } catch (emailErr) {
      console.error("[contact] Email send failed (non-fatal):", emailErr);
    }

    return NextResponse.json({ success: true, message: "Message sent!" });
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to send. Please try again later." },
      { status: 500 }
    );
  }
}
