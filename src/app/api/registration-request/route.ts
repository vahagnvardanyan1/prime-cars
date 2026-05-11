import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

// Force dynamic execution — this route reads request body and sends mail per request.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Schema mirrors the Apply form. Email is optional because the form allows
// submitting without it (only fullName, phone, carsPerMonth are required in the UI).
// When provided, we set Reply-To so the admin can reply directly.
const schema = z.object({
  fullName: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(3).max(40),
  email: z
    .string()
    .trim()
    .email()
    .optional()
    .or(z.literal("")),
  carsPerMonth: z.enum(["upTo5", "5to20", "moreThan20"]),
});

const RECIPIENT = process.env.REGISTRATION_NOTIFICATION_EMAIL ?? "geghamsimonyan08@gmail.com";
const SENDER = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

// Email body is always Armenian — admin reads in one consistent language regardless
// of which locale the user was browsing in.
const HY = {
  subject: (name: string) => `Նոր գրանցման հայտ — ${name}`,
  title: "Նոր գրանցման հայտ",
  labels: {
    fullName: "Անուն, Ազգանուն",
    phone: "Հեռախոս",
    email: "Էլ. փոստ",
    carsPerMonth: "Մեքենաներ ամսական",
  },
  emailNotProvided: "չի նշվել",
  submittedAt: "Ուղարկվել է",
  cars: {
    upTo5: "Մինչև 5 մեքենա",
    "5to20": "5-20 մեքենա",
    moreThan20: "20-ից ավելի մեքենա",
  } as Record<z.infer<typeof schema>["carsPerMonth"], string>,
} as const;

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const buildHtml = (data: z.infer<typeof schema>, submittedAt: string): string => {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:14px 24px;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;width:160px;vertical-align:top;">${label}</td>
      <td style="padding:14px 24px;border-bottom:1px solid #f1f5f9;color:#0f172a;font-weight:500;">${value}</td>
    </tr>`;

  const emailCell = data.email
    ? escapeHtml(data.email)
    : `<em style="color:#94a3b8;font-style:normal;">${HY.emailNotProvided}</em>`;

  return `<!doctype html>
<html lang="hy">
  <body style="margin:0;padding:24px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="padding:20px 24px;background:#429de6;color:#ffffff;">
        <h1 style="margin:0;font-size:18px;font-weight:600;">${HY.title}</h1>
        <p style="margin:4px 0 0;font-size:13px;opacity:0.85;">Prime Cars · primecars.am</p>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        ${row(HY.labels.fullName, escapeHtml(data.fullName))}
        ${row(HY.labels.phone, escapeHtml(data.phone))}
        ${row(HY.labels.email, emailCell)}
        ${row(HY.labels.carsPerMonth, escapeHtml(HY.cars[data.carsPerMonth]))}
      </table>
      <div style="padding:16px 24px;background:#f8fafc;color:#94a3b8;font-size:11px;border-top:1px solid #e2e8f0;">
        ${HY.submittedAt} ${submittedAt}
      </div>
    </div>
  </body>
</html>`;
};

const buildText = (data: z.infer<typeof schema>, submittedAt: string): string =>
  [
    `${HY.title} — Prime Cars`,
    "",
    `${HY.labels.fullName}: ${data.fullName}`,
    `${HY.labels.phone}:        ${data.phone}`,
    `${HY.labels.email}:       ${data.email || HY.emailNotProvided}`,
    `${HY.labels.carsPerMonth}: ${HY.cars[data.carsPerMonth]}`,
    `${HY.submittedAt}:    ${submittedAt}`,
  ].join("\n");

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid form data", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const submittedAt = new Date().toISOString();
  const html = buildHtml(parsed.data, submittedAt);
  const text = buildText(parsed.data, submittedAt);

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: SENDER,
      to: RECIPIENT,
      ...(parsed.data.email ? { replyTo: parsed.data.email } : {}),
      subject: HY.subject(parsed.data.fullName),
      html,
      text,
    });

    if (error) {
      console.error("[registration-request] Resend error:", error);
      return NextResponse.json(
        { error: error.message ?? "Email delivery failed" },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[registration-request] Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
