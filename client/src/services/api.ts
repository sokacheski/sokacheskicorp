import axios from "axios";

export const api = axios.create({
  baseURL: "https://sokacheskicorp.onrender.com",
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  if (token) {
    // @ts-ignore
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});