import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    // Prefer httpOnly cookie auth; keep Bearer header as fallback for legacy sessions
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = typeof window !== "undefined"
          ? sessionStorage.getItem("refreshToken")
          : null;
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/auth/refresh`,
          refreshToken ? { refreshToken } : {},
          { withCredentials: true }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        if (typeof window !== "undefined" && accessToken) {
          // Optional short-lived memory/session fallback for same-origin API proxies
          sessionStorage.setItem("accessToken", accessToken);
          if (newRefreshToken) {
            sessionStorage.setItem("refreshToken", newRefreshToken);
          }
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("refreshToken");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
