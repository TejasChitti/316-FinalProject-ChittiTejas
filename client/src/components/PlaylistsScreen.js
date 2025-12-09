import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../auth/index";
import { GlobalStoreContext } from "../store/index";
import EditPlaylistModal from "./EditPlaylistModal";
import PlayPlaylistModal from "./PlayPlaylistModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

const PlaylistsScreen = () => {
  const { auth } = useContext(AuthContext);
  const { store } = useContext(GlobalStoreContext);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    playlistName: "",
    userName: "",
    songTitle: "",
    songArtist: "",
    songYear: "",
  });
  const [sortBy, setSortBy] = useState("listeners");
  const [sortOrder, setSortOrder] = useState("desc");
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [playingPlaylist, setPlayingPlaylist] = useState(null);
  const [deletingPlaylist, setDeletingPlaylist] = useState(null);

  useEffect(() => {
    loadPlaylists();
  }, [sortBy, sortOrder]);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const criteria = { ...searchParams };
      // Remove empty search params
      Object.keys(criteria).forEach((key) => {
        if (!criteria[key]) delete criteria[key];
      });
      await store.searchPlaylists(criteria);
    } catch (error) {
      console.error("Error loading playlists:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadPlaylists();
  };

  const handleClear = () => {
    setSearchParams({
      playlistName: "",
      userName: "",
      songTitle: "",
      songArtist: "",
      songYear: "",
    });
    setTimeout(loadPlaylists, 0);
  };

  const handleSearchParamChange = (field, value) => {
    setSearchParams({
      ...searchParams,
      [field]: value,
    });
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    const [field, order] = value.split("-");
    setSortBy(field);
    setSortOrder(order);
  };

  const handleCreatePlaylist = async () => {
    try {
      await store.createNewList();
      if (store.currentList) {
        setEditingPlaylist(store.currentList);
      }
    } catch (error) {
      console.error("Error creating playlist:", error);
    }
  };

  const handleEdit = (playlist) => {
    setEditingPlaylist(playlist);
  };

  const handlePlay = (playlist) => {
    setPlayingPlaylist(playlist);
  };

  const handleCopy = async (playlist) => {
    try {
      await store.copyPlaylist(playlist._id);
      loadPlaylists();
    } catch (error) {
      console.error("Error copying playlist:", error);
    }
  };

  const handleDelete = (playlist) => {
    setDeletingPlaylist(playlist);
  };

  const confirmDelete = async () => {
    try {
      await store.deleteList(deletingPlaylist._id);
      setDeletingPlaylist(null);
      loadPlaylists();
    } catch (error) {
      console.error("Error deleting playlist:", error);
    }
  };

  return (
    <div className="playlists-screen">
      <div className="search-panel">
        <h2 className="panel-title">Playlists</h2>

        <input
          type="text"
          className="search-input"
          placeholder="by Playlist Name"
          value={searchParams.playlistName}
          onChange={(e) =>
            handleSearchParamChange("playlistName", e.target.value)
          }
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />

        <input
          type="text"
          className="search-input"
          placeholder="by User Name"
          value={searchParams.userName}
          onChange={(e) => handleSearchParamChange("userName", e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />

        <input
          type="text"
          className="search-input"
          placeholder="by Song Title"
          value={searchParams.songTitle}
          onChange={(e) => handleSearchParamChange("songTitle", e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />

        <input
          type="text"
          className="search-input"
          placeholder="by Song Artist"
          value={searchParams.songArtist}
          onChange={(e) =>
            handleSearchParamChange("songArtist", e.target.value)
          }
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />

        <input
          type="text"
          className="search-input"
          placeholder="by Song Year"
          value={searchParams.songYear}
          onChange={(e) => handleSearchParamChange("songYear", e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />

        <div className="search-buttons">
          <button className="btn btn-info" onClick={handleSearch}>
            🔍 Search
          </button>
          <button className="btn btn-secondary" onClick={handleClear}>
            Clear
          </button>
        </div>
      </div>

      <div className="results-panel">
        <div className="results-header">
          <div>
            <label style={{ marginRight: "10px" }}>Sort: </label>
            <select
              className="sort-select"
              value={`${sortBy}-${sortOrder}`}
              onChange={handleSortChange}
            >
              <option value="listeners-desc">Listeners (Hi-Lo)</option>
              <option value="listeners-asc">Listeners (Lo-Hi)</option>
              <option value="name-asc">Playlist Name (A-Z)</option>
              <option value="name-desc">Playlist Name (Z-A)</option>
              <option value="userName-asc">User Name (A-Z)</option>
              <option value="userName-desc">User Name (Z-A)</option>
            </select>
          </div>
          <div className="results-count">{playlists.length} Playlists</div>
        </div>

        {loading ? (
          <div className="loading">Loading playlists...</div>
        ) : playlists.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎵</div>
            <div className="empty-state-text">No playlists found</div>
          </div>
        ) : (
          <div className="playlist-list">
            {playlists.map((playlist) => (
              <div key={playlist._id} className="playlist-card">
                <img
                  src={playlist.owner.avatarImage}
                  alt={playlist.owner.userName}
                  className="playlist-avatar"
                />
                <div className="playlist-info">
                  <div className="playlist-name">{playlist.name}</div>
                  <div className="playlist-owner">
                    {playlist.owner.userName}
                  </div>
                  <div className="playlist-listeners">
                    {playlist.listenerCount} Listeners
                  </div>
                  {playlist.songs.length > 0 && (
                    <div className="playlist-songs-preview">
                      {playlist.songs.slice(0, 3).map((s, i) => (
                        <div key={i}>
                          {i + 1}. {s.song?.title} by {s.song?.artist} (
                          {s.song?.year})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="playlist-actions">
                  {auth.loggedIn && auth.isOwner(playlist.ownerEmail) && (
                    <>
                      <button
                        className="action-btn btn-edit"
                        onClick={() => handleEdit(playlist)}
                      >
                        Edit
                      </button>
                      <button
                        className="action-btn btn-delete"
                        onClick={() => handleDelete(playlist)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {auth.canEdit() && playlist.owner._id !== auth.user?.id && (
                    <button
                      className="action-btn btn-copy"
                      onClick={() => handleCopy(playlist)}
                    >
                      Copy
                    </button>
                  )}
                  <button
                    className="action-btn btn-play"
                    onClick={() => handlePlay(playlist)}
                  >
                    Play
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {
          <button className="new-playlist-btn" onClick={handleCreatePlaylist}>
            ➕ New Playlist
          </button>
        }
      </div>

      {editingPlaylist && (
        <EditPlaylistModal
          playlist={editingPlaylist}
          onClose={() => {
            setEditingPlaylist(null);
            loadPlaylists();
          }}
        />
      )}

      {playingPlaylist && (
        <PlayPlaylistModal
          playlist={playingPlaylist}
          onClose={() => setPlayingPlaylist(null)}
        />
      )}

      {deletingPlaylist && (
        <DeleteConfirmModal
          title="Delete playlist?"
          message={`Are you sure you want to delete the ${deletingPlaylist.name} playlist?`}
          subMessage="Doing so means it will be permanently removed."
          onConfirm={confirmDelete}
          onCancel={() => setDeletingPlaylist(null)}
        />
      )}
    </div>
  );
};

export default PlaylistsScreen;
