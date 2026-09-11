import { Router } from "express";
import * as items from "../controllers/item.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";
import { uploadItemImages } from "../middleware/upload.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", optionalAuth, asyncHandler(items.listItems));
router.get("/:id", asyncHandler(items.getItem));
router.post(
  "/",
  requireAuth,
  uploadItemImages.array("images", 5),
  asyncHandler(items.createItem),
);
router.patch(
  "/:id",
  requireAuth,
  uploadItemImages.array("images", 5),
  asyncHandler(items.updateItem),
);
router.delete("/:id", requireAuth, asyncHandler(items.deleteItem));

export default router;
