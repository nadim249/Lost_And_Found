import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import { ok, created } from "../utils/responseHandler.js";
import { generateToken, verifyToken } from "../utils/jwt.js";
import { HttpError } from "../middleware/error.middleware.js";
import { generateResetToken, hashResetToken } from "../utils/passwordReset.js";
import { sendMail } from "../utils/mailer.js";

// Clean user object returned to client without sensitive fields
const safeUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  avatarUrl: u.avatarUrl,
  role: u.role,
  isBanned: u.isBanned,
  createdAt: u.createdAt.toISOString(),
});

// Register a new user
export const register = async (req, res) => {
  const { name, email, password, phone } = req.body || {};

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    throw new HttpError(400, "Name must be at least 2 characters");
  }
  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, "Valid email is required");
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    throw new HttpError(400, "Password must be at least 8 characters");
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });
  if (existing) throw new HttpError(409, "Email is already registered");

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      phone: typeof phone === "string" && phone.trim() ? phone.trim() : null,
    },
  });

  // Generate single 7-day JWT token
  const token = generateToken(user.id, user.role);

  created(res, { user: safeUser(user), token }, "Registered successfully");
};

// Login an existing user
export const login = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    throw new HttpError(400, "Email and password are required");
  }

  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (!user) throw new HttpError(401, "Invalid email or password");
  if (user.isBanned) throw new HttpError(403, "This account is banned");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new HttpError(401, "Invalid email or password");

  // Generate single 7-day JWT token
  const token = generateToken(user.id, user.role);

  ok(res, { user: safeUser(user), token }, "Logged in successfully");
};

// Logout
export const logout = async (_req, res) => {
  ok(res, null, "Logged out successfully");
};

// Refresh token
export const refresh = async (req, res) => {
  const authHeader = req.headers.authorization;
  const rawToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!rawToken) throw new HttpError(401, "No token provided");

  try {
    const payload = verifyToken(rawToken);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.isBanned) throw new HttpError(401, "User not found or banned");

    const token = generateToken(user.id, user.role);
    ok(res, { user: safeUser(user), token }, "Token refreshed");
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }
};

// Get current user profile (/auth/me)
export const me = async (req, res) => {
  if (!req.user) throw new HttpError(401, "Authentication required");
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw new HttpError(404, "User not found");
  ok(res, { user: safeUser(user) });
};

// Forgot password (sends email with reset link)
export const forgotPassword = async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, "Valid email is required");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = generateResetToken();
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Password reset requested",
        message: `Reset token (dev): ${token.raw}`,
      },
    });

    const resetUrl = `${process.env.CLIENT_ORIGIN || "http://localhost:5173"}/reset-password?token=${token.raw}`;
    await sendMail(
      user.email,
      "Reset your Lost & Found password",
      `Please reset your password using the following link: ${resetUrl} (valid 30m)`,
      `<div style="background-color: #f5f5f7; padding: 32px 16px; font-family: sans-serif; text-align: center;">
        <div style="max-width: 440px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8e8ed; border-radius: 16px; padding: 32px; text-align: left;">
          <h2 style="color: #1d1d1f; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #515154; font-size: 14px;">Click the button below to set a new password. This link expires in 30 minutes.</p>
          <div style="margin: 24px 0;">
            <a href="${resetUrl}" style="background-color: #1d1d1f; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: bold; padding: 10px 20px; border-radius: 8px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #86868b; font-size: 12px; margin-bottom: 0;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>`,
    );
  }

  ok(res, null, "If the email exists, a password reset link has been sent");
};

// Reset password with token
export const resetPassword = async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || typeof token !== "string" || token.trim().length < 20) {
    throw new HttpError(400, "Valid reset token is required");
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    throw new HttpError(400, "Password must be at least 8 characters");
  }

  const hash = hashResetToken(token.trim());
  const note = await prisma.notification.findFirst({
    where: { title: "Password reset requested", message: { contains: hash } },
  });
  if (!note) throw new HttpError(400, "Invalid or expired reset token");

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: note.userId },
    data: { passwordHash },
  });
  await prisma.notification.delete({ where: { id: note.id } });

  ok(res, null, "Password updated successfully");
};
