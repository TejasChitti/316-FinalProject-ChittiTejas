import React, { useState, useEffect, useContext } from "react";
import YouTube from "react-youtube";
import { GlobalStoreContext } from "../store/index";

const PlayPlaylistModal = ({ playlist, onClose }) => {
  const { store } = useContext(GlobalStoreContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeat, setRepeat] = useState(false);

  useEffect(() => {
    // Track that this playlist is being played
    store.playPlaylist(playlist._id).catch(console.error);
  }, [playlist._id, store]);

  const songs = playlist.songs.sort((a, b) => a.order - b.order);
  const currentSong = songs[currentIndex];

  const onReady = (event) => {
    setPlayer(event.target);
  };

  const onEnd = () => {
    handleNext();
  };

  const handlePlay = () => {
    if (player) {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handlePrevious = () => {
    let newIndex = currentIndex - 1;
    if (newIndex < 0) {
      newIndex = songs.length - 1;
    }
    setCurrentIndex(newIndex);
    setIsPlaying(true);
  };

  const handleNext = () => {
    let newIndex = currentIndex + 1;
    if (newIndex >= songs.length) {
      if (repeat) {
        newIndex = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }
    setCurrentIndex(newIndex);
    setIsPlaying(true);
  };

  const handleSongSelect = (index) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const opts = {
    height: "390",
    width: "640",
    playerVars: {
      autoplay: 1,
    },
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "900px" }}
      >
        <div className="modal-header play">Play Playlist</div>
        <div className="modal-body">
          <div style={{ marginBottom: "10px" }}>
            <strong>{playlist.name}</strong> by {playlist.owner.userName}
          </div>

          <div className="player-container">
            <div className="player-playlist">
              {songs.map((item, index) => (
                <div
                  key={index}
                  className="song-item"
                  style={{
                    background: index === currentIndex ? "#ffd700" : "#fff",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSongSelect(index)}
                >
                  <div className="song-item-info">
                    {index + 1}. {item.song?.title} by {item.song?.artist} (
                    {item.song?.year})
                  </div>
                </div>
              ))}
            </div>

            <div className="player-video">
              {currentSong && currentSong.song && (
                <YouTube
                  videoId={currentSong.song.youtubeId}
                  opts={opts}
                  onReady={onReady}
                  onEnd={onEnd}
                />
              )}
            </div>
          </div>

          <div className="player-controls">
            <button className="control-button" onClick={handlePrevious}>
              ⏮️
            </button>
            <button className="control-button" onClick={handlePlay}>
              {isPlaying ? "⏸️" : "▶️"}
            </button>
            <button className="control-button" onClick={handleNext}>
              ⏭️
            </button>
            <label
              style={{
                marginLeft: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <input
                type="checkbox"
                checked={repeat}
                onChange={(e) => setRepeat(e.target.checked)}
              />
              Repeat
            </label>
          </div>
        </div>
        <div className="modal-footer">
          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayPlaylistModal;
