import React, { useState } from "react";
import { songsAPI } from "../services/api";

const EditSongModal = ({ song, onClose }) => {
  const [formData, setFormData] = useState({
    title: song?.title || "",
    artist: song?.artist || "",
    year: song?.year || new Date().getFullYear(),
    youtubeId: song?.youtubeId || "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.artist.trim()) {
      newErrors.artist = "Artist is required";
    }

    const year = parseInt(formData.year);
    const currentYear = new Date().getFullYear();
    if (!year || year < 1900 || year > currentYear) {
      newErrors.year = `Year must be between 1900 and ${currentYear}`;
    }

    if (!formData.youtubeId.trim()) {
      newErrors.youtubeId = "YouTube ID is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...formData,
        year: parseInt(formData.year),
      };

      if (song) {
        await songsAPI.update(song._id, data);
      } else {
        await songsAPI.create(data);
      }
      onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Operation failed";
      setErrors({ general: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.title.trim() &&
    formData.artist.trim() &&
    formData.youtubeId.trim() &&
    formData.year >= 1900 &&
    formData.year <= new Date().getFullYear();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header edit">
          {song ? "Edit Song" : "New Song"}
        </div>
        <div className="modal-body">
          {errors.general && <div className="error">{errors.general}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="title"
                className={`form-input ${errors.title ? "error" : ""}`}
                placeholder="Title"
                value={formData.title}
                onChange={handleChange}
                required
              />
              {errors.title && (
                <div className="error-message">{errors.title}</div>
              )}
            </div>

            <div className="form-group">
              <input
                type="text"
                name="artist"
                className={`form-input ${errors.artist ? "error" : ""}`}
                placeholder="Artist"
                value={formData.artist}
                onChange={handleChange}
                required
              />
              {errors.artist && (
                <div className="error-message">{errors.artist}</div>
              )}
            </div>

            <div className="form-group">
              <input
                type="number"
                name="year"
                className={`form-input ${errors.year ? "error" : ""}`}
                placeholder="Year"
                value={formData.year}
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear()}
                required
              />
              {errors.year && (
                <div className="error-message">{errors.year}</div>
              )}
            </div>

            <div className="form-group">
              <input
                type="text"
                name="youtubeId"
                className={`form-input ${errors.youtubeId ? "error" : ""}`}
                placeholder="YouTube Id (e.g., dQw4w9WgXcQ)"
                value={formData.youtubeId}
                onChange={handleChange}
                required
              />
              {errors.youtubeId && (
                <div className="error-message">{errors.youtubeId}</div>
              )}
              <div
                style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}
              >
                The YouTube ID is the part after "v=" in the URL
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="submit"
                className="btn btn-success"
                disabled={!isFormValid || loading}
              >
                {loading ? "Saving..." : "Complete"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSongModal;
