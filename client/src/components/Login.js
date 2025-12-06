import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await login(formData);
      navigate("/playlists");
    } catch (error) {
      setErrors({
        general:
          error.response?.data?.error || "Login failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-icon">🔒</div>
      <h2 className="auth-title">Sign In</h2>

      {errors.general && <div className="error">{errors.general}</div>}

      <form onSubmit={handleSubmit}>
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

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%" }}
          disabled={loading}
        >
          {loading ? "Signing In..." : "SIGN IN"}
        </button>
      </form>

      <div className="form-link" onClick={() => navigate("/register")}>
        Don't have an account? Sign Up
      </div>

      <div className="copyright">Copyright © Playlister 2025</div>
    </div>
  );
};

export default Login;
