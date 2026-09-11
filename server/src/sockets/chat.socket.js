import { prisma } from "../config/db.js";

// Chat Socket Handlers (Beginner-Friendly)

export const registerChatHandlers = (io, socket) => {
  const currentUserId = socket.data.userId;

  // 1. Join Conversation Room
  socket.on("join_conversation", async (payload, ack) => {
    try {
      const conversationId = payload?.conversationId;
      if (!conversationId) {
        ack?.({ ok: false, error: "conversationId is required" });
        return;
      }

      // Join the Socket.io room for this conversation
      socket.join(conversationId);
      ack?.({ ok: true, conversationId });
    } catch (err) {
      ack?.({ ok: false, error: err.message });
    }
  });

  // 2. Leave Conversation Room
  socket.on("leave_conversation", (conversationId) => {
    if (conversationId) {
      socket.leave(conversationId);
    }
  });

  // 3. Send Message
  socket.on("send_message", async (payload, ack) => {
    try {
      const { conversationId, messageText } = payload || {};

      if (!conversationId || !messageText?.trim()) {
        ack?.({ ok: false, error: "Message text cannot be empty" });
        return;
      }

      // Save message in PostgreSQL database
      const message = await prisma.message.create({
        data: {
          conversationId,
          senderId: currentUserId,
          messageText: messageText.trim(),
        },
        include: {
          sender: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      });

      // Update conversation's last active timestamp
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      // Broadcast the new message to everyone in the room (including sender)
      io.to(conversationId).emit("new_message", {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        sender: message.sender,
        messageText: message.messageText,
        isRead: message.isRead,
        createdAt: message.createdAt.toISOString(),
      });

      ack?.({ ok: true, messageId: message.id });
    } catch (err) {
      ack?.({ ok: false, error: err.message });
    }
  });

  // 4. Typing Indicator
  socket.on("typing", (payload) => {
    if (!payload?.conversationId) return;

    // Send typing notification only to the other user in the room
    socket.to(payload.conversationId).emit("typing", {
      conversationId: payload.conversationId,
      userId: currentUserId,
      isTyping: !!payload.isTyping,
    });
  });

  // 5. Mark Messages as Read
  socket.on("mark_read", async (payload, ack) => {
    try {
      const conversationId = payload?.conversationId;
      if (!conversationId) return;

      // Mark all messages from the other user as read
      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: currentUserId },
        },
        data: { isRead: true },
      });

      // Notify the room that messages were read
      io.to(conversationId).emit("messages_read", {
        conversationId,
        readerId: currentUserId,
      });

      ack?.({ ok: true });
    } catch (err) {
      ack?.({ ok: false, error: err.message });
    }
  });
};
