import {
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
  expect,
  test,
} from "vitest";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/user-model.js";
import Playlist from "../models/playlist-model.js";
import Song from "../models/song-model.js";
import bcrypt from "bcryptjs";

dotenv.config();

const BASE_URL = "http://localhost:4000";

async function apiRequest(method, endpoint, body = null, cookie = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (cookie) {
    options.headers["Cookie"] = cookie;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();

  return {
    status: response.status,
    data,
    cookies: response.headers.get("set-cookie") || "",
  };
}

beforeAll(async () => {
  await mongoose.connect(
    process.env.DB_CONNECT || "mongodb://localhost:27017/playlister-test"
  );
  console.log("✅ Test database connected");
});

beforeEach(async () => {
  await User.deleteMany({});
  await Playlist.deleteMany({});
  await Song.deleteMany({});
});

afterEach(() => {});

afterAll(async () => {
  await mongoose.connection.close();
  console.log("✅ Test database closed");
});

test("Test #1) User Registration via API", async () => {
  const testUser = {
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@doe.com",
    password: "password123",
    passwordVerify: "password123",
    avatar: "",
  };

  const result = await apiRequest("POST", "/auth/register", testUser);

  expect(result.status).toBe(200);
  expect(result.data.success).toBe(true);
  expect(result.data.user.email).toBe("jane@doe.com");
  expect(result.data.user.firstName).toBe("Jane");
  expect(result.data.user.lastName).toBe("Doe");
  expect(result.cookies).not.toBe("");

  const userInDb = await User.findOne({ email: "jane@doe.com" });
  expect(userInDb).not.toBeNull();
  expect(userInDb.firstName).toBe("Jane");
  expect(userInDb.lastName).toBe("Doe");
});

test("Test #2) Creating a Playlist via Authenticated API Request", async () => {
  const testUser = {
    firstName: "Joe",
    lastName: "Shmo",
    email: "joe@shmo.com",
    password: "password123",
    passwordVerify: "password123",
    avatar: "",
  };

  const registerResult = await apiRequest("POST", "/auth/register", testUser);
  const authCookie = registerResult.cookies;

  const playlistData = {
    name: "My Test Playlist",
  };

  const result = await apiRequest(
    "POST",
    "/api/playlists",
    playlistData,
    authCookie
  );

  expect(result.status).toBe(201);
  expect(result.data.success).toBe(true);
  expect(result.data.data.name).toBe("My Test Playlist");
  expect(result.data.data.ownerEmail).toBe("joe@shmo.com");
  expect(result.data.data.ownerFirstName).toBe("Joe");
  expect(result.data.data.ownerLastName).toBe("Shmo");

  const playlistInDb = await Playlist.findOne({ name: "My Test Playlist" });
  expect(playlistInDb).not.toBeNull();
  expect(playlistInDb.ownerEmail).toBe("joe@shmo.com");
});

test("Test #3) Creating a Song via Authenticated API Request", async () => {
  const testUser = {
    firstName: "Average",
    lastName: "Joe",
    email: "average@joe.com",
    password: "password123",
    passwordVerify: "password123",
    avatar: "",
  };

  const registerResult = await apiRequest("POST", "/auth/register", testUser);
  const authCookie = registerResult.cookies;

  const songData = {
    title: "Bohemian Rhapsody",
    artist: "Queen",
    youTubeId: "fJ9rUzIMcZQ",
    year: 1975,
  };

  const result = await apiRequest("POST", "/api/songs", songData, authCookie);

  expect(result.status).toBe(201);
  expect(result.data.success).toBe(true);
  expect(result.data.data.title).toBe("Bohemian Rhapsody");
  expect(result.data.data.artist).toBe("Queen");
  expect(result.data.data.year).toBe(1975);
  expect(result.data.data.addedBy).toBe("average@joe.com");

  const songInDb = await Song.findOne({ title: "Bohemian Rhapsody" });
  expect(songInDb).not.toBeNull();
  expect(songInDb.artist).toBe("Queen");
  expect(songInDb.addedBy).toBe("average@joe.com");
});

test("Test #4) Reading All Playlists via Public API", async () => {
  const user1 = await User.create({
    firstName: "User",
    lastName: "One",
    email: "user1@test.com",
    passwordHash: await bcrypt.hash("password123", 10),
  });

  const user2 = await User.create({
    firstName: "User",
    lastName: "Two",
    email: "user2@test.com",
    passwordHash: await bcrypt.hash("password123", 10),
  });

  await Playlist.create({
    name: "Rock Playlist",
    ownerEmail: user1.email,
    ownerFirstName: user1.firstName,
    ownerLastName: user1.lastName,
    ownerAvatar: "",
    songs: [],
    published: true,
  });

  await Playlist.create({
    name: "Jazz Playlist",
    ownerEmail: user2.email,
    ownerFirstName: user2.firstName,
    ownerLastName: user2.lastName,
    ownerAvatar: "",
    songs: [],
    published: true,
  });

  const result = await apiRequest("GET", "/api/playlists");

  expect(result.status).toBe(200);
  expect(result.data.success).toBe(true);
  expect(Array.isArray(result.data.data)).toBe(true);
  expect(result.data.data.length).toBe(2);

  const playlistNames = result.data.data.map((p) => p.name);
  expect(playlistNames).toContain("Rock Playlist");
  expect(playlistNames).toContain("Jazz Playlist");
});

test("Test #5) Preventing Unauthorized Playlist Creation", async () => {
  const playlistData = {
    name: "Unauthorized Playlist",
  };

  const result = await apiRequest("POST", "/api/playlists", playlistData);

  expect(result.status).toBe(401);
  expect(result.data.success).toBe(false);
  expect(result.data.errorMessage).toBe("Unauthorized");

  const playlistInDb = await Playlist.findOne({
    name: "Unauthorized Playlist",
  });
  expect(playlistInDb).toBeNull();
});
