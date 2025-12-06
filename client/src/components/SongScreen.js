import React, { useState, useEffect } from "react";
import YouTube from "react-youtube";
import { useAuth } from "../contexts/AuthContext";
import { songsAPI, playlistsAPI } from "../services/api";
import EditSongModal from "./EditSongModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

const SongsScreen = () => {
  const { user, isAuthenticated } = useAuth();
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    title: "",
    artist: "",
    year: "",
  });
  const [sortBy, setSortBy] = useState("listens");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedSong, setSelectedSong] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [editingSong, setEditingSong] = useState(null);
  const [deletingSong, setDeletingSong] = useState(null);
  const [showNewSongModal, setShowNewSongModal] = useState(false);

  useEffect(() => {
    loadSongs();
    if (isAuthenticated) {
      loadPlaylists();
    }
  }, [sortBy, sortOrder, isAuthenticated]);

  const loadSongs = async () => {
    try {
      setLoading(true);
      const params = {
        ...searchParams,
        sortBy,
        sortOrder,
      };
      const response = await songsAPI.getAll(params);
      setSongs(response.data);
      if (response.data.length > 0) {
        setSelectedSong(response.data[0]);
      }
    } catch (error) {
      console.error("Error loading songs:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPlaylists = async () => {
    try {
      const response = await playlistsAPI.getAll({});
      const userPlaylists = response.data
        .filter((p) => p.owner._id === user?.id)
        .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed));
      setPlaylists(userPlaylists);
    } catch (error) {
      console.error("Error loading playlists:", error);
    }
  };

  const handleSearch = () => {
    loadSongs();
  };

  const handleClear = () => {
    setSearchParams({
      title: "",
      artist: "",
      year: "",
    });
    setTimeout(loadSongs, 0);
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

  const handleSongClick = (song) => {
    setSelectedSong(song);
  };

  const handleMenuToggle = (songId) => {
    setOpenMenu(openMenu === songId ? null : songId);
  };

  const handleAddToPlaylist = async (song, playlistId) => {
    try {
      const playlist = playlists.find((p) => p._id === playlistId);
      const newSongs = [
        ...playlist.songs,
        {
          song: song._id,
          order: playlist.songs.length,
        },
      ];

      await playlistsAPI.update(playlistId, { songs: newSongs });
      setOpenMenu(null);
      alert("Song added to playlist!");
    } catch (error) {
      console.error("Error adding song to playlist:", error);
      alert("Failed to add song to playlist");
    }
  };

  const handleEditSong = (song) => {
    setEditingSong(song);
    setOpenMenu(null);
  };

  const handleDeleteSong = (song) => {
    setDeletingSong(song);
    setOpenMenu(null);
  };

  const confirmDelete = async () => {
    try {
      await songsAPI.delete(deletingSong._id);
      setDeletingSong(null);
      loadSongs();
    } catch (error) {
      console.error("Error deleting song:", error);
      alert("Failed to delete song");
    }
  };

  const youtubeOpts = {
    height: "200",
    width: "356",
    playerVars: {
      autoplay: 0,
    },
  };

  return (
    <div className="songs-screen">
      <div className="search-panel">
        <h2 className="panel-title">Songs Catalog</h2>

        <input
          type="text"
          className="search-input"
          placeholder="by Title"
          value={searchParams.title}
          onChange={(e) => handleSearchParamChange("title", e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />

        <input
          type="text"
          className="search-input"
          placeholder="by Artist"
          value={searchParams.artist}
          onChange={(e) => handleSearchParamChange("artist", e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />

        <input
          type="text"
          className="search-input"
          placeholder="by Year"
          value={searchParams.year}
          onChange={(e) => handleSearchParamChange("year", e.target.value)}
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

        {selectedSong && (
          <div className="youtube-preview">
            <YouTube videoId={selectedSong.youtubeId} opts={youtubeOpts} />
          </div>
        )}

        {isAuthenticated && (
          <button
            className="new-playlist-btn"
            onClick={() => setShowNewSongModal(true)}
          >
            ➕ New Song
          </button>
        )}
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
              <option value="listens-desc">Listens (Hi-Lo)</option>
              <option value="listens-asc">Listens (Lo-Hi)</option>
              <option value="playlists-desc">Playlists (Hi-Lo)</option>
              <option value="playlists-asc">Playlists (Lo-Hi)</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="artist-asc">Artist (A-Z)</option>
              <option value="artist-desc">Artist (Z-A)</option>
              <option value="year-desc">Year (Hi-Lo)</option>
              <option value="year-asc">Year (Lo-Hi)</option>
            </select>
          </div>
          <div className="results-count">{songs.length} Songs</div>
        </div>

        {loading ? (
          <div className="loading">Loading songs...</div>
        ) : songs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎵</div>
            <div className="empty-state-text">No songs found</div>
          </div>
        ) : (
          <div className="playlist-list">
            {songs.map((song) => {
              const isOwned = isAuthenticated && song.addedBy._id === user?.id;
              return (
                <div
                  key={song._id}
                  className={`song-card ${isOwned ? "owned" : ""}`}
                  onClick={() => handleSongClick(song)}
                >
                  <div className="song-info">
                    <div className="song-title">
                      {song.title} by {song.artist} ({song.year})
                    </div>
                    <div className="song-stats">
                      <span>Listens: {song.listens}</span>
                      <span>Playlists: {song.playlistCount}</span>
                    </div>
                  </div>
                  {isAuthenticated && (
                    <div className="song-menu">
                      <button
                        className="menu-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuToggle(song._id);
                        }}
                      >
                        ⋮
                      </button>
                      {openMenu === song._id && (
                        <div className="menu-dropdown">
                          {playlists.length > 0 && (
                            <div
                              className="menu-item"
                              style={{ position: "relative" }}
                            >
                              Add to Playlist ▶
                              <div className="submenu">
                                {playlists.map((playlist) => (
                                  <div
                                    key={playlist._id}
                                    className="menu-item"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddToPlaylist(song, playlist._id);
                                    }}
                                  >
                                    {playlist.name}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {isOwned && (
                            <>
                              <div
                                className="menu-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditSong(song);
                                }}
                              >
                                Edit Song
                              </div>
                              <div
                                className="menu-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSong(song);
                                }}
                              >
                                Remove from Catalog
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editingSong && (
        <EditSongModal
          song={editingSong}
          onClose={() => {
            setEditingSong(null);
            loadSongs();
          }}
        />
      )}

      {showNewSongModal && (
        <EditSongModal
          song={null}
          onClose={() => {
            setShowNewSongModal(false);
            loadSongs();
          }}
        />
      )}

      {deletingSong && (
        <DeleteConfirmModal
          title="Remove Song?"
          message="Are you sure you want to remove the song from the catalog?"
          subMessage="Doing so will remove it from all of your playlists."
          onConfirm={confirmDelete}
          onCancel={() => setDeletingSong(null)}
        />
      )}
    </div>
  );
};

export default SongsScreen;
