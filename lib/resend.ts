import { Resend } from "resend";

// Lazy init — only instantiated when an email is actually sent (not at module load)
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

export const OWNER_EMAIL  = "muzzammil160806@gmail.com";
export const FROM_EMAIL   = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

export async function sendContactEmail({
  name, email, subject, message,
}: {
  name: string; email: string; subject: string; message: string;
}) {
  return getResend().emails.send({
    from:    `Web Linux Agent <${FROM_EMAIL}>`,
    to:      [OWNER_EMAIL],
    replyTo: email,
    subject: `[Portfolio] ${subject}`,
    html: `
<!DOCTYPE html><html><head>
<style>
  body{font-family:'Ubuntu',sans-serif;background:#1a1a2e;color:#eee;margin:0;padding:0}
  .wrap{max-width:600px;margin:40px auto;background:#16213e;border-radius:12px;overflow:hidden;border:1px solid #E95420}
  .hdr{background:linear-gradient(135deg,#E95420,#772953);padding:28px;text-align:center}
  .hdr h1{color:#fff;margin:0;font-size:22px}
  .body{padding:28px}
  .lbl{color:#E95420;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px}
  .val{color:#eee;font-size:15px;padding:10px 14px;background:#1a1a2e;border-radius:8px;border-left:3px solid #E95420;margin-bottom:16px}
  .msg{white-space:pre-wrap;line-height:1.6}
  .ftr{background:#0f0f1a;padding:18px;text-align:center;color:#555;font-size:12px}
</style></head><body>
<div class="wrap">
  <div class="hdr"><h1>🐧 New Portfolio Message</h1></div>
  <div class="body">
    <div class="lbl">From</div><div class="val">${name} &lt;${email}&gt;</div>
    <div class="lbl">Subject</div><div class="val">${subject}</div>
    <div class="lbl">Message</div><div class="val msg">${message}</div>
  </div>
  <div class="ftr">Web Linux Agent · muzzammil160806@gmail.com</div>
</div></body></html>`,
  });
}

export async function sendConfirmationEmail({
  name, email, subject,
}: {
  name: string; email: string; subject: string;
}) {
  return getResend().emails.send({
    from:    `Shaik Muzzammil <${FROM_EMAIL}>`,
    to:      [email],
    subject: `Got your message! Re: ${subject}`,
    html: `
<!DOCTYPE html><html><head>
<style>
  body{font-family:'Ubuntu',sans-serif;background:#1a1a2e;color:#eee;margin:0;padding:0}
  .wrap{max-width:600px;margin:40px auto;background:#16213e;border-radius:12px;overflow:hidden;border:1px solid #E95420}
  .hdr{background:linear-gradient(135deg,#E95420,#772953);padding:28px;text-align:center}
  .hdr h1{color:#fff;margin:0;font-size:22px}
  .body{padding:28px;color:#ccc;line-height:1.7}
  .hi{color:#E95420;font-weight:600}
  .ftr{background:#0f0f1a;padding:18px;text-align:center;color:#555;font-size:12px}
  a{color:#E95420;text-decoration:none}
</style></head><body>
<div class="wrap">
  <div class="hdr"><h1>👋 Thanks, ${name}!</h1></div>
  <div class="body">
    <p>Hey <span class="hi">${name}</span>,</p>
    <p>Thanks for reaching out! I received your message about <strong>"${subject}"</strong> and I'll reply within 24–48 hours.</p>
    <p>In the meantime:</p>
    <ul>
      <li><a href="https://github.com/ShaikMuzzammil">GitHub — ShaikMuzzammil</a></li>
      <li><a href="https://linkedin.com/in/shaik-muzzammil">LinkedIn Profile</a></li>
    </ul>
    <p>Best,<br><span class="hi">Shaik Muzzammil</span><br>CSE Student · Full Stack Developer · Chennai</p>
  </div>
  <div class="ftr">
    <a href="https://github.com/ShaikMuzzammil">GitHub</a> ·
    <a href="https://linkedin.com/in/shaik-muzzammil">LinkedIn</a> ·
    muzzammil160806@gmail.com
  </div>
</div></body></html>`,
  });
}
