import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/index";

const EditAccount = () => {
  const navigate = useNavigate();
  const { user, updateAccount } = useAuth();
  const [formData, setFormData] = useState({
    userName: user?.userName || "",
    password: "",
    passwordConfirm: "",
    avatarImage: user?.avatarImage || "",
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

  const handleAvatarSelect = () => {
    const avatarUrls = [
      "https://i.pravatar.cc/150?img=1",
      "https://i.pravatar.cc/150?img=2",
      "https://i.pravatar.cc/150?img=3",
      "https://i.pravatar.cc/150?img=4",
      "https://i.pravatar.cc/150?img=5",
    ];
    const randomAvatar =
      avatarUrls[Math.floor(Math.random() * avatarUrls.length)];
    setFormData({ ...formData, avatarImage: randomAvatar });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.userName.trim()) {
      newErrors.userName = "User name is required";
    }
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        userName: formData.userName,
        avatarImage: formData.avatarImage,
      };
      if (formData.password) {
        updateData.password = formData.password;
      }

      await updateAccount(updateData);
      navigate("/playlists");
    } catch (error) {
      setErrors({ general: error.response?.data?.error || "Update failed" });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.userName.trim() &&
    formData.avatarImage &&
    ((!formData.password && !formData.passwordConfirm) ||
      (formData.password === formData.passwordConfirm &&
        formData.password.length >= 8));

  return (
    <div className="auth-screen">
      <div className="auth-icon">
        <img src="/lock.png" />
      </div>
      <h2 className="auth-title">Edit Account</h2>

      {errors.general && <div className="error">{errors.general}</div>}

      <form className="form" onSubmit={handleSubmit}>
        <div className="avatar-selector">
          <img
            src={formData.avatarImage}
            alt="Avatar"
            className="avatar-preview"
          />
          <button
            type="button"
            className="avatar-button-small"
            onClick={handleAvatarSelect}
          >
            Select
          </button>
        </div>
        <div>
          <div className="form-group">
            <input
              type="text"
              name="userName"
              className={`form-input ${errors.userName ? "error" : ""}`}
              placeholder="User Name"
              value={formData.userName}
              onChange={handleChange}
              required
            />
            {errors.userName && (
              <div className="error-message">{errors.userName}</div>
            )}
          </div>

          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="Email"
              value={user?.email}
              disabled
              style={{ background: "#f0f0f0", cursor: "not-allowed" }}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              className={`form-input ${errors.password ? "error" : ""}`}
              placeholder="New Password (leave blank to keep current)"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          <div className="form-group">
            <input
              type="password"
              name="passwordConfirm"
              className={`form-input ${errors.passwordConfirm ? "error" : ""}`}
              placeholder="Confirm New Password"
              value={formData.passwordConfirm}
              onChange={handleChange}
            />
            {errors.passwordConfirm && (
              <div className="error-message">{errors.passwordConfirm}</div>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              disabled={!isFormValid || loading}
            >
              {loading ? "Updating..." : "Complete"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => navigate("/playlists")}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>

      <div className="copyright">Copyright © Playlister 2025</div>
    </div>
  );
};

export default EditAccount;
