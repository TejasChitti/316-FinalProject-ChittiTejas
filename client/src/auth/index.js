import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./requests";

const AuthContext = createContext();

export const AuthActionType = {
  GET_LOGGED_IN: "GET_LOGGED_IN",
  REGISTER_USER: "REGISTER_USER",
  LOGIN_USER: "LOGIN_USER",
  LOGOUT_USER: "LOGOUT_USER",
  SET_ERROR_MESSAGE: "SET_ERROR_MESSAGE",
  CONTINUE_AS_GUEST: "CONTINUE_AS_GUEST",
  UPDATE_USER: "UPDATE_USER",
};

function AuthContextProvider(props) {
  const [auth, setAuth] = useState({
    user: null,
    loggedIn: false,
    isGuest: false,
    errorMessage: null,
  });
  const navigate = useNavigate();

  auth.getLoggedIn = async function () {
    try {
      const response = await api.getLoggedIn();
      if (response.data.loggedIn) {
        setAuth({
          user: response.data.user,
          loggedIn: true,
          isGuest: false,
          errorMessage: null,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  auth.registerUser = async function (userData, store) {
    try {
      const response = await api.registerUser(userData);
      if (response.data.success) {
        setAuth({
          user: null,
          loggedIn: false,
          isGuest: false,
          errorMessage: null,
        });
        navigate("/login");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.errorMessage || "Registration failed";
      setAuth({
        user: null,
        loggedIn: false,
        isGuest: false,
        errorMessage: errorMessage,
      });
    }
  };

  auth.loginUser = async function (email, password, store) {
    try {
      const response = await api.loginUser(email, password);
      if (response.data.success) {
        setAuth({
          user: response.data.user,
          loggedIn: true,
          isGuest: false,
          errorMessage: null,
        });
        navigate("/playlists");
        store.loadIdNamePairs();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.errorMessage || "Login failed";
      setAuth({
        user: null,
        loggedIn: false,
        isGuest: false,
        errorMessage: errorMessage,
      });
    }
  };

  auth.logoutUser = async function (store) {
    try {
      await api.logoutUser();
      setAuth({
        user: null,
        loggedIn: false,
        isGuest: false,
        errorMessage: null,
      });
      store.closeCurrentList();
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  auth.continueAsGuest = function (store) {
    setAuth({
      user: null,
      loggedIn: false,
      isGuest: true,
      errorMessage: null,
    });
    navigate("/playlists");
    store.loadIdNamePairs();
  };

  auth.updateUser = async function (userData) {
    try {
      const response = await api.updateUser(userData);
      if (response.data.success) {
        setAuth({
          user: response.data.user,
          loggedIn: true,
          isGuest: false,
          errorMessage: null,
        });
        navigate("/playlists");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.errorMessage || "Update failed";
      setAuth({
        ...auth,
        errorMessage: errorMessage,
      });
    }
  };

  auth.setErrorMessage = function (message) {
    setAuth({
      ...auth,
      errorMessage: message,
    });
  };

  auth.clearErrorMessage = function () {
    setAuth({
      ...auth,
      errorMessage: null,
    });
  };

  auth.canEdit = function () {
    return auth.loggedIn && !auth.isGuest;
  };

  auth.isOwner = function (email) {
    return auth.loggedIn && auth.user && auth.user.email === email;
  };

  return (
    <AuthContext.Provider value={{ auth }}>
      {props.children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
export { AuthContextProvider };
