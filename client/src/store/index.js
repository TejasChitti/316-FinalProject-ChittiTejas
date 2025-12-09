import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./requests/index";
import { jsTPS } from "jstps";
import AuthContext from "../auth/index";
import MoveSong_Transaction from "../transactions/MoveSong_Transaction";
import AddSong_Transaction from "../transactions/CreateSong_Transaction";
import RemoveSong_Transaction from "../transactions/RemoveSong_Transaction";
import UpdateSong_Transaction from "../transactions/UpdateSong_Transaction";

export const GlobalStoreContext = createContext({});

export const GlobalStoreActionType = {
  CHANGE_LIST_NAME: "CHANGE_LIST_NAME",
  CLOSE_CURRENT_LIST: "CLOSE_CURRENT_LIST",
  CREATE_NEW_LIST: "CREATE_NEW_LIST",
  LOAD_ID_NAME_PAIRS: "LOAD_ID_NAME_PAIRS",
  MARK_LIST_FOR_DELETION: "MARK_LIST_FOR_DELETION",
  SET_CURRENT_LIST: "SET_CURRENT_LIST",
  SET_LIST_NAME_EDIT_ACTIVE: "SET_LIST_NAME_EDIT_ACTIVE",
  EDIT_SONG: "EDIT_SONG",
  REMOVE_SONG: "REMOVE_SONG",
  HIDE_MODALS: "HIDE_MODALS",
  SET_SEARCH_CRITERIA: "SET_SEARCH_CRITERIA",
  SET_SORT_TYPE: "SET_SORT_TYPE",
  LOAD_SONGS: "LOAD_SONGS",
  SELECT_SONG: "SELECT_SONG",
  SET_PLAYING_PLAYLIST: "SET_PLAYING_PLAYLIST",
};

export const CurrentModal = {
  NONE: "NONE",
  DELETE_LIST: "DELETE_LIST",
  EDIT_SONG: "EDIT_SONG",
  REMOVE_SONG: "REMOVE_SONG",
  ERROR: "ERROR",
  PLAY_LIST: "PLAY_LIST",
};

function GlobalStoreContextProvider(props) {
  const [store, setStore] = useState({
    currentModal: CurrentModal.NONE,
    idNamePairs: [],
    currentList: null,
    currentSongIndex: -1,
    currentSong: null,
    newListCounter: 0,
    listNameActive: false,
    listIdMarkedForDeletion: null,
    listMarkedForDeletion: null,
    errorMessage: null,
    searchCriteria: {},
    sortType: "listeners-hi-lo",
    songs: [],
    selectedSong: null,
    playingPlaylist: null,
    currentSongPlaying: 0,
  });
  const history = useNavigate();

  const tps = new jsTPS();

  const storeReducer = (action) => {
    const { type, payload } = action;
    switch (type) {
      case GlobalStoreActionType.CHANGE_LIST_NAME: {
        return setStore({
          ...store,
          currentList: payload.playlist,
          idNamePairs: store.idNamePairs.map((pair) =>
            pair._id === payload.playlist._id ? payload.playlist : pair
          ),
        });
      }
      case GlobalStoreActionType.CLOSE_CURRENT_LIST: {
        return setStore({
          ...store,
          currentList: null,
          currentSongIndex: -1,
          currentSong: null,
          newListCounter: 0,
          listNameActive: false,
        });
      }
      case GlobalStoreActionType.CREATE_NEW_LIST: {
        return setStore({
          ...store,
          idNamePairs: [...store.idNamePairs, payload],
          currentList: payload,
          newListCounter: store.newListCounter + 1,
        });
      }
      case GlobalStoreActionType.LOAD_ID_NAME_PAIRS: {
        return setStore({
          ...store,
          idNamePairs: payload,
          currentList: null,
        });
      }
      case GlobalStoreActionType.MARK_LIST_FOR_DELETION: {
        return setStore({
          ...store,
          currentModal: CurrentModal.DELETE_LIST,
          listIdMarkedForDeletion: payload.id,
          listMarkedForDeletion: payload.playlist,
        });
      }
      case GlobalStoreActionType.SET_CURRENT_LIST: {
        return setStore({
          ...store,
          currentList: payload,
        });
      }
      case GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE: {
        return setStore({
          ...store,
          listNameActive: true,
        });
      }
      case GlobalStoreActionType.EDIT_SONG: {
        return setStore({
          ...store,
          currentModal: CurrentModal.EDIT_SONG,
          currentSongIndex: payload.currentSongIndex,
          currentSong: payload.currentSong,
        });
      }
      case GlobalStoreActionType.REMOVE_SONG: {
        return setStore({
          ...store,
          currentModal: CurrentModal.REMOVE_SONG,
          currentSongIndex: payload.currentSongIndex,
          currentSong: payload.currentSong,
        });
      }
      case GlobalStoreActionType.HIDE_MODALS: {
        return setStore({
          ...store,
          currentModal: CurrentModal.NONE,
          currentSongIndex: -1,
          currentSong: null,
          listIdMarkedForDeletion: null,
          listMarkedForDeletion: null,
        });
      }
      case GlobalStoreActionType.SET_SEARCH_CRITERIA: {
        return setStore({
          ...store,
          searchCriteria: payload,
        });
      }
      case GlobalStoreActionType.SET_SORT_TYPE: {
        return setStore({
          ...store,
          sortType: payload,
        });
      }
      case GlobalStoreActionType.LOAD_SONGS: {
        return setStore({
          ...store,
          songs: payload,
        });
      }
      case GlobalStoreActionType.SELECT_SONG: {
        return setStore({
          ...store,
          selectedSong: payload,
        });
      }
      case GlobalStoreActionType.SET_PLAYING_PLAYLIST: {
        return setStore({
          ...store,
          currentModal: CurrentModal.PLAY_LIST,
          playingPlaylist: payload,
          currentSongPlaying: 0,
        });
      }
      default:
        return store;
    }
  };

  // PLAYLIST FUNCTIONS
  store.createNewList = async function () {
    try {
      const response = await api.createPlaylist({});
      if (response.data.success) {
        let newList = response.data.playlist;
        storeReducer({
          type: GlobalStoreActionType.CREATE_NEW_LIST,
          payload: newList,
        });
        store.setCurrentList(newList._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  store.loadIdNamePairs = async function () {
    try {
      const response = await api.getPlaylists(store.searchCriteria);
      console.log(
        "pairsArray =",
        response.data.playlists,
        Array.isArray(response.data.playlists)
      ); // 👈 ADD THIS
      if (response.data.success) {
        let pairsArray = response.data.playlists;
        storeReducer({
          type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
          payload: pairsArray,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  store.setCurrentList = async function (id) {
    try {
      const response = await api.getPlaylistById(id);
      if (response.data.success) {
        let playlist = response.data.playlist;
        storeReducer({
          type: GlobalStoreActionType.SET_CURRENT_LIST,
          payload: playlist,
        });
        tps.clearAllTransactions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  store.closeCurrentList = function () {
    storeReducer({
      type: GlobalStoreActionType.CLOSE_CURRENT_LIST,
      payload: {},
    });
    tps.clearAllTransactions();
    history.push("/playlists");
  };

  store.updateCurrentList = async function () {
    try {
      const response = await api.updatePlaylistById(
        store.currentList._id,
        store.currentList
      );
      if (response.data.success) {
        storeReducer({
          type: GlobalStoreActionType.SET_CURRENT_LIST,
          payload: response.data.playlist,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  store.deleteList = async function (id) {
    try {
      await api.deletePlaylistById(id);
      store.loadIdNamePairs();
      store.hideModals();
    } catch (err) {
      console.error(err);
    }
  };

  store.deleteMarkedList = async function () {
    await store.deleteList(store.listIdMarkedForDeletion);
  };

  store.copyPlaylist = async function (id) {
    try {
      const response = await api.copyPlaylist(id);
      if (response.data.success) {
        store.loadIdNamePairs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  store.markListForDeletion = function (id) {
    const playlist = store.idNamePairs.find((p) => p._id === id);
    storeReducer({
      type: GlobalStoreActionType.MARK_LIST_FOR_DELETION,
      payload: { id: id, playlist: playlist },
    });
  };

  store.playPlaylist = async function (id) {
    try {
      await api.playPlaylist(id);
      const response = await api.getPlaylistById(id);
      if (response.data.success) {
        storeReducer({
          type: GlobalStoreActionType.SET_PLAYING_PLAYLIST,
          payload: response.data.playlist,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // SONG FUNCTIONS
  store.addSongToPlaylist = async function (song) {
    let newSongs = [...store.currentList.songs, song._id];
    store.currentList.songs = newSongs;
    await store.updateCurrentList();
    return newSongs.length - 1; // Return the index where song was added
  };

  store.addSongToPlaylistAtIndex = async function (song, index) {
    let newSongs = [...store.currentList.songs];
    newSongs.splice(index, 0, song._id);
    store.currentList.songs = newSongs;
    await store.updateCurrentList();
  };

  store.removeSongFromPlaylist = async function (index) {
    let newSongs = [...store.currentList.songs];
    newSongs.splice(index, 1);
    store.currentList.songs = newSongs;
    await store.updateCurrentList();
  };

  store.moveSong = async function (oldIndex, newIndex) {
    let newSongs = [...store.currentList.songs];
    let song = newSongs[oldIndex];
    newSongs.splice(oldIndex, 1);
    newSongs.splice(newIndex, 0, song);
    store.currentList.songs = newSongs;
    await store.updateCurrentList();
  };

  store.addMoveSongTransaction = function (start, end) {
    let transaction = new MoveSong_Transaction(store, start, end);
    tps.addTransaction(transaction);
  };

  store.addAddSongTransaction = function (song) {
    let transaction = new AddSong_Transaction(store, song);
    tps.addTransaction(transaction);
  };

  store.addRemoveSongTransaction = function (index) {
    let song = store.currentList.songs[index];
    let transaction = new RemoveSong_Transaction(store, index, song);
    tps.addTransaction(transaction);
  };

  store.undo = function () {
    tps.undoTransaction();
  };

  store.redo = function () {
    tps.doTransaction();
  };

  store.canUndo = function () {
    return tps.hasTransactionToUndo();
  };

  store.canRedo = function () {
    return tps.hasTransactionToRedo();
  };

  // SEARCH & SORT
  store.searchPlaylists = async function (criteria) {
    store.searchCriteria = criteria;
    try {
      const response = await api.getPlaylists(criteria);
      if (response.data.success) {
        storeReducer({
          type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
          payload: response.data.playlists,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  store.sortPlaylists = function (sortType) {
    storeReducer({
      type: GlobalStoreActionType.SET_SORT_TYPE,
      payload: sortType,
    });
    store.loadIdNamePairs();
  };

  // SONGS CATALOG
  store.loadSongs = async function () {
    try {
      const response = await api.getSongs({});
      if (response.data.success) {
        storeReducer({
          type: GlobalStoreActionType.LOAD_SONGS,
          payload: response.data.songs || [],
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  store.searchSongs = async function (criteria) {
    try {
      const response = await api.getSongs(criteria);
      if (response.data.success) {
        storeReducer({
          type: GlobalStoreActionType.LOAD_SONGS,
          payload: response.data.songs || [],
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  store.createSong = async function (songData) {
    try {
      const response = await api.createSong(songData);
      if (response.data.success) {
        store.loadSongs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  store.updateSong = async function (id, songData) {
    try {
      await api.updateSongById(id, songData);
      store.loadSongs();
    } catch (err) {
      console.error(err);
    }
  };

  store.deleteSong = async function (id) {
    try {
      await api.deleteSongById(id);
      store.loadSongs();
      store.loadIdNamePairs(); // Refresh playlists since song removed from them
    } catch (err) {
      console.error(err);
    }
  };

  store.selectSong = function (song) {
    storeReducer({
      type: GlobalStoreActionType.SELECT_SONG,
      payload: song,
    });
  };

  // MODALS
  store.showEditSongModal = (songIndex, song) => {
    storeReducer({
      type: GlobalStoreActionType.EDIT_SONG,
      payload: { currentSongIndex: songIndex, currentSong: song },
    });
  };

  store.showRemoveSongModal = (songIndex, song) => {
    storeReducer({
      type: GlobalStoreActionType.REMOVE_SONG,
      payload: { currentSongIndex: songIndex, currentSong: song },
    });
  };

  store.hideModals = () => {
    storeReducer({
      type: GlobalStoreActionType.HIDE_MODALS,
      payload: {},
    });
  };

  return (
    <GlobalStoreContext.Provider value={{ store }}>
      {props.children}
    </GlobalStoreContext.Provider>
  );
}

export default GlobalStoreContext;
export { GlobalStoreContextProvider };
