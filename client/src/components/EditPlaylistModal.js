import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { playlistsAPI } from "../services/api";

const EditPlaylistModal = ({ playlist, onClose }) => {
  const navigate = useNavigate();
  const [name, setName] = useState(playlist.name);
  const [songs, setSongs] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (playlist.songs && playlist.songs.length > 0) {
      const sortedSongs = [...playlist.songs].sort((a, b) => a.order - b.order);
      setSongs(sortedSongs);
      setHistory([sortedSongs]);
      setHistoryIndex(0);
    } else {
      setHistory([[]]);
      setHistoryIndex(0);
    }
  }, [playlist]);

  const addToHistory = (newSongs) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newSongs);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setSongs(newSongs);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSongs(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSongs(history[historyIndex + 1]);
    }
  };

  const handleMoveSong = (index, direction) => {
    const newSongs = [...songs];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSongs.length) return;

    [newSongs[index], newSongs[targetIndex]] = [
      newSongs[targetIndex],
      newSongs[index],
    ];

    // Update order
    newSongs.forEach((song, i) => {
      song.order = i;
    });

    addToHistory(newSongs);
  };

  const handleRemoveSong = (index) => {
    const newSongs = songs.filter((_, i) => i !== index);
    newSongs.forEach((song, i) => {
      song.order = i;
    });
    addToHistory(newSongs);
  };

  const handleAddSong = () => {
    navigate("/songs");
    onClose();
  };

  const handleSave = async () => {
    try {
      await playlistsAPI.update(playlist._id, {
        name,
        songs: songs.map((s) => ({
          song: s.song._id || s.song,
          order: s.order,
        })),
      });
      onClose();
    } catch (error) {
      console.error("Error updating playlist:", error);
      alert("Failed to update playlist");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header edit">Edit Playlist</div>
        <div className="modal-body">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <input
              type="text"
              className="playlist-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Playlist Name"
            />
            <button className="add-song-button" onClick={handleAddSong}>
              ➕
            </button>
          </div>

          <div className="song-list">
            {songs.map((item, index) => (
              <div key={index} className="song-item">
                <div className="song-item-info">
                  {index + 1}. {item.song?.title} by {item.song?.artist} (
                  {item.song?.year})
                </div>
                <div className="song-item-actions">
                  <button
                    className="icon-button"
                    onClick={() => handleMoveSong(index, "up")}
                    disabled={index === 0}
                  >
                    ⬆️
                  </button>
                  <button
                    className="icon-button"
                    onClick={() => handleMoveSong(index, "down")}
                    disabled={index === songs.length - 1}
                  >
                    ⬇️
                  </button>
                  <button
                    className="icon-button"
                    onClick={() => handleRemoveSong(index)}
                  >
                    ✖️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
          >
            ↶ Undo
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
          >
            ↷ Redo
          </button>
          <button className="btn btn-success" onClick={handleSave}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPlaylistModal;
