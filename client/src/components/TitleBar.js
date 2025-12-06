import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const TitleBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isGuest, logout } = useAuth();
  const { showDropdown, setShowDropdown } = useState(false);

  const handleHomeClick = () => {
    navigate("/");
  };

  const handleNavClick = (path) => {
    navigate(path);
  };

  const handleAvatarClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleDropdownAction = (action) => {
    setShowDropdown(false);

    switch (action) {
      case "login":
        navigate("/login");
        break;
      case "register":
        navigate("/register");
        break;
      case "editAccount":
        navigate("/edit-account");
        break;
      case "logout":
        logout();
        navigate("/");
        break;
      default:
        break;
    }
  };

  if (location.pathname === "/" && !isAuthenticated && !isGuest) {
    return null;
  }

  return (
    <div className="title-bar">
      <div className="title-bar-left">
        <div className="home-icon" onClick={handleHomeClick}>
          <img className="home-image" src="/icon.png" />
        </div>
        {(isAuthenticated || isGuest) && (
          <div className="nav-buttons">
            <button
              className={`nav-button ${
                location.pathname === "/playlists" ? "active" : ""
              }`}
              onClick={() => handleNavClick("/playlists")}
            >
              Playlists
            </button>
            <button
              className={`nav-button ${
                location.pathname === "/songs" ? "active" : ""
              }`}
              onClick={() => handleNavClick("/songs")}
            >
              Song Catalog
            </button>
          </div>
        )}
      </div>

      <div className="title-bar-center">The Playlister</div>

      <div className="account-menu">
        {isAuthenticated ? (
          <>
            <img
              src={user.avatarImage}
              alt="Avatar"
              className="avatar-button"
              onClick={handleAvatarClick}
            />
            {showDropdown && (
              <div className="dropdown-menu">
                <button
                  className="dropdown-item"
                  onClick={() => handleDropdownAction("editAccount")}
                >
                  Edit Account
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => handleDropdownAction("logout")}
                >
                  Logout
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="avatar-icon" onClick={handleAvatarClick}>
              👤
            </div>
            {showDropdown && (
              <div className="dropdown-menu">
                <button
                  className="dropdown-item"
                  onClick={() => handleDropdownAction("login")}
                >
                  Login
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => handleDropdownAction("register")}
                >
                  Create Account
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TitleBar;
