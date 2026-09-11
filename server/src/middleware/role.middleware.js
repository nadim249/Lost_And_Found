import { fail } from "../utils/responseHandler.js";

// Higher-order middleware function to enforce Role-Based Access Control (RBAC)
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      fail(res, 401, "Authentication required");
      return;
    }
    if (!roles.includes(req.user.role)) {
      fail(res, 403, "Insufficient permissions");
      return;
    }
    next();
  };
};

// Pre-configured middleware requiring the 'ADMIN' role
export const requireAdmin = requireRole("ADMIN");

