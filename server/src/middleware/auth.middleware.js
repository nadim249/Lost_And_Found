import { prisma } from "../config/db.js";
import { verifyToken } from "../utils/jwt.js";
import { fail } from "../utils/responseHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Extracts the JWT token from the Authorization header
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return null;
};

// Resolves the authenticated user from the database using the token
const resolveUser = async (token) => {
  const payload = verifyToken(token);
  return prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true, role: true, isBanned: true },
  });
};

// Middleware: Requires valid login
export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    fail(res, 401, "Authentication required. Please log in.");
    return;
  }

  try {
    const user = await resolveUser(token);
    if (!user) {
      fail(res, 401, "User not found");
      return;
    }
    if (user.isBanned) {
      fail(res, 403, "Account is banned");
      return;
    }

    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    next();
  } catch {
    fail(res, 401, "Invalid or expired token. Please log in again.");
  }
});

// Middleware: Optional authentication
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) {
    next();
    return;
  }
  try {
    const user = await resolveUser(token);
    if (user && !user.isBanned) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }
  } catch {
    // Ignore invalid tokens for optional routes
  }
  next();
});
