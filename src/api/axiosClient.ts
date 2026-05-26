import axios from "axios";
import { getAuthToken } from "@/lib/authCookies";
import { toast } from "sonner";

export const axiosClient = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically inject JWT token into request headers
axiosClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// General response error interceptor to display standard toast warnings
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || "An unexpected error occurred";
    
    if (error.response?.status === 401) {
      toast.error("Session expired. Please log in again.");
    } else if (error.response?.status === 403) {
      toast.error("Access Denied: Insufficient permissions.");
    } else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);
