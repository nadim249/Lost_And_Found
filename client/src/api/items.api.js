import { apiGet, apiPost, apiPatch, apiDelete } from "./axiosClient";

// Service API endpoints for managing lost & found item posts
export const itemsApi = {
  // Lists lost and found item posts
  list: (q = {}) => apiGet("/items", { params: q }),

  // Retrieves detail profile of a post
  get: (id) => apiGet(`/items/${id}`),

  // Creates a new item post
  create: (form) => apiPost("/items", form),

  // Updates an existing item post
  update: (id, form) => apiPatch(`/items/${id}`, form),

  // Deletes an item post
  remove: (id) => apiDelete(`/items/${id}`),
};

