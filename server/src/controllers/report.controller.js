import { prisma } from "../config/db.js";
import { ok, created } from "../utils/responseHandler.js";
import { HttpError } from "../middleware/error.middleware.js";

const format = (r) => ({
  id: r.id,
  reporterId: r.reporterId,
  itemId: r.itemId,
  reason: r.reason,
  status: r.status,
  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString(),
  reporter: r.reporter && {
    id: r.reporter.id,
    name: r.reporter.name,
    email: r.reporter.email,
  },
  item: r.item && { id: r.item.id, title: r.item.title, status: r.item.status },
});

// Submits an abuse/infraction report against an item
export const createReport = async (req, res) => {
  if (!req.user) throw new HttpError(401, "Authentication required");
  const { itemId, reason } = req.body || {};
  if (!reason || typeof reason !== "string" || reason.trim().length < 5) {
    throw new HttpError(400, "Report reason must be at least 5 characters");
  }

  const cleanItemId = typeof itemId === "string" && itemId.trim() ? itemId.trim() : null;
  const item = cleanItemId
    ? await prisma.item.findUnique({ where: { id: cleanItemId } })
    : null;
  if (cleanItemId && !item) throw new HttpError(404, "Item not found");

  const report = await prisma.report.create({
    data: {
      reporterId: req.user.id,
      itemId: cleanItemId,
      reason: reason.trim(),
    },
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      item: { select: { id: true, title: true, status: true } },
    },
  });

  created(res, format(report), "Report submitted");
};

// Lists all reports submitted by the authenticated user
export const myReports = async (req, res) => {
  if (!req.user) throw new HttpError(401, "Authentication required");
  const items = await prisma.report.findMany({
    where: { reporterId: req.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      item: { select: { id: true, title: true, status: true } },
    },
  });
  ok(res, items.map(format));
};

