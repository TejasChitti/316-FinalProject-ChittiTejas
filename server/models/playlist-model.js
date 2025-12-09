const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PlaylistSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    ownerEmail: {
      type: String,
      required: true,
    },
    ownerFirstName: {
      type: String,
      required: true,
    },
    ownerLastName: {
      type: String,
      required: true,
    },
    ownerAvatar: {
      type: String,
      default: "",
    },
    songs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Song",
      },
    ],
    listeners: [
      {
        type: String,
      },
    ],
    plays: {
      type: Number,
      default: 0,
    },
    published: {
      type: Boolean,
      default: true,
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

PlaylistSchema.index({ ownerEmail: 1 });

PlaylistSchema.index({ name: 1, ownerEmail: 1 }, { unique: true });

module.exports = mongoose.model("Playlist", PlaylistSchema);
