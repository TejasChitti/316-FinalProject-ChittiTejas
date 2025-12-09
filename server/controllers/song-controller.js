const Song = require("../models/song-model");
const Playlist = require("../models/playlist-model");

const createSong = async (req, res) => {
  try {
    // Get from middleware (auth.verify already ran and set these)
    const userId = req.userId;
    const userEmail = req.userEmail;

    console.log("🎵 Creating song...");
    console.log("User ID:", userId);
    console.log("User Email:", userEmail);

    if (!userId || !userEmail) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { title, artist, youTubeId, year } = req.body;

    // Validation
    if (!title || !artist || !youTubeId || !year) {
      return res
        .status(400)
        .json({ success: false, error: "All fields are required" });
    }

    // Check for duplicate (title, artist, year)
    const existingSong = await Song.findOne({ title, artist, year });
    if (existingSong) {
      return res.status(400).json({
        success: false,
        error: "A song with this title, artist, and year already exists",
      });
    }

    console.log("✅ Creating song with addedBy:", userEmail);

    const newSong = new Song({
      title,
      artist,
      youTubeId,
      year: parseInt(year),
      addedBy: userEmail,
      listens: 0,
      usedInPlaylists: [],
    });

    const savedSong = await newSong.save();
    console.log("✅ Song created:", savedSong._id);

    res.status(201).json({ success: true, data: savedSong });
  } catch (err) {
    console.error("❌ Error creating song:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const getSongs = async (req, res) => {
  try {
    const { title, artist, year, sortBy, sortOrder } = req.query;

    let query = {};

    // Build search criteria
    if (title) {
      query.title = new RegExp(title, "i");
    }

    if (artist) {
      query.artist = new RegExp(artist, "i");
    }

    if (year) {
      query.year = parseInt(year);
    }

    let songs = await Song.find(query);

    // Sort songs
    if (sortBy) {
      songs = sortSongs(songs, sortBy, sortOrder);
    }

    res.status(200).json({ success: true, data: songs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ success: false, error: "Song not found" });
    }
    res.status(200).json({ success: true, data: song });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const updateSong = async (req, res) => {
  try {
    // Get from middleware (auth.verify already set these)
    const userId = req.userId;
    const userEmail = req.userEmail;

    console.log("✏️ Updating song...");
    console.log("User Email:", userEmail);

    if (!userId || !userEmail) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ success: false, error: "Song not found" });
    }

    // Only the user who added the song can edit it
    if (song.addedBy !== userEmail) {
      return res
        .status(403)
        .json({ success: false, error: "Not authorized to edit this song" });
    }

    const { title, artist, youTubeId, year } = req.body;

    if (title) song.title = title;
    if (artist) song.artist = artist;
    if (youTubeId) song.youTubeId = youTubeId;
    if (year) song.year = parseInt(year);

    const updatedSong = await song.save();
    console.log("✅ Song updated:", updatedSong._id);

    res.status(200).json({ success: true, data: updatedSong });
  } catch (err) {
    console.error("❌ Error updating song:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const deleteSong = async (req, res) => {
  try {
    // Get from middleware (auth.verify already set these)
    const userId = req.userId;
    const userEmail = req.userEmail;

    console.log("🗑️ Deleting song...");
    console.log("User Email:", userEmail);

    if (!userId || !userEmail) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ success: false, error: "Song not found" });
    }

    // Only the user who added the song can delete it
    if (song.addedBy !== userEmail) {
      return res
        .status(403)
        .json({ success: false, error: "Not authorized to delete this song" });
    }

    // Remove song from all playlists
    await Playlist.updateMany(
      { songs: song._id },
      { $pull: { songs: song._id } }
    );

    await Song.findByIdAndDelete(req.params.id);
    console.log("✅ Song deleted:", req.params.id);

    res.status(200).json({ success: true, message: "Song deleted" });
  } catch (err) {
    console.error("❌ Error deleting song:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Helper function to sort songs
function sortSongs(songs, sortBy, sortOrder = "desc") {
  const order = sortOrder === "asc" ? 1 : -1;

  return songs.sort((a, b) => {
    let aVal, bVal;

    switch (sortBy) {
      case "listens":
        aVal = a.listens;
        bVal = b.listens;
        break;
      case "playlists":
        aVal = a.usedInPlaylists.length;
        bVal = b.usedInPlaylists.length;
        break;
      case "title":
        aVal = a.title.toLowerCase();
        bVal = b.title.toLowerCase();
        return order * aVal.localeCompare(bVal);
      case "artist":
        aVal = a.artist.toLowerCase();
        bVal = b.artist.toLowerCase();
        return order * aVal.localeCompare(bVal);
      case "year":
        aVal = a.year;
        bVal = b.year;
        break;
      default:
        return 0;
    }

    return order * (aVal - bVal);
  });
}

module.exports = {
  createSong,
  getSongs,
  getSongById,
  updateSong,
  deleteSong,
};
