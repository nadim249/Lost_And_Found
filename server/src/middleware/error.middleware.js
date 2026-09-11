import { Prisma } from "@prisma/client";
import { fail } from "../utils/responseHandler.js";

// Custom application HTTP error representation
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Middleware that handles requests targeting non-existent server routes
export const notFoundHandler = (_req, res) => {
  fail(res, 404, "Route not found");
};

// Centralized Express error-handling middleware
export const errorHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    fail(res, err.status, err.message, err.details);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      fail(res, 409, "Resource already exists", { target: err.meta?.target });
      return;
    }
    if (err.code === "P2025") {
      fail(res, 404, "Resource not found");
      return;
    }
    // eslint-disable-next-line no-console
    console.error("[database-error]", err);
    fail(res, 500, "Something went wrong. Please try again.");
    return;
  }

  if (err && typeof err === "object" && err.type === "entity.parse.failed") {
    console.warn("[bad-json-body]", err.body);
    fail(res, 400, "Invalid JSON body", {
      body: err.body,
    });
    return;
  }

  if (err instanceof Error) {
    // eslint-disable-next-line no-console
    console.error("[unhandled]", err);
    fail(res, 500, "Something went wrong. Please try again.");
    return;
  }

  fail(res, 500, "Something went wrong. Please try again.");
};

