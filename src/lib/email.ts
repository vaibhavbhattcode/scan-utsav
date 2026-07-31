/**
 * ScanUtsav — Centralized Email Service
 * Uses Resend (https://resend.com) when RESEND_API_KEY is set.
 * Falls back to a console log stub in development when key is missing.
 */

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

// ── Brand Colors ────────────────────────────────────────
const BRAND_ORANGE = "#F2810C";
const BRAND_DARK = "#0F172A";

// ── Base HTML wrapper ────────────────────────────────────
function wrapEmailHTML(bodyContent: string, previewText?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ScanUtsav</title>
</head>
<body style="margin:0;padding:0;background:#FAF9F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  ${previewText ? `<span style="display:none;font-size:1px;color:#FAF9F6;max-height:0;max-width:0;opacity:0;overflow:hidden;">${previewText}</span>` : ""}
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <!-- Header -->
    <div style="text-align:center;padding:24px 0 16px;">
      <h1 style="color:${BRAND_ORANGE};font-size:26px;font-weight:900;margin:0;letter-spacing:-0.5px;">
        Scan<span style="color:${BRAND_DARK}">Utsav</span>
      </h1>
      <p style="color:#64748B;font-size:11px;margin:4px 0 0;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">
        Relive Forever
      </p>
    </div>

    <!-- Body Card -->
    <div style="background:#FFFFFF;border-radius:20px;padding:32px;border:1px solid #E2E8F0;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      ${bodyContent}
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:20px 0;color:#94A3B8;font-size:10px;line-height:1.6;">
      <p style="margin:0;">ScanUtsav EventTech Solutions Pvt. Ltd. · Mumbai & Bengaluru, India</p>
      <p style="margin:4px 0 0;">
        <a href="https://scanutsav.com/privacy" style="color:#F2810C;text-decoration:none;">Privacy Policy</a>
        &nbsp;·&nbsp;
        <a href="https://scanutsav.com/terms" style="color:#F2810C;text-decoration:none;">Terms</a>
        &nbsp;·&nbsp;
        <a href="https://scanutsav.com/refund" style="color:#F2810C;text-decoration:none;">Refund Policy</a>
      </p>
      <p style="margin:6px 0 0;">DPDP Act 2023 Compliant · GSTIN: 27AAAAA0000A1Z5</p>
    </div>
  </div>
</body>
</html>`;
}

// ── Core send function ───────────────────────────────────
export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "ScanUtsav <noreply@scanutsav.com>";

  if (!resendKey || resendKey.includes("REPLACE") || resendKey === "re_REPLACE_WITH_YOUR_RESEND_KEY") {
    // Development stub — log to console
    console.log("\n📧 [EMAIL STUB — Resend not configured]");
    console.log("  To:", Array.isArray(payload.to) ? payload.to.join(", ") : payload.to);
    console.log("  Subject:", payload.subject);
    console.log("  (Set RESEND_API_KEY in .env to send real emails)\n");
    return { success: true, messageId: `stub_${Date.now()}` };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);

    const result = await resend.emails.send({
      from,
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      subject: payload.subject,
      html: payload.html,
      ...(payload.replyTo ? { reply_to: payload.replyTo } : {}),
    });

    if (result.error) {
      console.error("Resend error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (err: any) {
    console.error("Email send failed:", err.message);
    return { success: false, error: err.message };
  }
}

// ══════════════════════════════════════════════════════════
// ── Email Templates ────────────────────────────────────────
// ══════════════════════════════════════════════════════════

/** Welcome email sent to new host on registration */
export async function sendWelcomeEmail(to: string, name: string) {
  const html = wrapEmailHTML(`
    <h2 style="color:${BRAND_DARK};font-size:22px;font-weight:900;margin:0 0 8px;">Welcome to ScanUtsav, ${name}! 🎉</h2>
    <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 20px;">
      Your host account is ready. You can now create your first event memory portal in under 60 seconds!
    </p>
    <div style="background:#FFF8F0;border:2px solid ${BRAND_ORANGE};border-radius:12px;padding:20px;margin:0 0 24px;">
      <p style="color:#92400E;font-size:11px;font-weight:800;text-transform:uppercase;margin:0 0 4px;letter-spacing:0.05em;">Quick Start</p>
      <ol style="color:#334155;font-size:13px;margin:0;padding-left:20px;line-height:2;">
        <li>Create your first event from the Host Dashboard</li>
        <li>Download or print your unique QR code / standee</li>
        <li>Share with guests — they scan and upload instantly!</li>
        <li>Watch photos appear live on your venue TV screen</li>
      </ol>
    </div>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://scanutsav.com"}/dashboard"
       style="display:inline-block;background:${BRAND_ORANGE};color:#fff;font-weight:900;font-size:14px;padding:12px 28px;border-radius:12px;text-decoration:none;">
      Go to Host Dashboard →
    </a>
    <p style="color:#94A3B8;font-size:11px;margin:20px 0 0;">
      Questions? Reply to this email or WhatsApp us at +91 98765 43210
    </p>
  `, "Your ScanUtsav host account is ready — create your first event!");

  return sendEmail({
    to,
    subject: "🎉 Welcome to ScanUtsav — Your Host Account is Ready!",
    html,
  });
}

/** Contact form inquiry — notify admin */
export async function sendContactNotificationEmail(opts: {
  name: string;
  email: string;
  category: string;
  message: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || "concierge@scanutsav.com";

  const html = wrapEmailHTML(`
    <h2 style="color:${BRAND_DARK};font-size:20px;font-weight:900;margin:0 0 16px;">📬 New Contact Inquiry</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <tr><td style="padding:8px 0;color:#64748B;font-weight:600;width:120px;">Name:</td><td style="color:${BRAND_DARK};font-weight:700;">${opts.name}</td></tr>
      <tr><td style="padding:8px 0;color:#64748B;font-weight:600;">Email:</td><td style="color:${BRAND_ORANGE};font-weight:700;">${opts.email}</td></tr>
      <tr><td style="padding:8px 0;color:#64748B;font-weight:600;">Category:</td><td style="color:${BRAND_DARK};font-weight:700;">${opts.category.toUpperCase()}</td></tr>
    </table>
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:16px;margin:16px 0;">
      <p style="color:#64748B;font-size:11px;font-weight:700;text-transform:uppercase;margin:0 0 8px;">Message:</p>
      <p style="color:${BRAND_DARK};font-size:14px;line-height:1.6;margin:0;">${opts.message}</p>
    </div>
    <a href="mailto:${opts.email}?subject=Re: Your ScanUtsav Inquiry"
       style="display:inline-block;background:${BRAND_ORANGE};color:#fff;font-weight:900;font-size:13px;padding:10px 22px;border-radius:10px;text-decoration:none;">
      Reply to ${opts.name}
    </a>
  `, `New inquiry from ${opts.name}`);

  // Also send acknowledgment to the user
  const ackHtml = wrapEmailHTML(`
    <h2 style="color:${BRAND_DARK};font-size:20px;font-weight:900;margin:0 0 8px;">Thanks for reaching out, ${opts.name}! 🙏</h2>
    <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 16px;">
      We've received your inquiry and our team will respond within <strong>2 working hours</strong>.
    </p>
    <div style="background:#F0FDF4;border:1px solid #86EFAC;border-radius:10px;padding:14px;margin:0 0 20px;">
      <p style="color:#14532D;font-size:13px;margin:0;font-weight:600;">
        ✅ Your inquiry has been logged.<br/>
        📧 Expect a reply at: <strong>${opts.email}</strong>
      </p>
    </div>
    <p style="color:#64748B;font-size:12px;">
      Need immediate help? WhatsApp us at <strong>+91 98765 43210</strong> (9 AM–9 PM IST)
    </p>
  `, "We received your inquiry and will reply within 2 hours.");

  const [adminResult, ackResult] = await Promise.all([
    sendEmail({ to: adminEmail, subject: `📬 New Contact: ${opts.category} — ${opts.name}`, html, replyTo: opts.email }),
    sendEmail({ to: opts.email, subject: "✅ We received your ScanUtsav inquiry!", html: ackHtml }),
  ]);

  return { admin: adminResult, ack: ackResult };
}

/** Gift pass email to recipient after payment */
export async function sendGiftPassEmail(opts: {
  recipientName: string;
  recipientEmail: string;
  senderName?: string;
  planName: string;
  amountINR: number;
  giftCode: string;
  invoiceNumber: string;
  message?: string;
}) {
  const html = wrapEmailHTML(`
    <div style="text-align:center;margin:0 0 24px;">
      <div style="font-size:48px;margin:0 0 8px;">🎁</div>
      <h2 style="color:${BRAND_DARK};font-size:22px;font-weight:900;margin:0;">
        You've received a Gift Pass!
      </h2>
      ${opts.senderName ? `<p style="color:#64748B;font-size:13px;margin:8px 0 0;">From: <strong>${opts.senderName}</strong></p>` : ""}
    </div>

    ${opts.message ? `
    <div style="background:#FFF8F0;border-left:4px solid ${BRAND_ORANGE};padding:14px 18px;border-radius:0 10px 10px 0;margin:0 0 20px;">
      <p style="color:#92400E;font-size:11px;font-weight:700;text-transform:uppercase;margin:0 0 4px;">Personal Message</p>
      <p style="color:#334155;font-size:14px;line-height:1.6;margin:0;font-style:italic;">"${opts.message}"</p>
    </div>` : ""}

    <div style="background:#FFF8F0;border:2px solid ${BRAND_ORANGE};border-radius:14px;padding:20px;text-align:center;margin:0 0 20px;">
      <p style="color:#92400E;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px;">Your Gift Plan</p>
      <p style="color:${BRAND_DARK};font-size:18px;font-weight:900;margin:0;">${opts.planName}</p>
      <p style="color:${BRAND_ORANGE};font-size:26px;font-weight:900;margin:4px 0;">₹${opts.amountINR.toLocaleString("en-IN")}</p>
    </div>

    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:16px;text-align:center;margin:0 0 20px;">
      <p style="color:#64748B;font-size:11px;font-weight:700;text-transform:uppercase;margin:0 0 6px;">Your Gift Code</p>
      <p style="color:${BRAND_ORANGE};font-size:28px;font-weight:900;letter-spacing:0.15em;margin:0;font-family:monospace;">${opts.giftCode}</p>
      <p style="color:#94A3B8;font-size:11px;margin:6px 0 0;">Copy this code and redeem at scanutsav.com/register</p>
    </div>

    <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://scanutsav.com"}/register"
       style="display:block;text-align:center;background:${BRAND_ORANGE};color:#fff;font-weight:900;font-size:14px;padding:14px 28px;border-radius:12px;text-decoration:none;margin:0 0 16px;">
      Redeem Your Gift Pass →
    </a>

    <p style="color:#94A3B8;font-size:11px;text-align:center;margin:0;">Invoice: ${opts.invoiceNumber}</p>
  `, `You received a ScanUtsav ${opts.planName} gift pass!`);

  return sendEmail({
    to: opts.recipientEmail,
    subject: `🎁 You've received a ScanUtsav Gift Pass — ${opts.planName}`,
    html,
  });
}

/** Payment confirmation & GST invoice email to buyer */
export async function sendPaymentConfirmationEmail(opts: {
  buyerEmail: string;
  buyerName: string;
  planName: string;
  amountINR: number;
  invoiceNumber: string;
  paymentId: string;
  gstBreakdown?: { baseAmount: number; gstRate: number; gstAmount: number; totalAmount: number };
}) {
  const gst = opts.gstBreakdown;
  const html = wrapEmailHTML(`
    <h2 style="color:${BRAND_DARK};font-size:20px;font-weight:900;margin:0 0 8px;">Payment Confirmed ✅</h2>
    <p style="color:#475569;font-size:14px;margin:0 0 20px;">
      Hi ${opts.buyerName}, your ScanUtsav plan is now active!
    </p>

    <div style="background:#F0FDF4;border:1px solid #86EFAC;border-radius:12px;padding:16px;margin:0 0 20px;">
      <table style="width:100%;font-size:13px;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#14532D;font-weight:600;">Plan:</td><td style="color:${BRAND_DARK};font-weight:700;text-align:right;">${opts.planName}</td></tr>
        ${gst ? `
        <tr><td style="padding:6px 0;color:#14532D;font-weight:600;">Base Amount:</td><td style="color:${BRAND_DARK};text-align:right;">₹${gst.baseAmount.toFixed(2)}</td></tr>
        <tr><td style="padding:6px 0;color:#14532D;font-weight:600;">GST (${gst.gstRate}%):</td><td style="color:${BRAND_DARK};text-align:right;">₹${gst.gstAmount.toFixed(2)}</td></tr>
        ` : ""}
        <tr style="border-top:1px solid #BBF7D0;">
          <td style="padding:10px 0 6px;color:#14532D;font-weight:800;">Total Paid:</td>
          <td style="color:${BRAND_ORANGE};font-weight:900;font-size:18px;text-align:right;">₹${opts.amountINR.toLocaleString("en-IN")}</td>
        </tr>
      </table>
    </div>

    <table style="width:100%;font-size:12px;color:#64748B;border-collapse:collapse;margin:0 0 20px;">
      <tr><td style="padding:4px 0;">Invoice Number:</td><td style="font-weight:700;color:${BRAND_DARK};text-align:right;">${opts.invoiceNumber}</td></tr>
      <tr><td style="padding:4px 0;">Payment ID:</td><td style="font-family:monospace;color:${BRAND_DARK};text-align:right;">${opts.paymentId}</td></tr>
      <tr><td style="padding:4px 0;">Vendor GSTIN:</td><td style="font-weight:700;color:${BRAND_DARK};text-align:right;">27AAAAA0000A1Z5</td></tr>
    </table>

    <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://scanutsav.com"}/dashboard"
       style="display:block;text-align:center;background:${BRAND_ORANGE};color:#fff;font-weight:900;font-size:14px;padding:14px 28px;border-radius:12px;text-decoration:none;">
      Go to Host Dashboard →
    </a>
  `, `Payment confirmed — ${opts.planName} is now active!`);

  return sendEmail({
    to: opts.buyerEmail,
    subject: `✅ Payment Confirmed — ${opts.planName} | ScanUtsav`,
    html,
  });
}
