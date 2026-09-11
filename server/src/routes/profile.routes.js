import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { fail, ok } from "../utils/responseHandler.js";
import { prisma } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Router managing user profile fields updates
const router = Router();

// PATCH /profile
router.patch(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = {};
    if (typeof req.body?.name === "string" && req.body.name.trim().length >= 2) {
      data.name = req.body.name.trim();
    }
    if (req.body?.phone !== undefined) {
      data.phone = typeof req.body.phone === "string" ? req.body.phone.trim() : null;
    }
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        isBanned: true,
        createdAt: true,
      },
    });
    return ok(res, { user });
  }),
);

// POST /profile/avatar
router.post(
  "/avatar",
  requireAuth,
  asyncHandler(async (_req, res) => {
    return fail(res, 501, "Avatar upload not yet implemented");
  }),
);

export default router;

