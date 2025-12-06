const { DatabaseManager } = require("../index");
const mongoose = require("mongoose");

class MongoDBManager extends DatabaseManager {
  constructor() {
    super();
    this.User = null;
    this.Playlist = null;
    this.connection = null;
  }

  _initializeModels() {
    const Schema = mongoose.Schema;
    const ObjectId = Schema.Types.ObjectId;

    if (mongoose.models.User) {
      this.User = mongoose.models.User;
    } else {
      const UserSchema = new Schema(
        {
          firstName: { type: String, required: true },
          lastName: { type: String, required: true },
          email: { type: String, required: true },
          passwordHash: { type: String, required: true },
          playlists: [{ type: ObjectId, ref: "Playlist" }],
        },
        { timestamps: true }
      );
      this.User = mongoose.model("User", UserSchema);
    }

    if (mongoose.models.Playlist) {
      this.Playlist = mongoose.models.Playlist;
    } else {
      const PlaylistSchema = new Schema(
        {
          name: { type: String, required: true },
          ownerEmail: { type: String, required: true },
          songs: {
            type: [
              {
                title: String,
                artist: String,
                year: Number,
                youTubeId: String,
              },
            ],
            required: true,
          },
        },
        { timestamps: true }
      );
      this.Playlist = mongoose.model("Playlist", PlaylistSchema);
    }
  }

  async connect() {
    try {
      await mongoose.connect(process.env.DB_CONNECT, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      this.connection = mongoose.connection;
      this._initializeModels();
      console.log("MongoDB connected successfully");
    } catch (error) {
      console.error("MongoDB connection error:", error.message);
      throw error;
    }
  }

  async disconnect() {
    await mongoose.connection.close();
  }

  async createUser(userData) {
    const user = new this.User(userData);
    const savedUser = await user.save();
    return this._toPlainObject(savedUser);
  }

  async findUserByEmail(email) {
    const user = await this.User.findOne({ email: email });
    return user ? this._toPlainObject(user) : null;
  }

  async findUserById(userId) {
    const user = await this.User.findOne({ _id: userId });
    return user ? this._toPlainObject(user) : null;
  }

  async addPlaylistToUser(userId, playlistId) {
    const user = await this.User.findOne({ _id: userId });
    user.playlists.push(playlistId);
    const savedUser = await user.save();
    return this._toPlainObject(savedUser);
  }

  async createPlaylist(playlistData) {
    const playlist = new this.Playlist(playlistData);
    const savedPlaylist = await playlist.save();
    return this._toPlainObject(savedPlaylist);
  }

  async findPlaylistById(playlistId) {
    const playlist = await this.Playlist.findById({ _id: playlistId });
    return playlist ? this._toPlainObject(playlist) : null;
  }

  async findPlaylistsByOwnerEmail(ownerEmail) {
    const playlists = await this.Playlist.find({ ownerEmail: ownerEmail });
    return playlists.map((p) => this._toPlainObject(p));
  }

  async findAllPlaylists() {
    const playlists = await this.Playlist.find({});
    return playlists.map((p) => this._toPlainObject(p));
  }

  async updatePlaylist(playlistId, updateData) {
    const playlist = await this.Playlist.findOne({ _id: playlistId });
    if (updateData.name !== undefined) {
      playlist.name = updateData.name;
    }
    if (updateData.songs !== undefined) {
      playlist.songs = updateData.songs;
    }
    const savedPlaylist = await playlist.save();
    return this._toPlainObject(savedPlaylist);
  }

  async deletePlaylist(playlistId) {
    await this.Playlist.findOneAndDelete({ _id: playlistId });
    return true;
  }

  async clearCollection(collectionName) {
    const model = collectionName === "users" ? this.User : this.Playlist;
    await model.deleteMany({});
  }

  async insertMany(collectionName, data) {
    const model = collectionName === "users" ? this.User : this.Playlist;
    for (let i = 0; i < data.length; i++) {
      const doc = new model(data[i]);
      await doc.save();
    }
  }

  _toPlainObject(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return obj;
  }
}

module.exports = MongoDBManager;
