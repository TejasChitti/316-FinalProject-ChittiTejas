import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useContext } from "react";
import { AuthContextProvider } from "../auth/index";
import AuthContext from "../auth/index";
import { GlobalStoreContextProvider } from "../store/index";
import { GlobalStoreContext } from "../store/index";
import TitleBar from "./TitleBar";
import WelcomeScreen from "./WelcomeScreen";
import Login from "./Login";
import Register from "./Register";
import EditAccount from "./EditAccount";
import PlaylistsScreen from "./PlaylistsScreen";
import SongsScreen from "./SongsScreen";
import "../App.css";

const PrivateRoute = ({ children }) => {
  const { auth } = useContext(AuthContext);

  // Show loading while checking auth
  if (auth.loading) {
    return <div className="loading">Loading...</div>;
  }

  // Redirect if not logged in or is guest
  if (!auth.loggedIn || auth.isGuest) {
    return <Navigate to="/login" />;
  }

  return children;
};

const GuestRoute = ({ children }) => {
  const { auth } = useContext(AuthContext);

  // Show loading while checking auth
  if (auth.loading) {
    return <div className="loading">Loading...</div>;
  }

  // Redirect if not logged in and not guest
  if (!auth.loggedIn && !auth.isGuest) {
    return <Navigate to="/" />;
  }

  return children;
};

function AppContent() {
  return (
    <div className="app">
      <div className="main-content">
        <TitleBar />
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/edit-account"
            element={
              <PrivateRoute>
                <EditAccount />
              </PrivateRoute>
            }
          />
          <Route
            path="/playlists"
            element={
              <GuestRoute>
                <PlaylistsScreen />
              </GuestRoute>
            }
          />
          <Route
            path="/songs"
            element={
              <GuestRoute>
                <SongsScreen />
              </GuestRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthContextProvider>
        <GlobalStoreContextProvider>
          <AppContent />
        </GlobalStoreContextProvider>
      </AuthContextProvider>
    </Router>
  );
}

export default App;
