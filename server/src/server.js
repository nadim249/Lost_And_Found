import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes.js";
import itemRoutes from "./routes/item.routes.js";
import claimRoutes from "./routes/claim.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import reportRoutes from "./routes/report.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import profileRoutes from "./routes/profile.routes.js";

import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import { ok } from "./utils/responseHandler.js";
import { createSocketServer } from "./sockets/index.js";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

// Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? CLIENT_ORIGIN : true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (_req, res) => res.status(200).send("OK"));

// Routes
app.use("/auth", authRoutes);
app.use("/items", itemRoutes);
app.use("/claims", claimRoutes);
app.use("/chat", chatRoutes);
app.use("/reports", reportRoutes);
app.use("/admin", adminRoutes);
app.use("/profile", profileRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// HTTP & Socket Server
const httpServer = http.createServer(app);
createSocketServer(httpServer, CLIENT_ORIGIN);

httpServer.listen(PORT, () => {
  console.log(`[server] running on http://localhost:${PORT}`);
});
