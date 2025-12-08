import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateAccount: (data) => api.put("/auth/update", data),
};

// Playlists API
export const playlistsAPI = {
  getAll: (params) => api.get("/playlists", { params }),
  getById: (id) => api.get(`/playlists/${id}`),
  create: (data) => api.post("/playlists", data),
  update: (id, data) => api.put(`/playlists/${id}`, data),
  copy: (id) => api.post(`/playlists/${id}/copy`),
  delete: (id) => api.delete(`/playlists/${id}`),
  play: (id) => api.post(`/playlists/${id}/play`),
};

// Songs API
export const songsAPI = {
  getAll: (params) => api.get("/songs", { params }),
  getById: (id) => api.get(`/songs/${id}`),
  create: (data) => api.post("/songs", data),
  update: (id, data) => api.put(`/songs/${id}`, data),
  delete: (id) => api.delete(`/songs/${id}`),
};

export default api;
