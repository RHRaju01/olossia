import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create a transporter. In production you should configure SMTP or a transactional
// email provider; for development we can optionally use Ethereal.
export async function createTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback to Ethereal for development/testing
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

import { renderTemplate } from "./emailTemplates.js";

export async function sendMail({
  to,
  subject,
  html,
  text,
  template,
  templateData,
  preferHtml = true,
}) {
  // If a template name is provided, render it. This keeps the original
  // signature backwards-compatible: callers may still pass html/text directly.
  let finalHtml = html;
  let finalText = text;
  if (template) {
    // try html first then plaintext
    const h = renderTemplate(template, templateData, { html: true });
    const t = renderTemplate(template, templateData, { html: false });
    if (h) finalHtml = h;
    if (t) finalText = t;
  }

  const transporter = await createTransporter();
  const info = await transporter.sendMail({
    from: process.env.FROM_EMAIL || "noreply@example.com",
    to,
    subject,
    html: finalHtml,
    text: finalText,
  });

  // Return preview URL in dev (Ethereal)
  return { info, previewUrl: nodemailer.getTestMessageUrl(info) };
}

export default { createTransporter, sendMail };
