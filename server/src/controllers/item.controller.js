import { prisma } from "../config/db.js";
import { ok, created } from "../utils/responseHandler.js";
import { HttpError } from "../middleware/error.middleware.js";
import { uploadImages } from "../config/cloudinary.js";

const formatItem = (i) => ({
  id: i.id,
  title: i.title,
  description: i.description,
  category: i.category,
  type: i.type,
  location: i.location,
  images: i.images,
  status: i.status,
  createdAt: i.createdAt.toISOString(),
  updatedAt: i.updatedAt.toISOString(),
  user: i.user && {
    id: i.user.id,
    name: i.user.name,
    email: i.user.email,
    avatarUrl: i.user.avatarUrl ?? null,
  },
});

// Retrieves a list of items based on filter criteria (category, location, type, status, query string, mine)
export const listItems = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const where = {};
  if (req.query.q) {
    where.OR = [
      { title: { contains: req.query.q.trim(), mode: "insensitive" } },
      { description: { contains: req.query.q.trim(), mode: "insensitive" } },
    ];
  }
  if (req.query.category) where.category = { equals: req.query.category.trim(), mode: "insensitive" };
  if (req.query.location)
    where.location = { contains: req.query.location.trim(), mode: "insensitive" };
  if (req.query.type === "LOST" || req.query.type === "FOUND") where.type = req.query.type;
  if (["OPEN", "PENDING_CLAIM", "RESOLVED"].includes(req.query.status)) where.status = req.query.status;
  if (req.query.mine === "true" || req.query.mine === true) {
    if (!req.user) throw new HttpError(401, "Authentication required");
    where.userId = req.user.id;
  }

  const skip = (page - 1) * limit;
  const [total, items] = await Promise.all([
    prisma.item.count({ where }),
    prisma.item.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    }),
  ]);

  ok(res, items.map(formatItem), "OK", { page, limit, total });
};

// Retrieves a single item by its ID
export const getItem = async (req, res) => {
  const item = await prisma.item.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      claims: {
        select: {
          id: true,
          claimantId: true,
          proofDescription: true,
          proofImages: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!item) throw new HttpError(404, "Item not found");

  ok(res, {
    ...formatItem(item),
    claims: item.claims.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
  });
};

// Creates a new item
export const createItem = async (req, res) => {
  if (!req.user) throw new HttpError(401, "Authentication required");
  const { title, description, category, type, location } = req.body || {};
  if (!title || typeof title !== "string" || title.trim().length < 3) {
    throw new HttpError(400, "Title must be at least 3 characters");
  }
  if (!description || typeof description !== "string" || description.trim().length < 5) {
    throw new HttpError(400, "Description must be at least 5 characters");
  }
  if (!category || typeof category !== "string" || category.trim().length < 2) {
    throw new HttpError(400, "Category is required");
  }
  if (type !== "LOST" && type !== "FOUND") {
    throw new HttpError(400, "Type must be either LOST or FOUND");
  }
  if (!location || typeof location !== "string" || location.trim().length < 2) {
    throw new HttpError(400, "Location is required");
  }

  const files = req.files ?? [];
  const images =
    files.length > 0 ? await uploadImages(files.map((f) => f.buffer)) : [];

  const item = await prisma.item.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      type,
      location: location.trim(),
      images,
      userId: req.user.id,
    },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  created(res, formatItem(item), "Item created");
};

// Updates an existing item
export const updateItem = async (req, res) => {
  if (!req.user) throw new HttpError(401, "Authentication required");

  const existing = await prisma.item.findUnique({
    where: { id: req.params.id },
  });
  if (!existing) throw new HttpError(404, "Item not found");
  if (existing.userId !== req.user.id && req.user.role !== "ADMIN") {
    throw new HttpError(403, "Not your item");
  }

  const data = {};
  if (req.body?.title) data.title = req.body.title.trim();
  if (req.body?.description) data.description = req.body.description.trim();
  if (req.body?.category) data.category = req.body.category.trim();
  if (req.body?.type === "LOST" || req.body?.type === "FOUND") data.type = req.body.type;
  if (req.body?.location) data.location = req.body.location.trim();
  if (["OPEN", "PENDING_CLAIM", "RESOLVED"].includes(req.body?.status)) data.status = req.body.status;
  if (Array.isArray(req.body?.images)) data.images = req.body.images;

  const item = await prisma.item.update({
    where: { id: req.params.id },
    data,
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  ok(res, formatItem(item), "Item updated");
};

// Deletes an item by its ID
export const deleteItem = async (req, res) => {
  if (!req.user) throw new HttpError(401, "Authentication required");
  const existing = await prisma.item.findUnique({
    where: { id: req.params.id },
  });
  if (!existing) throw new HttpError(404, "Item not found");
  if (existing.userId !== req.user.id && req.user.role !== "ADMIN") {
    throw new HttpError(403, "Not your item");
  }
  await prisma.item.delete({ where: { id: req.params.id } });
  ok(res, null, "Item deleted");
};

