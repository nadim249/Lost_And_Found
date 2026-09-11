import { apiGet, apiPost } from "./axiosClient";

// Service API endpoints for authentication and user sessions
export const authApi = {
  // Registers a new user
  register: (body) => {
    const { phone, ...rest } = body;
    return apiPost("/auth/register", {
      ...rest,
      ...(phone && phone.trim() ? { phone: phone.trim() } : {}),
    });
  },

  // Logs in a user
  login: (body) => apiPost("/auth/login", body),

  // Logs out the user session
  logout: () => apiPost("/auth/logout"),

  // Gets the authenticated user's profile state
  me: () => apiGet("/auth/me"),

  // Triggers the forgot password sequence
  forgot: (email) => apiPost("/auth/forgot-password", { email }),

  // Resets password using token
  reset: (token, password) =>
    apiPost("/auth/reset-password", { token, password }),
};

