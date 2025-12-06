import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    passwordConfirm: "",
    avatarImage: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const handleAvatarSelect = () => {
    // In a real app, this would open a file picker
    // For demo purposes, using placeholder URLs
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.userName.trim()) {
      newErrors.userName = "User name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = "Passwords do not match";
    }

    if (!formData.avatarImage) {
      newErrors.avatarImage = "Please select an avatar image";
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

    setErrors({});
    setLoading(true);

    try {
      await register({
        userName: formData.userName,
        email: formData.email,
        password: formData.password,
        avatarImage: formData.avatarImage,
      });
      navigate("/login");
    } catch (error) {
      setErrors({
        general:
          error.response?.data?.error ||
          "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.userName &&
    formData.email &&
    formData.password &&
    formData.passwordConfirm &&
    formData.avatarImage &&
    formData.password === formData.passwordConfirm &&
    formData.password.length >= 8;

  return (
    <div className="auth-screen">
      <div className="auth-icon">🔒</div>
      <h2 className="auth-title">Create Account</h2>

      {errors.general && <div className="error">{errors.general}</div>}

      <form onSubmit={handleSubmit}>
        <div className="avatar-selector">
          {formData.avatarImage ? (
            <img
              src={formData.avatarImage}
              alt="Avatar"
              className="avatar-preview"
            />
          ) : (
            <div
              className="avatar-preview"
              style={{
                background: "#ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              👤
            </div>
          )}
          <button
            type="button"
            className="avatar-button-small"
            onClick={handleAvatarSelect}
          >
            Select Avatar
          </button>
          {errors.avatarImage && (
            <div className="error-message">{errors.avatarImage}</div>
          )}
        </div>

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
            type="email"
            name="email"
            className={`form-input ${errors.email ? "error" : ""}`}
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>

        <div className="form-group">
          <input
            type="password"
            name="password"
            className={`form-input ${errors.password ? "error" : ""}`}
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
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
            placeholder="Password Confirm"
            value={formData.passwordConfirm}
            onChange={handleChange}
            required
          />
          {errors.passwordConfirm && (
            <div className="error-message">{errors.passwordConfirm}</div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%" }}
          disabled={!isFormValid || loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div className="form-link" onClick={() => navigate("/login")}>
        Already have an account? Sign In
      </div>

      <div className="copyright">Copyright © Playlister 2025</div>
    </div>
  );
};

export default Register;
