const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    songs: [
      {
        song: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Song",
        },
        order: {
          type: Number,
          required: true,
        },
      },
    ],
    listeners: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    listenerCount: {
      type: Number,
      default: 0,
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique playlist names per user
playlistSchema.index({ name: 1, owner: 1 }, { unique: true });

// Update lastAccessed timestamp
playlistSchema.methods.updateAccess = function () {
  this.lastAccessed = new Date();
  return this.save();
};

module.exports = mongoose.model("Playlist", playlistSchema);
