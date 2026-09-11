import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(undefined);

// SocketProvider (Beginner-Friendly)
export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  // Manage socket connection lifecycle
  useEffect(() => {
    // If no user is logged in, disconnect socket
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConnected(false);
      return;
    }

    const token = localStorage.getItem("token");
    const serverUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

    // Initialize socket connection with auth token
    const socket = io(serverUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", (err) => {
      console.warn("[Socket] Connection error:", err.message);
      setConnected(false);
    });

    // Cleanup on unmount or when user logs out
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  // Listen to any socket event (e.g
  const on = useCallback((event, handler) => {
    const socket = socketRef.current;
    if (socket) {
      socket.on(event, handler);
    }
    return () => {
      socket?.off(event, handler);
    };
  }, []);

  // Join a conversation room
  const joinConversation = useCallback((conversationId) => {
    return new Promise((resolve) => {
      if (!socketRef.current) {
        return resolve({ ok: false, error: "Socket not connected" });
      }
      socketRef.current.emit("join_conversation", { conversationId }, (resp) => {
        resolve(resp || { ok: true });
      });
    });
  }, []);

  // Leave a conversation room
  const leaveConversation = useCallback((conversationId) => {
    socketRef.current?.emit("leave_conversation", conversationId);
  }, []);

  // Send a message to a conversation
  const sendMessage = useCallback((conversationId, messageText) => {
    return new Promise((resolve) => {
      if (!socketRef.current) {
        return resolve({ ok: false, error: "Socket not connected" });
      }
      socketRef.current.emit(
        "send_message",
        { conversationId, messageText },
        (resp) => {
          resolve(resp || { ok: true });
        },
      );
    });
  }, []);

  // Notify the other user about typing status
  const emitTyping = useCallback((conversationId, isTyping) => {
    socketRef.current?.emit("typing", { conversationId, isTyping });
  }, []);

  // Mark messages in a conversation as read
  const markRead = useCallback((conversationId) => {
    socketRef.current?.emit("mark_read", { conversationId });
  }, []);

  const value = useMemo(
    () => ({
      socket: socketRef.current,
      connected,
      joinConversation,
      leaveConversation,
      sendMessage,
      emitTyping,
      markRead,
      on,
    }),
    [
      connected,
      joinConversation,
      leaveConversation,
      sendMessage,
      emitTyping,
      markRead,
      on,
    ],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
};
