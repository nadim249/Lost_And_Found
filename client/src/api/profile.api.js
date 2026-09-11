import { axiosClient } from "./axiosClient";

// Service API methods for managing the logged-in user's profile details
export const profileApi = {
  // Sends a PATCH request to update the user's name and phone number
  update: async (payload) => {
    const body = {};
    if (payload.name !== undefined) body.name = payload.name;
    if (payload.phone !== undefined) {
      const trimmed = String(payload.phone).trim();
      body.phone = trimmed.length > 0 ? trimmed : null;
    }
    const { data } = await axiosClient.patch("/profile", body);
    return data.data.user;
  },
};

