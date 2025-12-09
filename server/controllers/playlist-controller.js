const Playlist = require("../models/playlist-model");
const Song = require("../models/song-model");
const auth = require("../auth");

const createPlaylist = async (req, res) => {
  try {
    // auth.verify middleware already ran and set these
    const userId = req.userId;
    const userEmail = req.userEmail;

    console.log("📋 Creating playlist...");
    console.log("User ID:", userId);
    console.log("User Email:", userEmail);

    // Verify we have the required data from middleware
    if (!userId || !userEmail) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - missing user data",
      });
    }

    const { name, songs } = req.body;

    // Get user info from database
    const User = require("../models/user-model");
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    console.log("✅ User found:", user.email);

    // Generate unique "Untitled X" name if not provided
    let playlistName = name;
    if (!playlistName || playlistName.startsWith("Untitled")) {
      let counter = 0;
      playlistName = `Untitled${counter}`;

      const existingPlaylists = await Playlist.find({
        ownerEmail: userEmail,
        name: new RegExp("^Untitled"),
      });

      const existingNumbers = existingPlaylists.map((p) => {
        const match = p.name.match(/^Untitled(\d+)$/);
        return match ? parseInt(match[1]) : -1;
      });

      while (existingNumbers.includes(counter)) {
        counter++;
      }
      playlistName = `Untitled${counter}`;
    }

    const newPlaylist = new Playlist({
      name: playlistName,
      ownerEmail: userEmail,
      ownerFirstName: user.firstName,
      ownerLastName: user.lastName,
      ownerAvatar: user.avatar,
      songs: [],
      listeners: [],
      plays: 0,
      published: true,
    });

    const savedPlaylist = await newPlaylist.save();

    const populatedPlaylist = await Playlist.findById(
      savedPlaylist._id
    ).populate("songs");

    res.status(201).json({ success: true, playlist: populatedPlaylist });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getPlaylists = async (req, res) => {
  try {
    const {
      playlistName,
      userName,
      songTitle,
      songArtist,
      songYear,
      sortBy,
      sortOrder,
    } = req.query;

    let query = { published: true };

    // Build search criteria
    if (playlistName) {
      query.name = new RegExp(playlistName, "i");
    }

    if (userName) {
      query.$or = [
        { ownerFirstName: new RegExp(userName, "i") },
        { ownerLastName: new RegExp(userName, "i") },
      ];
    }

    // If searching by song properties, we need to find matching songs first
    if (songTitle || songArtist || songYear) {
      const songQuery = {};
      if (songTitle) songQuery.title = new RegExp(songTitle, "i");
      if (songArtist) songQuery.artist = new RegExp(songArtist, "i");
      if (songYear) songQuery.year = parseInt(songYear);

      const matchingSongs = await Song.find(songQuery);
      const songIds = matchingSongs.map((s) => s._id);

      query.songs = { $in: songIds };
    }

    let playlists = await Playlist.find(query).populate("songs");

    // Sort playlists
    if (sortBy) {
      playlists = sortPlaylists(playlists, sortBy, sortOrder);
    }

    res.status(200).json({ success: true, playlists });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate("songs");
    if (!playlist) {
      return res
        .status(404)
        .json({ success: false, error: "Playlist not found" });
    }
    res.status(200).json({ success: true, data: playlist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const updatePlaylist = async (req, res) => {
  try {
    const userId = auth.verifyUser(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res
        .status(404)
        .json({ success: false, error: "Playlist not found" });
    }

    if (playlist.ownerEmail !== req.userEmail) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to edit this playlist",
      });
    }

    const { name, songs } = req.body;

    if (name) playlist.name = name;
    if (songs !== undefined) playlist.songs = songs;
    playlist.lastAccessed = Date.now();

    const updatedPlaylist = await playlist.save();
    const populatedPlaylist = await Playlist.findById(
      updatedPlaylist._id
    ).populate("songs");

    res.status(200).json({ success: true, data: populatedPlaylist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const deletePlaylist = async (req, res) => {
  try {
    const userId = auth.verifyUser(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res
        .status(404)
        .json({ success: false, error: "Playlist not found" });
    }

    if (playlist.ownerEmail !== req.userEmail) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this playlist",
      });
    }

    // Remove playlist reference from all songs
    await Song.updateMany(
      { usedInPlaylists: playlist._id },
      { $pull: { usedInPlaylists: playlist._id } }
    );

    await Playlist.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Playlist deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const copyPlaylist = async (req, res) => {
  try {
    const userId = auth.verifyUser(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const originalPlaylist = await Playlist.findById(req.params.id);
    if (!originalPlaylist) {
      return res
        .status(404)
        .json({ success: false, error: "Playlist not found" });
    }

    const User = require("../models/user-model");
    const user = await User.findById(userId);

    // Generate unique name for copied playlist
    let copyName = `${originalPlaylist.name} (Copy)`;
    let counter = 1;

    while (
      await Playlist.findOne({ name: copyName, ownerEmail: req.userEmail })
    ) {
      copyName = `${originalPlaylist.name} (Copy ${counter})`;
      counter++;
    }

    const newPlaylist = new Playlist({
      name: copyName,
      ownerEmail: req.userEmail,
      ownerFirstName: user.firstName,
      ownerLastName: user.lastName,
      ownerAvatar: user.avatar,
      songs: [...originalPlaylist.songs],
      listeners: [],
      plays: 0,
      published: true,
    });

    const savedPlaylist = await newPlaylist.save();
    const populatedPlaylist = await Playlist.findById(
      savedPlaylist._id
    ).populate("songs");

    res.status(201).json({ success: true, data: populatedPlaylist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const playPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res
        .status(404)
        .json({ success: false, error: "Playlist not found" });
    }

    // Increment play count
    playlist.plays += 1;

    // Track unique listener if user is logged in
    const userId = auth.verifyUser(req);
    if (userId && req.userEmail) {
      if (!playlist.listeners.includes(req.userEmail)) {
        playlist.listeners.push(req.userEmail);
      }
    }

    // Increment listens for all songs in playlist
    if (playlist.songs && playlist.songs.length > 0) {
      await Song.updateMany(
        { _id: { $in: playlist.songs } },
        { $inc: { listens: 1 } }
      );
    }

    await playlist.save();

    res.status(200).json({ success: true, data: playlist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Helper function to sort playlists
function sortPlaylists(playlists, sortBy, sortOrder = "desc") {
  const order = sortOrder === "asc" ? 1 : -1;

  return playlists.sort((a, b) => {
    let aVal, bVal;

    switch (sortBy) {
      case "listeners":
        aVal = a.listeners.length;
        bVal = b.listeners.length;
        break;
      case "name":
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        return order * aVal.localeCompare(bVal);
      case "userName":
        aVal = `${a.ownerFirstName} ${a.ownerLastName}`.toLowerCase();
        bVal = `${b.ownerFirstName} ${b.ownerLastName}`.toLowerCase();
        return order * aVal.localeCompare(bVal);
      default:
        return 0;
    }

    return order * (aVal - bVal);
  });
}

module.exports = {
  createPlaylist,
  getPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  copyPlaylist,
  playPlaylist,
};
