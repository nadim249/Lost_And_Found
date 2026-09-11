import { Router } from "express";
import * as admin from "../controllers/admin.controller.js";
import { requireAdmin } from "../middleware/role.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Router managing system administrative actions
const router = Router();

// Populate `req.user` from the JWT token *before* the admin gate checks the role.
// Without this, every admin request would 401 with "Authentication required" because
// `requireAdmin` only inspects `req.user.role`.
router.use(requireAuth, requireAdmin);

router.get("/analytics", asyncHandler(admin.analytics));
router.get("/activity", asyncHandler(admin.activity));
router.get("/items", asyncHandler(admin.listItems));
router.delete("/items/:id", asyncHandler(admin.adminDeleteItem));
router.get("/users", asyncHandler(admin.listUsers));
router.patch("/users/:id/ban", asyncHandler(admin.setBan));
router.get("/reports", asyncHandler(admin.listReports));
router.patch("/reports/:id", asyncHandler(admin.decideReport));
router.get("/claims", asyncHandler(admin.listClaims));
router.delete("/claims/:id", asyncHandler(admin.deleteClaim));

export default router;

