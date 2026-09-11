import { Router } from "express";
import * as auth from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/register", asyncHandler(auth.register));
router.post("/login", asyncHandler(auth.login));
router.post("/logout", asyncHandler(auth.logout));
router.post("/refresh", asyncHandler(auth.refresh));
router.post("/forgot-password", asyncHandler(auth.forgotPassword));
router.post("/reset-password", asyncHandler(auth.resetPassword));
router.get("/me", requireAuth, asyncHandler(auth.me));

export default router;
