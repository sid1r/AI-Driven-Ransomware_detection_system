import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

const TOKEN_KEY = "sentinel_access_token";
const USER_KEY = "sentinel_user";


export const login = async (username, password) => {
  const response = await axios.post(
    `${API_BASE_URL}/auth/login`,
    {
      username,
      password,
    }
  );

  const { access_token, user } = response.data;

  localStorage.setItem(
    TOKEN_KEY,
    access_token
  );

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );

  return response.data;
};


export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};


export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};


export const getStoredUser = () => {
  const user = localStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};


export const isAuthenticated = () => {
  return Boolean(getToken());
};


export const getCurrentUser = async () => {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const response = await axios.get(
      `${API_BASE_URL}/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch {
    logout();
    return null;
  }
};


export const authHeaders = () => {
  const token = getToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};


export {
  TOKEN_KEY,
  USER_KEY,
};