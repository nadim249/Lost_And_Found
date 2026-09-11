import { Router } from "express";
import * as claims from "../controllers/claim.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { uploadProofImages } from "../middleware/upload.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  uploadProofImages.array("proofImages", 5),
  asyncHandler(claims.createClaim),
);
router.get("/mine", requireAuth, asyncHandler(claims.myClaims));
router.get("/for-my-items", requireAuth, asyncHandler(claims.claimsForMyItems));
router.patch("/:id/decision", requireAuth, asyncHandler(claims.decideClaim));
router.post(
  "/item/:id/resolve",
  requireAuth,
  asyncHandler(claims.markResolved),
);

export default router;
