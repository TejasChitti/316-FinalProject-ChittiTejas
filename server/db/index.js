const dotenv = require("dotenv");
dotenv.config();

class DatabaseManager {
  constructor() {
    if (new.target === DatabaseManager) {
      throw new TypeError(
        "Cannot instantiate abstract class DatabaseManager directly"
      );
    }
  }

  async connect() {
    throw new Error("Method 'connect()' must be implemented");
  }

  async disconnect() {
    throw new Error("Method 'disconnect()' must be implemented");
  }

  async createUser(userData) {
    throw new Error("Method 'createUser()' must be implemented");
  }

  async findUserByEmail(email) {
    throw new Error("Method 'findUserByEmail()' must be implemented");
  }

  async findUserById(userId) {
    throw new Error("Method 'findUserById()' must be implemented");
  }

  async createPlaylist(playlistData) {
    throw new Error("Method 'createPlaylist()' must be implemented");
  }

  async addPlaylistToUser(userId, playlistId) {
    throw new Error("Method 'addPlaylistToUser()' must be implemented");
  }

  async findPlaylistById(playlistId) {
    throw new Error("Method 'findPlaylistById()' must be implemented");
  }

  async findPlaylistsByOwnerEmail(ownerEmail) {
    throw new Error("Method 'findPlaylistsByOwnerEmail()' must be implemented");
  }

  async findAllPlaylists() {
    throw new Error("Method 'findAllPlaylists()' must be implemented");
  }

  async updatePlaylist(playlistId, updateData) {
    throw new Error("Method 'updatePlaylist()' must be implemented");
  }

  async deletePlaylist(playlistId) {
    throw new Error("Method 'deletePlaylist()' must be implemented");
  }

  async clearCollection(collectionName) {
    throw new Error("Method 'clearCollection()' must be implemented");
  }

  async insertMany(collectionName, data) {
    throw new Error("Method 'insertMany()' must be implemented");
  }
}

module.exports.DatabaseManager = DatabaseManager;

const MongoDBManager = require("./mongodb");
const PostgreSQLManager = require("./postgresql");

const DB_TYPE = process.env.DB_TYPE;

let dbManager;

if (DB_TYPE === "mongodb") {
  dbManager = new MongoDBManager();
} else if (DB_TYPE === "postgresql") {
  dbManager = new PostgreSQLManager();
} else {
  throw new Error(
    `Unsupported database type: ${DB_TYPE}. Use 'mongodb' or 'postgresql'.`
  );
}

const connection = dbManager.connect().catch((err) => {
  console.error("Database connection error:", err.message);
});

const db = {
  on: (event, callback) => {
    if (event === "error") {
      callback.bind(console, "Database connection error:");
    }
  },
};

module.exports = db;
module.exports.dbManager = dbManager;
module.exports.connection = connection;
