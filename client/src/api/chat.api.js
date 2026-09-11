import { apiGet, apiPost } from "./axiosClient";

// Service API endpoints for managing real-time chat conversations, messages, and in-app notifications
export const chatApi = {
  // Lists all conversations for the user
  conversations: () => apiGet("/chat/conversations"),

  // Starts a conversation with another user
  start: (otherUserId) => apiPost("/chat/conversations", { otherUserId }),

  // Fetches messages in a conversation
  messages: (conversationId) =>
    apiGet(`/chat/conversations/${conversationId}/messages`),

  // Sends a message into a conversation
  send: (conversationId, messageText) =>
    apiPost(`/chat/conversations/${conversationId}/messages`, { messageText }),

  // Marks all messages inside a conversation as read
  markRead: (conversationId) =>
    apiPost(`/chat/conversations/${conversationId}/read`),

  // Fetches notifications for the user
  notifications: () => apiGet("/chat/notifications"),

  // Marks all notifications as read
  markAllRead: () => apiPost("/chat/notifications/read-all"),
};

