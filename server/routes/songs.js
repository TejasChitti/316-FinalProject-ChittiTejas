const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Song = require("../models/song-model");
const Playlist = require("../models/playlist-model");
const { auth, optionalAuth } = require("../auth/index");

// Create song
router.post(
  "/",
  auth,
  [
    body("title").trim().notEmpty(),
    body("artist").trim().notEmpty(),
    body("year").isInt({ min: 1900, max: new Date().getFullYear() }),
    body("youtubeId").trim().notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, artist, year, youtubeId } = req.body;

      // Check if song already exists
      const existing = await Song.findOne({ title, artist, year });
      if (existing) {
        return res.status(400).json({
          error: "A song with this title, artist, and year already exists",
        });
      }

      const song = new Song({
        title,
        artist,
        year,
        youtubeId,
        addedBy: req.user._id,
      });

      await song.save();
      await song.populate("addedBy", "userName avatarImage");

      res.status(201).json(song);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get songs with search and sorting
router.get("/", optionalAuth, async (req, res) => {
  try {
    const {
      title,
      artist,
      year,
      sortBy = "listens",
      sortOrder = "desc",
    } = req.query;

    let query = {};

    // Build query based on search criteria
    if (title) {
      query.title = { $regex: title, $options: "i" };
    }
    if (artist) {
      query.artist = { $regex: artist, $options: "i" };
    }
    if (year) {
      query.year = parseInt(year);
    }

    // If no search criteria and user is logged in, show their songs
    if (!title && !artist && !year && req.user) {
      query.addedBy = req.user._id;
    }

    // Build sort object
    let sort = {};
    const sortDir = sortOrder === "asc" ? 1 : -1;

    switch (sortBy) {
      case "listens":
        sort.listens = sortDir;
        break;
      case "playlists":
        sort.playlistCount = sortDir;
        break;
      case "title":
        sort.title = sortDir;
        break;
      case "artist":
        sort.artist = sortDir;
        break;
      case "year":
        sort.year = sortDir;
        break;
      default:
        sort.listens = sortDir;
    }

    const songs = await Song.find(query)
      .sort(sort)
      .populate("addedBy", "userName avatarImage");

    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single song
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).populate(
      "addedBy",
      "userName avatarImage"
    );

    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    res.json(song);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update song
router.put(
  "/:id",
  auth,
  [
    body("title").optional().trim().notEmpty(),
    body("artist").optional().trim().notEmpty(),
    body("year").optional().isInt({ min: 1900, max: new Date().getFullYear() }),
    body("youtubeId").optional().trim().notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const song = await Song.findById(req.params.id);

      if (!song) {
        return res.status(404).json({ error: "Song not found" });
      }

      // Check ownership
      if (song.addedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const { title, artist, year, youtubeId } = req.body;

      // Check if updated song would create a duplicate
      if (title || artist || year) {
        const checkTitle = title || song.title;
        const checkArtist = artist || song.artist;
        const checkYear = year || song.year;

        const existing = await Song.findOne({
          title: checkTitle,
          artist: checkArtist,
          year: checkYear,
          _id: { $ne: song._id },
        });

        if (existing) {
          return res.status(400).json({
            error: "A song with this title, artist, and year already exists",
          });
        }
      }

      if (title) song.title = title;
      if (artist) song.artist = artist;
      if (year) song.year = year;
      if (youtubeId) song.youtubeId = youtubeId;

      await song.save();
      await song.populate("addedBy", "userName avatarImage");

      res.json(song);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete song
router.delete("/:id", auth, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    // Check ownership
    if (song.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Remove song from all playlists
    await Playlist.updateMany(
      { "songs.song": song._id },
      { $pull: { songs: { song: song._id } } }
    );

    await Song.findByIdAndDelete(req.params.id);

    res.json({ message: "Song deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
