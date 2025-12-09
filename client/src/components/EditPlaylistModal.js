import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GlobalStoreContext } from "../store/index";

const EditPlaylistModal = ({ playlist, onClose }) => {
  const navigate = useNavigate();
  const [name, setName] = useState(playlist.name);
  const [songs, setSongs] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const { store } = useContext(GlobalStoreContext);

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
    store.undo();
  };

  const handleRedo = () => {
    store.redo();
  };

  const handleMoveSong = (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= songs.length) return;

    store.addMoveSongTransaction(index, targetIndex);
  };

  const handleRemoveSong = (index) => {
    store.addRemoveSongTransaction(index);
  };

  const handleAddSong = () => {
    navigate("/songs");
    onClose();
  };

  const handleSave = async () => {
    try {
      // Update the current playlist in store
      const updatedPlaylist = {
        ...playlist,
        name,
        songs: songs.map((s) => s.song._id || s.song),
      };

      store.currentList = updatedPlaylist;
      await store.updateCurrentList();
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
              <img
                src="musicnote.png
              "
              />
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
