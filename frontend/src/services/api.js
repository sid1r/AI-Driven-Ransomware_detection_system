import axios from "axios";
import { getToken, logout } from "./auth";

const API_BASE_URL = "http://127.0.0.1:8000";


const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});


/* =====================================================
   REQUEST INTERCEPTOR
   Automatically attach JWT token
===================================================== */

api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


/* =====================================================
   RESPONSE INTERCEPTOR
   Handle expired/invalid authentication
===================================================== */

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {

    if (error.response?.status === 401) {

      logout();

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);


/* =====================================================
   HEALTH
===================================================== */

export const getHealth = async () => {

  const response = await api.get("/health");

  return response.data;
};


/* =====================================================
   LATEST DETECTION
===================================================== */

export const getLatestDetection = async () => {

  const response = await api.get(
    "/detection/latest"
  );

  return response.data;
};


/* =====================================================
   LATEST ALERT
===================================================== */

export const getLatestAlert = async () => {

  const response = await api.get(
    "/detection/latest"
  );

  return response.data;
};


/* =====================================================
   STATISTICS
===================================================== */

export const getStatistics = async () => {

  const response = await api.get(
    "/detection/statistics"
  );

  return response.data;
};


/* =====================================================
   DETECTION HISTORY
===================================================== */

export const getDetectionHistory = async () => {

  const response = await api.get(
    "/detection/history"
  );

  return response.data;
};


/* =====================================================
   DEFAULT API CLIENT
===================================================== */

export default api;