import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    // Auto logout on 401 Unauthorized (expired/invalid token)
    if (status === 401) {
      const token = localStorage.getItem("token");
      if (token) {
        localStorage.removeItem("token");
        // avoid infinite loop if already on login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    // Normalize error messages
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.response?.data ||
      error.message ||
      "Unexpected error";
    // Attach normalized message for UI handling
    error.normalizedMessage = typeof message === "string" ? message : JSON.stringify(message);
    return Promise.reject(error);
  }
);

export default apiClient;
