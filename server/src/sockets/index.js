import { Server } from "socket.io";
import { verifyToken } from "../utils/jwt.js";
import { prisma } from "../config/db.js";
import { registerChatHandlers } from "./chat.socket.js";

// Extracts JWT token from socket handshake
const getSocketToken = (socket) => {
  if (socket.handshake.auth?.token) {
    return socket.handshake.auth.token;
  }
  const authHeader = socket.handshake.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return null;
};

// Initializes the Socket.io WebSocket server
export const createSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = getSocketToken(socket);
      if (!token) {
        return next(new Error("Authentication required: No token provided"));
      }

      // Verify token & find user
      const payload = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, role: true, isBanned: true },
      });

      if (!user) return next(new Error("User not found"));
      if (user.isBanned) return next(new Error("Account banned"));

      // Attach user info to socket
      socket.data.userId = user.id;
      socket.data.role = user.role;
      next();
    } catch {
      next(new Error("Unauthorized: Invalid or expired token"));
    }
  });

  // Handle Socket Connections
  io.on("connection", (socket) => {
    const userId = socket.data.userId;

    // Join personal user room for direct alerts
    socket.join(`user:${userId}`);

    // Register real-time chat handlers
    registerChatHandlers(io, socket);

    socket.on("disconnect", () => {
      socket.leave(`user:${userId}`);
    });
  });

  return io;
};
