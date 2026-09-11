import { Router } from "express";
import * as reports from "../controllers/report.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/", requireAuth, asyncHandler(reports.createReport));
router.get("/mine", requireAuth, asyncHandler(reports.myReports));

export default router;
