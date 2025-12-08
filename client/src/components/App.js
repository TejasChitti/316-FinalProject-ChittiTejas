import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "../auth/index";
import TitleBar from "./TitleBar";
import WelcomeScreen from "./WelcomeScreen";
import Login from "./Login";
import Register from "./Register";
import EditAccount from "./EditAccount";
import PlaylistsScreen from "./PlaylistsScreen";
import SongsScreen from "./SongsScreen";
import "../App.css";

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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
