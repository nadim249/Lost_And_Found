import { apiGet, apiPost, apiPatch } from "./axiosClient";

// Service API endpoints for filing, listing, and reviewing owner claims on items
export const claimsApi = {
  // Submits a claim for an item with proof description and files
  create: (form) => apiPost("/claims", form),

  // Retrieves claims submitted by the current user
  mine: () => apiGet("/claims/mine"),

  // Retrieves claims submitted by other users on items posted by current user
  forMyItems: () => apiGet("/claims/for-my-items"),

  // Approves or rejects a pending claim
  decide: (id, status) => apiPatch(`/claims/${id}/decision`, { status }),

  // Marks a claim and item as resolved
  resolveItem: (itemId) => apiPost(`/claims/item/${itemId}/resolve`),
};

