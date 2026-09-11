import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT ?? 587);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM ?? "noreply@example.com";

let cached = null;

// Initializes and returns a cached SMTP transporter
export const getMailer = () => {
  if (cached) return cached;
  if (!host || !user || !pass) return null;
  cached = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return cached;
};

// Sends an email using SMTP
export const sendMail = async (to, subject, text, html) => {
  const t = getMailer();
  if (!t) return false;
  await t.sendMail({ from, to, subject, text, html });
  return true;
};

