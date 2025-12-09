import axios from "axios";
axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: "http://localhost:4000",
});

// Auth requests
export const registerUser = (userData) => {
  return api.post("/auth/register", userData);
};

export const loginUser = (email, password) => {
  return api.post("/auth/login", { email, password });
};

export const logoutUser = () => {
  return api.get("/auth/logout");
};

export const getLoggedIn = () => {
  return api.get("/auth/loggedIn");
};

export const updateUser = (userData) => {
  return api.put("/auth/update", userData);
};

// Playlist requests
export const getPlaylists = (params) => {
  return api.get("/api/playlists", { params });
};

export const createPlaylist = (data) => {
  return api.post("/api/playlists", data);
};

export const updatePlaylist = (id, data) => {
  return api.put(`/api/playlists/${id}`, data);
};

export const deletePlaylist = (id) => {
  return api.delete(`/api/playlists/${id}`);
};

export const copyPlaylist = (id) => {
  return api.post(`/api/playlists/${id}/copy`);
};

export const playPlaylist = (id) => {
  return api.post(`/api/playlists/${id}/play`);
};

// Song requests
export const getSongs = (params) => {
  return api.get("/api/songs", { params });
};

export const createSong = (data) => {
  return api.post("/api/songs", data);
};

export const updateSong = (id, data) => {
  return api.put(`/api/songs/${id}`, data);
};

export const deleteSong = (id) => {
  return api.delete(`/api/songs/${id}`);
};

const apis = {
  registerUser,
  loginUser,
  logoutUser,
  getLoggedIn,
  updateUser,
  getPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  copyPlaylist,
  playPlaylist,
  getSongs,
  createSong,
  updateSong,
  deleteSong,
};

export default apis;
