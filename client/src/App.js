import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import TitleBar from "./components/TitleBar";
import WelcomeScreen from "./components/WelcomeScreen";
import Login from "./components/Login";
import Register from "./components/Register";
import EditAccount from "./components/EditAccount";
import PlaylistsScreen from "./components/PlaylistsScreen";
import SongsScreen from "./components/SongsScreen";
import "App.css";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated, isGuest, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return isAuthenticated || isGuest ? children : <Navigate to="/" />;
};

function AppContent() {
  return (
    <div className="app">
      <TitleBar />
      <div className="main-content">
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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
