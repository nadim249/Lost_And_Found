import { prisma } from "../config/db.js";
import { ok, created } from "../utils/responseHandler.js";
import { HttpError } from "../middleware/error.middleware.js";

// Lists all active conversations for the authenticated user
export const listConversations = async (req, res) => {
  if (!req.user) throw new HttpError(401, "Authentication required");

  // Clean up any empty conversations (0 messages) older than 10 seconds
  const emptyConvs = await prisma.conversation.findMany({
    where: {
      participants: { some: { userId: req.user.id } },
      messages: { none: {} },
      createdAt: { lt: new Date(Date.now() - 10 * 1000) },
    },
    select: { id: true },
  });

  if (emptyConvs.length > 0) {
    await prisma.conversation.deleteMany({
      where: {
        id: { in: emptyConvs.map((c) => c.id) },
      },
    });
  }

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: req.user.id } } },
    orderBy: { updatedAt: "desc" },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  ok(
    res,
    conversations.map((c) => ({
      id: c.id,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      participants: c.participants.map((p) => ({
        user: p.user,
        conversationId: p.conversationId,
      })),
      lastMessage: c.messages[0]
        ? {
            id: c.messages[0].id,
            messageText: c.messages[0].messageText,
            senderId: c.messages[0].senderId,
            createdAt: c.messages[0].createdAt.toISOString(),
            isRead: c.messages[0].isRead,
          }
        : null,
    })),
  );
};

// Creates/starts a conversation with another user
export const startConversation = async (req, res) => {
  if (!req.user) throw new HttpError(401, "Authentication required");
  const otherUserId = req.body?.otherUserId;
  if (!otherUserId || typeof otherUserId !== "string") {
    throw new HttpError(400, "Valid otherUserId is required");
  }
  if (otherUserId === req.user.id)
    throw new HttpError(400, "Cannot start chat with yourself");

  const other = await prisma.user.findUnique({
    where: { id: otherUserId },
  });
  if (!other) throw new HttpError(404, "User not found");

  const found = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: req.user.id } } },
        { participants: { some: { userId: otherUserId } } },
      ],
    },
    include: { participants: true },
  });

  if (found && found.participants.length === 2) {
    ok(res, { id: found.id });
    return;
  }

  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: req.user.id }, { userId: body.otherUserId }],
      },
    },
  });

  created(res, { id: conversation.id }, "Conversation created");
};

// Fetches all messages within a specific conversation
export const getMessages = async (req, res) => {
  if (!req.user) throw new HttpError(401, "Authentication required");

  const conversation = await prisma.conversation.findUnique({
    where: { id: req.params.id },
    include: { participants: true },
  });
  if (!conversation) throw new HttpError(404, "Conversation not found");
  if (!conversation.participants.some((p) => p.userId === req.user.id)) {
    throw new HttpError(403, "Not a participant");
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
  });

  ok(
    res,
    messages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      sender: m.sender,
      messageText: m.messageText,
      isRead: m.isRead,
      createdAt: m.createdAt.toISOString(),
    })),
  );
};

// Sends a message within a conversation
export const sendMessage = async (req, res) => {
  if (!req.user) throw new HttpError(401, "Authentication required");
  const { conversationId, messageText } = req.body || {};
  if (!conversationId || typeof conversationId !== "string") {
    throw new HttpError(400, "Valid conversationId is required");
  }
  if (!messageText || typeof messageText !== "string" || !messageText.trim()) {
    throw new HttpError(400, "Message text cannot be empty");
  }

  const cleanText = messageText.trim();
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { participants: true },
  });
  if (!conversation) throw new HttpError(404, "Conversation not found");
  if (!conversation.participants.some((p) => p.userId === req.user.id)) {
    throw new HttpError(403, "Not a participant");
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: req.user.id,
      messageText: cleanText,
    },
    include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  // Notify other participant
  const others = conversation.participants.filter(
    (p) => p.userId !== req.user.id,
  );
  if (others.length > 0) {
    await prisma.notification.create({
      data: {
        userId: others[0].userId,
        title: "New message",
        message: `${req.user.name}: ${body.messageText.slice(0, 80)}`,
      },
    });
  }

  created(
    res,
    {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      sender: message.sender,
      messageText: message.messageText,
      isRead: message.isRead,
      createdAt: message.createdAt.toISOString(),
    },
    "Message sent",
  );
};

// Marks all incoming messages in a conversation as read
export const markRead = async (req, res) => {
  if (!req.user) throw new HttpError(401, "Authentication required");
  const conversation = await prisma.conversation.findUnique({
    where: { id: req.params.id },
    include: { participants: true },
  });
  if (!conversation) throw new HttpError(404, "Conversation not found");
  if (!conversation.participants.some((p) => p.userId === req.user.id)) {
    throw new HttpError(403, "Not a participant");
  }

  await prisma.message.updateMany({
    where: { conversationId: conversation.id, senderId: { not: req.user.id } },
    data: { isRead: true },
  });
  ok(res, null, "Marked read");
};

// Lists the authenticated user's notifications
export const listNotifications = async (req, res) => {
  if (!req.user) throw new HttpError(401, "Authentication required");
  const items = await prisma.notification.findMany({
    where: {
      userId: req.user.id,
      title: { not: "Password reset requested" },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  ok(
    res,
    items.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    })),
  );
};

// Marks all notifications for the authenticated user as read
export const markAllNotificationsRead = async (req, res) => {
  if (!req.user) throw new HttpError(401, "Authentication required");
  await prisma.notification.updateMany({
    where: {
      userId: req.user.id,
      isRead: false,
      title: { not: "Password reset requested" },
    },
    data: { isRead: true },
  });
  ok(res, null, "All marked read");
};

