import crypto from "crypto";

const RESET_TTL_MIN = 30;

// Generates a cryptographically secure random token for password resets
export const generateResetToken = () => {
  const raw = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  const expires = new Date(Date.now() + RESET_TTL_MIN * 60 * 1000);
  return { hash, expires, raw };
};

// Hashes a raw reset token with SHA-256 to compare against the database
export const hashResetToken = (raw) =>
  crypto.createHash("sha256").update(raw).digest("hex");

