import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../auth/index";
import { GlobalStoreContext } from "../store/index";

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const { store } = useContext(GlobalStoreContext);
  const handleContinueAsGuest = () => {
    auth.continueAsGuest(store);
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
      <h1 className="welcome-title">The Playlister</h1>
      <img className="welcome-image" src="/welcome.png" />
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
