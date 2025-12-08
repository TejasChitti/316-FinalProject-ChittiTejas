const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Playlist = require("../models/playlist-model");
const Song = require("../models/song-model");
const User = require("../models/user-model");
const { auth, optionalAuth } = require("../auth/index");

// Create playlist
router.post("/", auth, [body("name").trim().notEmpty()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;

    // Check if user already has a playlist with this name
    const existing = await Playlist.findOne({ name, owner: req.user._id });
    if (existing) {
      return res
        .status(400)
        .json({ error: "You already have a playlist with this name" });
    }

    const playlist = new Playlist({
      name,
      owner: req.user._id,
      songs: [],
    });

    await playlist.save();
    await playlist.populate("owner", "userName avatarImage");

    res.status(201).json(playlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get playlists with search and sorting
router.get("/", optionalAuth, async (req, res) => {
  try {
    const {
      playlistName,
      userName,
      songTitle,
      songArtist,
      songYear,
      sortBy = "listeners",
      sortOrder = "desc",
    } = req.query;

    let query = {};

    // Build query based on search criteria
    if (playlistName) {
      query.name = { $regex: playlistName, $options: "i" };
    }

    // If no search criteria and user is logged in, show their playlists
    if (
      !playlistName &&
      !userName &&
      !songTitle &&
      !songArtist &&
      !songYear &&
      req.user
    ) {
      query.owner = req.user._id;
    }

    let playlists = await Playlist.find(query)
      .populate("owner", "userName avatarImage")
      .populate("songs.song");

    // Filter by userName if specified
    if (userName) {
      const users = await User.find({
        userName: { $regex: userName, $options: "i" },
      });
      const userIds = users.map((u) => u._id.toString());
      playlists = playlists.filter((p) =>
        userIds.includes(p.owner._id.toString())
      );
    }

    // Filter by song criteria
    if (songTitle || songArtist || songYear) {
      playlists = playlists.filter((playlist) => {
        return playlist.songs.some((s) => {
          if (!s.song) return false;

          let match = true;
          if (songTitle) {
            match =
              match &&
              s.song.title.toLowerCase().includes(songTitle.toLowerCase());
          }
          if (songArtist) {
            match =
              match &&
              s.song.artist.toLowerCase().includes(songArtist.toLowerCase());
          }
          if (songYear) {
            match = match && s.song.year.toString() === songYear.toString();
          }
          return match;
        });
      });
    }

    // Sort playlists
    const sortMultiplier = sortOrder === "asc" ? 1 : -1;

    playlists.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "listeners":
          comparison = (a.listenerCount - b.listenerCount) * sortMultiplier;
          break;
        case "name":
          comparison = a.name.localeCompare(b.name) * sortMultiplier;
          break;
        case "userName":
          comparison =
            a.owner.userName.localeCompare(b.owner.userName) * sortMultiplier;
          break;
        default:
          comparison = (a.listenerCount - b.listenerCount) * sortMultiplier;
      }

      return comparison;
    });

    res.json(playlists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single playlist
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate("owner", "userName avatarImage")
      .populate("songs.song");

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update playlist
router.put(
  "/:id",
  auth,
  [
    body("name").optional().trim().notEmpty(),
    body("songs").optional().isArray(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const playlist = await Playlist.findById(req.params.id);

      if (!playlist) {
        return res.status(404).json({ error: "Playlist not found" });
      }

      // Check ownership
      if (playlist.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const { name, songs } = req.body;

      // Check if new name conflicts with another playlist
      if (name && name !== playlist.name) {
        const existing = await Playlist.findOne({
          name,
          owner: req.user._id,
          _id: { $ne: playlist._id },
        });
        if (existing) {
          return res
            .status(400)
            .json({ error: "You already have a playlist with this name" });
        }
        playlist.name = name;
      }

      if (songs) {
        // Update song count for removed songs
        const oldSongIds = playlist.songs.map((s) => s.song.toString());
        const newSongIds = songs.map((s) => s.song);

        const removedSongs = oldSongIds.filter(
          (id) => !newSongIds.includes(id)
        );
        const addedSongs = newSongIds.filter((id) => !oldSongIds.includes(id));

        // Decrement count for removed songs
        if (removedSongs.length > 0) {
          await Song.updateMany(
            { _id: { $in: removedSongs } },
            { $inc: { playlistCount: -1 } }
          );
        }

        // Increment count for added songs
        if (addedSongs.length > 0) {
          await Song.updateMany(
            { _id: { $in: addedSongs } },
            { $inc: { playlistCount: 1 } }
          );
        }

        playlist.songs = songs;
      }

      playlist.lastAccessed = new Date();
      await playlist.save();
      await playlist.populate("owner", "userName avatarImage");
      await playlist.populate("songs.song");

      res.json(playlist);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Copy playlist
router.post("/:id/copy", auth, async (req, res) => {
  try {
    const originalPlaylist = await Playlist.findById(req.params.id).populate(
      "songs.song"
    );

    if (!originalPlaylist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    // Generate unique name
    let copyName = `${originalPlaylist.name} - Copy`;
    let counter = 1;

    while (await Playlist.findOne({ name: copyName, owner: req.user._id })) {
      copyName = `${originalPlaylist.name} - Copy ${counter}`;
      counter++;
    }

    const newPlaylist = new Playlist({
      name: copyName,
      owner: req.user._id,
      songs: originalPlaylist.songs.map((s) => ({
        song: s.song._id,
        order: s.order,
      })),
    });

    // Increment playlist count for all songs
    const songIds = newPlaylist.songs.map((s) => s.song);
    await Song.updateMany(
      { _id: { $in: songIds } },
      { $inc: { playlistCount: 1 } }
    );

    await newPlaylist.save();
    await newPlaylist.populate("owner", "userName avatarImage");
    await newPlaylist.populate("songs.song");

    res.status(201).json(newPlaylist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete playlist
router.delete("/:id", auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    // Check ownership
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Decrement playlist count for all songs
    const songIds = playlist.songs.map((s) => s.song);
    await Song.updateMany(
      { _id: { $in: songIds } },
      { $inc: { playlistCount: -1 } }
    );

    await Playlist.findByIdAndDelete(req.params.id);

    res.json({ message: "Playlist deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Play playlist (increment listener count)
router.post("/:id/play", optionalAuth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate(
      "songs.song"
    );

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    // Add user to listeners if logged in and not already in list
    if (req.user && !playlist.listeners.includes(req.user._id)) {
      playlist.listeners.push(req.user._id);
      playlist.listenerCount = playlist.listeners.length;
    }

    // Increment listen count for all songs
    const songIds = playlist.songs.map((s) => s.song._id);
    await Song.updateMany({ _id: { $in: songIds } }, { $inc: { listens: 1 } });

    playlist.lastAccessed = new Date();
    await playlist.save();

    res.json({ message: "Play counted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
