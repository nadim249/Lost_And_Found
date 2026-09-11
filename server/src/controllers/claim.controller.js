import { prisma } from "../config/db.js";
import { ok, created } from "../utils/responseHandler.js";
import { HttpError } from "../middleware/error.middleware.js";
import { uploadImages } from "../config/cloudinary.js";

const formatClaim = (c) => ({
  id: c.id,
  itemId: c.itemId,
  claimantId: c.claimantId,
  proofDescription: c.proofDescription,
  proofImages: c.proofImages,
  status: c.status,
  createdAt: c.createdAt.toISOString(),
  updatedAt: c.updatedAt.toISOString(),
  item: c.item && {
    id: c.item.id,
    title: c.item.title,
    images: c.item.images,
    status: c.item.status,
    userId: c.item.userId,
  },
  claimant: c.claimant && {
    id: c.claimant.id,
    name: c.claimant.name,
    email: c.claimant.email,
  },
});

// Submits a new claim request for an item
export const createClaim = async (req, res) => {
  if (!req.user) throw new HttpError(401, "Authentication required");
  const { itemId, proofDescription } = req.body || {};
  if (!itemId || typeof itemId !== "string") {
    throw new HttpError(400, "Valid item ID is required");
  }
  if (!proofDescription || typeof proofDescription !== "string" || proofDescription.trim().length < 5) {
    throw new HttpError(400, "Proof description must be at least 5 characters");
  }

  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) throw new HttpError(404, "Item not found");
  if (item.userId === req.user.id)
    throw new HttpError(400, "You cannot claim your own item");

  const files = req.files ?? [];
  const proofImages =
    files.length > 0 ? await uploadImages(files.map((f) => f.buffer)) : [];

  const claim = await prisma.claim.create({
    data: {
      itemId,
      claimantId: req.user.id,
      proofDescription: proofDescription.trim(),
      proofImages,
    },
    include: {
      item: {
        select: {
          id: true,
          title: true,
          images: true,
          status: true,
          userId: true,
        },
      },
      claimant: { select: { id: true, name: true, email: true } },
    },
  });

  await prisma.notification.create({
    data: {
      userId: item.userId,
      title: "New claim on your item",
      message: `${req.user.name} filed a claim on "${item.title}"`,
    },
  });

  created(res, formatClaim(claim), "Claim submitted");
};

// Lists all claims submitted by the currently logged-in user
export const myClaims = async (req, res) => {
  if (!req.user) throw new HttpError(401, "Authentication required");
  const claims = await prisma.claim.findMany({
    where: { claimantId: req.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      item: {
        select: {
          id: true,
          title: true,
          images: true,
          status: true,
          userId: true,
        },
      },
      claimant: { select: { id: true, name: true, email: true } },
    },
  });
  ok(res, claims.map(formatClaim));
};

// Lists all incoming claims targeting items belonging to the current user
export const claimsForMyItems = async (req, res) => {
  if (!req.user) throw new HttpError(401, "Authentication required");
  const claims = await prisma.claim.findMany({
    where: { item: { userId: req.user.id } },
    orderBy: { createdAt: "desc" },
    include: {
      item: {
        select: {
          id: true,
          title: true,
          images: true,
          status: true,
          userId: true,
        },
      },
      claimant: { select: { id: true, name: true, email: true } },
    },
  });
  ok(res, claims.map(formatClaim));
};

// Decides (Approves/Rejects) a claim
export const decideClaim = async (req, res) => {
  if (!req.user) throw new HttpError(401, "Authentication required");
  const { status } = req.body || {};
  if (status !== "APPROVED" && status !== "REJECTED") {
    throw new HttpError(400, "Status must be either APPROVED or REJECTED");
  }

  const claim = await prisma.claim.findUnique({
    where: { id: req.params.id },
    include: { item: true },
  });
  if (!claim) throw new HttpError(404, "Claim not found");
  if (claim.item.userId !== req.user.id && req.user.role !== "ADMIN") {
    throw new HttpError(403, "Only the item owner can decide");
  }
  if (claim.status !== "PENDING")
    throw new HttpError(400, "Claim already decided");

  const updated = await prisma.$transaction(async (tx) => {
    const c = await tx.claim.update({
      where: { id: claim.id },
      data: { status },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            images: true,
            status: true,
            userId: true,
          },
        },
        claimant: { select: { id: true, name: true, email: true } },
      },
    });
    if (body.status === "APPROVED") {
      await tx.item.update({
        where: { id: claim.itemId },
        data: { status: "PENDING_CLAIM" },
      });
      await tx.claim.updateMany({
        where: {
          itemId: claim.itemId,
          id: { not: claim.id },
          status: "PENDING",
        },
        data: { status: "REJECTED" },
      });
    }
    return c;
  });

  await prisma.notification.create({
    data: {
      userId: claim.claimantId,
      title: "Claim update",
      message: `Your claim on "${claim.item.title}" was ${body.status.toLowerCase()}`,
    },
  });

  ok(res, formatClaim(updated), "Claim decided");
};

// Marks an item as resolved once claims/handoff is complete
export const markResolved = async (req, res) => {
  if (!req.user) throw new HttpError(401, "Authentication required");
  const item = await prisma.item.findUnique({ where: { id: req.params.id } });
  if (!item) throw new HttpError(404, "Item not found");
  if (item.userId !== req.user.id && req.user.role !== "ADMIN") {
    throw new HttpError(403, "Only the owner can mark resolved");
  }
  const updated = await prisma.item.update({
    where: { id: item.id },
    data: { status: "RESOLVED" },
  });
  ok(res, { id: updated.id, status: updated.status }, "Item marked resolved");
};

