const { DatabaseManager } = require("../index");
const { Sequelize, DataTypes } = require("sequelize");

class PostgreSQLManager extends DatabaseManager {
  constructor() {
    super();
    this.sequelize = null;
    this.User = null;
    this.Playlist = null;
  }

  _initializeModels() {
    this.User = this.sequelize.define(
      "User",
      {
        _id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        firstName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        lastName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        passwordHash: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        playlists: {
          type: DataTypes.ARRAY(DataTypes.UUID),
          defaultValue: [],
        },
      },
      {
        timestamps: true,
        tableName: "users",
      }
    );

    this.Playlist = this.sequelize.define(
      "Playlist",
      {
        _id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        ownerEmail: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        songs: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: [],
        },
      },
      {
        timestamps: true,
        tableName: "playlists",
      }
    );
  }

  async connect() {
    try {
      this.sequelize = new Sequelize(
        process.env.POSTGRES_DB,
        process.env.POSTGRES_USER,
        process.env.POSTGRES_PASSWORD,
        {
          host: process.env.POSTGRES_HOST || "localhost",
          port: process.env.POSTGRES_PORT || 5432,
          dialect: "postgres",
          logging: false,
        }
      );

      await this.sequelize.authenticate();
      this._initializeModels();
      await this.sequelize.sync({ alter: true });
      console.log("PostgreSQL connected successfully");
    } catch (error) {
      console.error("PostgreSQL connection error:", error.message);
      throw error;
    }
  }

  async disconnect() {
    await this.sequelize.close();
  }

  async createUser(userData) {
    const user = await this.User.create(userData);
    return this._toPlainObject(user);
  }

  async findUserByEmail(email) {
    const user = await this.User.findOne({ where: { email: email } });
    return user ? this._toPlainObject(user) : null;
  }

  async findUserById(userId) {
    const user = await this.User.findOne({ where: { _id: userId } });
    return user ? this._toPlainObject(user) : null;
  }

  async addPlaylistToUser(userId, playlistId) {
    const user = await this.User.findOne({ where: { _id: userId } });
    const playlists = user.playlists || [];
    playlists.push(playlistId);
    await user.update({ playlists: playlists });
    return this._toPlainObject(user);
  }

  async createPlaylist(playlistData) {
    const playlist = await this.Playlist.create(playlistData);
    return this._toPlainObject(playlist);
  }

  async findPlaylistById(playlistId) {
    const playlist = await this.Playlist.findOne({
      where: { _id: playlistId },
    });
    return playlist ? this._toPlainObject(playlist) : null;
  }

  async findPlaylistsByOwnerEmail(ownerEmail) {
    const playlists = await this.Playlist.findAll({
      where: { ownerEmail: ownerEmail },
    });
    return playlists.map((p) => this._toPlainObject(p));
  }

  async findAllPlaylists() {
    const playlists = await this.Playlist.findAll({});
    return playlists.map((p) => this._toPlainObject(p));
  }

  async updatePlaylist(playlistId, updateData) {
    const playlist = await this.Playlist.findOne({
      where: { _id: playlistId },
    });
    await playlist.update(updateData);
    return this._toPlainObject(playlist);
  }

  async deletePlaylist(playlistId) {
    await this.Playlist.destroy({ where: { _id: playlistId } });
    return true;
  }

  async clearCollection(collectionName) {
    const model = collectionName === "users" ? this.User : this.Playlist;
    await model.destroy({ where: {}, truncate: true, cascade: true });
  }

  async insertMany(collectionName, data) {
    const model = collectionName === "users" ? this.User : this.Playlist;
    for (let i = 0; i < data.length; i++) {
      await model.create(data[i]);
    }
  }

  _toPlainObject(instance) {
    if (!instance) return null;
    return instance.get ? instance.get({ plain: true }) : instance;
  }
}

module.exports = PostgreSQLManager;
