import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      // No API key configured — just return success silently
      return NextResponse.json({ ok: true, note: 'Email not configured' });
    }

    await resend.emails.send({
      from: 'WebLinuxOS <noreply@yourdomain.com>',
      to: process.env.CONTACT_EMAIL || email,
      subject: `Contact from ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Contact route error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
