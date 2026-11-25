// Receives the contact form. Delivers by email through Resend when RESEND_API_KEY and CONTACT_TO_EMAIL are set;
// otherwise answers 503 and the form falls back to the visitor's own mail app.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // hidden field real visitors never fill in; pretend success to bots
  if (data.website) return Response.json({ ok: true });

  const name = String(data.name ?? "").trim();
  const email = String(data.email ?? "").trim();
  const subject = String(data.subject ?? "").trim() || "General enquiry";
  const message = String(data.message ?? "").trim();

  if (!name || name.length > 100) return Response.json({ error: "Please enter your name." }, { status: 400 });
  if (!EMAIL.test(email) || email.length > 200) return Response.json({ error: "Please enter a valid email." }, { status: 400 });
  if (message.length < 10 || message.length > 5000)
    return Response.json({ error: "Please write a message of 10 to 5000 characters." }, { status: 400 });

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!key || !to) return Response.json({ error: "not-configured" }, { status: 503 });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL ?? "IEEE KhCE Website <onboarding@resend.dev>",
      to,
      reply_to: email,
      subject: `[Website] ${subject.slice(0, 120)}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    }),
  });
  if (!res.ok) return Response.json({ error: "Could not send your message. Please try again." }, { status: 502 });
  return Response.json({ ok: true });
}
