import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const { continueAsGuest } = useAuth();

  const handleContinueAsGuest = () => {
    continueAsGuest();
    navigate("/playlists");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleCreateAccount = () => {
    navigate("/register");
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-logo">🎵</div>
      <h1 className="welcome-title">The Playlister</h1>
      <div className="welcome-buttons">
        <button className="btn btn-primary" onClick={handleContinueAsGuest}>
          Continue as Guest
        </button>
        <button className="btn btn-secondary" onClick={handleLogin}>
          Login
        </button>
        <button className="btn btn-secondary" onClick={handleCreateAccount}>
          Create Account
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
