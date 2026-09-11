import axios from "axios";
import toast from "react-hot-toast";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Axios instance
export const axiosClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Request Interceptor: Automatically attach standard Bearer JWT token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // If payload is FormData (image uploads), let browser set Content-Type with boundary
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

// Response Interceptor: Clean error handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // If unauthorized (invalid/expired token), clear stored token
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }

    // Network / Server errors toast alerts
    if (!error.response) {
      toast.error("Network error. Please check if the server is running.");
    } else if (error.response.status >= 500) {
      toast.error("Server error. Please try again later.");
    }

    return Promise.reject(error);
  },
);

// API helpers
export const apiGet = (url, config) =>
  axiosClient.get(url, config).then((r) => r.data);

export const apiPost = (url, body, config) =>
  axiosClient.post(url, body, config).then((r) => r.data);

export const apiPatch = (url, body, config) =>
  axiosClient.patch(url, body, config).then((r) => r.data);

export const apiDelete = (url, config) =>
  axiosClient.delete(url, config).then((r) => r.data);
