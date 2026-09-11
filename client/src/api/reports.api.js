import { apiGet, apiPost } from "./axiosClient";

// Service API endpoints for reporting abusive or incorrect lost/found item listings
export const reportsApi = {
  // Files a report against a listing
  create: (itemId, reason) => apiPost("/reports", { itemId, reason }),
};

