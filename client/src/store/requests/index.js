import axios from "axios";
axios.defaults.withCredentials = true;
const api = axios.create({
  baseURL: "http://localhost:4000/api",
});

// PLAYLIST REQUESTS
export const createPlaylist = (playlist) => {
  return api.post("/playlists", playlist);
};

export const getPlaylists = (searchParams) => {
  const params = new URLSearchParams(searchParams);
  return api.get(`/playlists?${params.toString()}`);
};

export const getPlaylistById = (id) => {
  return api.get(`/playlists/${id}`);
};

export const updatePlaylistById = (id, playlist) => {
  return api.put(`/playlists/${id}`, playlist);
};

export const deletePlaylistById = (id) => {
  return api.delete(`/playlists/${id}`);
};

export const copyPlaylist = (id) => {
  return api.post(`/playlists/${id}/copy`);
};

export const playPlaylist = (id) => {
  return api.post(`/playlists/${id}/play`);
};

// SONG REQUESTS
export const createSong = (song) => {
  return api.post("/songs", song);
};

export const getSongs = (searchParams) => {
  const params = new URLSearchParams(searchParams);
  return api.get(`/songs?${params.toString()}`);
};

export const getSongById = (id) => {
  return api.get(`/songs/${id}`);
};

export const updateSongById = (id, song) => {
  return api.put(`/songs/${id}`, song);
};

export const deleteSongById = (id) => {
  return api.delete(`/songs/${id}`);
};

const apis = {
  createPlaylist,
  getPlaylists,
  getPlaylistById,
  updatePlaylistById,
  deletePlaylistById,
  copyPlaylist,
  playPlaylist,
  createSong,
  getSongs,
  getSongById,
  updateSongById,
  deleteSongById,
};

export default apis;
