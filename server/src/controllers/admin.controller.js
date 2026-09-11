import { prisma } from "../config/db.js";
import { ok } from "../utils/responseHandler.js";
import { HttpError } from "../middleware/error.middleware.js";

// Generates aggregated system analytics metrics for the administrator dashboard
export const analytics = async (_req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    users,
    itemsByStatus,
    openReports,
    claimsToday,
    pendingClaims,
    resolvedItems,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.item.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.claim.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.claim.count({ where: { status: "PENDING" } }),
    prisma.item.count({ where: { status: "RESOLVED" } }),
  ]);

  ok(res, {
    users,
    itemsByStatus: itemsByStatus.reduce(
      (acc, cur) => ({ ...acc, [cur.status]: cur._count._all }),
      {},
    ),
    openReports,
    claimsToday,
    pendingClaims,
    resolvedItems,
  });
};

const formatUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  isBanned: u.isBanned,
  avatarUrl: u.avatarUrl,
  createdAt: u.createdAt.toISOString(),
  _count: u._count,
});

// Lists all registered users in descending order of registration
export const listUsers = async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { items: true, claims: true, reportsFiled: true } },
    },
  });
  ok(res, users.map(formatUser));
};

// Bans or unbans a user account
export const setBan = async (req, res) => {
  const isBanned = Boolean(req.body?.isBanned);
  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target) throw new HttpError(404, "User not found");
  if (target.role === "ADMIN") throw new HttpError(400, "Cannot ban an admin");

  const updated = await prisma.user.update({
    where: { id: target.id },
    data: { isBanned },
  });
  ok(res, { id: updated.id, isBanned: updated.isBanned }, "User updated");
};

// Lists all submitted item reports
export const listReports = async (_req, res) => {
  const items = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      item: { select: { id: true, title: true, status: true, images: true } },
    },
  });
  ok(
    res,
    items.map((r) => ({
      id: r.id,
      reporterId: r.reporterId,
      itemId: r.itemId,
      reason: r.reason,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      reporter: r.reporter,
      item: r.item,
    })),
  );
};

// Updates a report status (RESOLVED, DISMISSED)
export const decideReport = async (req, res) => {
  const status = req.body?.status;
  if (status !== "RESOLVED" && status !== "DISMISSED") {
    throw new HttpError(400, "Status must be either RESOLVED or DISMISSED");
  }
  const existing = await prisma.report.findUnique({
    where: { id: req.params.id },
  });
  if (!existing) throw new HttpError(404, "Report not found");
  const updated = await prisma.report.update({
    where: { id: existing.id },
    data: { status },
  });
  ok(res, { id: updated.id, status: updated.status }, "Report updated");
};

// Lists all lost & found items with admin filter/search and pagination
export const listItems = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const where = {};
  if (["OPEN", "PENDING_CLAIM", "RESOLVED"].includes(req.query.status)) where.status = req.query.status;
  if (req.query.type === "LOST" || req.query.type === "FOUND") where.type = req.query.type;
  if (req.query.q) {
    const q = req.query.q.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
      { user: { is: { name: { contains: q, mode: "insensitive" } } } },
      { user: { is: { email: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.item.count({ where }),
    prisma.item.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true, isBanned: true } },
        _count: { select: { claims: true, reports: true } },
      },
    }),
  ]);

  ok(res, {
    items: items.map((it) => ({
      id: it.id,
      title: it.title,
      type: it.type,
      status: it.status,
      location: it.location,
      images: it.images,
      createdAt: it.createdAt.toISOString(),
      user: it.user,
      _count: it._count,
    })),
    page,
    limit,
    total,
  });
};

// Deletes an item by its ID as an administrator
export const adminDeleteItem = async (req, res) => {
  if (!req.user) throw new HttpError(401, "Authentication required");
  const existing = await prisma.item.findUnique({
    where: { id: req.params.id },
  });
  if (!existing) throw new HttpError(404, "Item not found");

  // Cascade-safe delete: claims first, then reports, then the item itself.
  await prisma.$transaction([
    prisma.claim.deleteMany({ where: { itemId: existing.id } }),
    prisma.report.deleteMany({ where: { itemId: existing.id } }),
    prisma.item.delete({ where: { id: existing.id } }),
  ]);

  // eslint-disable-next-line no-console
  console.log(
    `[admin] item ${existing.id} (${existing.title}) deleted by admin ${req.user.id} (${req.user.email})`,
  );
  ok(res, { id: existing.id }, "Item removed");
};

// Lists the most recent activity items (reports, claims, banned users) for the admin dashboard stream
export const activity = async (_req, res) => {
  const [reports, claims, bannedUsers] = await Promise.all([
    prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        reporter: { select: { id: true, name: true } },
        item: { select: { id: true, title: true } },
      },
    }),
    prisma.claim.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        claimant: { select: { id: true, name: true } },
        item: { select: { id: true, title: true } },
      },
    }),
    prisma.user.findMany({
      where: { isBanned: true },
      orderBy: { updatedAt: "desc" },
      take: 3,
      select: { id: true, name: true, email: true },
    }),
  ]);

  ok(res, {
    recentReports: reports.map((r) => ({
      id: r.id,
      reason: r.reason,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      reporter: r.reporter,
      item: r.item,
    })),
    recentClaims: claims.map((c) => ({
      id: c.id,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
      claimant: c.claimant,
      item: c.item,
    })),
    bannedUsers: bannedUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
    })),
    serverTime: new Date().toISOString(),
  });
};

// Lists all claims in the system with optional status filtering and query search
export const listClaims = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

  const where = {};
  if (["PENDING", "APPROVED", "REJECTED"].includes(req.query.status)) {
    where.status = req.query.status;
  }

  if (req.query.q) {
    const q = req.query.q.trim();
    where.OR = [
      { proofDescription: { contains: q, mode: "insensitive" } },
      { claimant: { name: { contains: q, mode: "insensitive" } } },
      { claimant: { email: { contains: q, mode: "insensitive" } } },
      { item: { title: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [total, claims] = await Promise.all([
    prisma.claim.count({ where }),
    prisma.claim.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        claimant: { select: { id: true, name: true, email: true } },
        item: {
          select: {
            id: true,
            title: true,
            status: true,
            images: true,
            userId: true,
          },
        },
      },
    }),
  ]);

  ok(res, {
    claims: claims.map((c) => ({
      id: c.id,
      itemId: c.itemId,
      claimantId: c.claimantId,
      proofDescription: c.proofDescription,
      proofImages: c.proofImages,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      claimant: c.claimant,
      item: c.item,
    })),
    page,
    limit,
    total,
  });
};

// Deletes a claim request by its ID
export const deleteClaim = async (req, res) => {
  const existing = await prisma.claim.findUnique({
    where: { id: req.params.id },
  });
  if (!existing) throw new HttpError(404, "Claim not found");

  await prisma.claim.delete({ where: { id: existing.id } });
  ok(res, { id: existing.id }, "Claim deleted");
};

