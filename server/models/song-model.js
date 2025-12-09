const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SongSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    artist: {
      type: String,
      required: true,
    },
    youtubeId: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    addedBy: {
      type: String,
      required: true,
    },
    listens: {
      type: Number,
      default: 0,
    },
    usedInPlaylists: [
      {
        type: Schema.Types.ObjectId,
        ref: "Playlist",
      },
    ],
  },
  { timestamps: true }
);

SongSchema.index({ title: 1, artist: 1, year: 1 }, { unique: true });

SongSchema.index({ title: "text", artist: "text" });

module.exports = mongoose.model("Song", SongSchema);
