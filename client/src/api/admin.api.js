import { apiDelete, apiGet, apiPatch } from "./axiosClient";

// Admin API
export const adminApi = {
  // Dashboard metrics
  analytics: () => apiGet("/admin/analytics"),

  // System activity logs
  activity: () => apiGet("/admin/activity"),

  // Manage items
  items: (query = {}) => apiGet("/admin/items", { params: query }),
  deleteItem: (id) => apiDelete(`/admin/items/${id}`),

  // Manage users
  users: () => apiGet("/admin/users"),
  setBan: (id, isBanned) => apiPatch(`/admin/users/${id}/ban`, { isBanned }),

  // Manage reports
  reports: () => apiGet("/admin/reports"),
  decideReport: (id, status) => apiPatch(`/admin/reports/${id}`, { status }),

  // Manage claims
  claims: (query = {}) => apiGet("/admin/claims", { params: query }),
  deleteClaim: (id) => apiDelete(`/admin/claims/${id}`),
};

