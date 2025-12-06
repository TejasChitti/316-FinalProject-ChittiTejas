import {
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
  expect,
  test,
} from "vitest";
const dotenv = require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");

const { dbManager, connection } = require("../db");

/**
 * Vitest test script for the Playlister app's Mongo Database Manager. Testing should verify that the Mongo Database Manager
 * will perform all necessarily operations properly.
 *
 * Scenarios we will test:
 *  1) Reading a User from the database
 *  2) Creating a User in the database
 *  3) ...
 *
 * You should add at least one test for each database interaction. In the real world of course we would do many varied
 * tests for each interaction.
 */

/**
 * Executed once before all tests are performed.
 */
beforeAll(async () => {
  // SETUP THE CONNECTION VIA MONGOOSE JUST ONCE - IT IS IMPORTANT TO NOTE THAT INSTEAD
  // OF DOING THIS HERE, IT SHOULD BE DONE INSIDE YOUR Database Manager (WHICHEVER)
  await connection;

  await dbManager.clearCollection("playlists");
  await dbManager.clearCollection("users");
});

/**
 * Executed before each test is performed.
 */
beforeEach(async () => {
  await dbManager.clearCollection("playlists");
  await dbManager.clearCollection("users");
});

/**
 * Executed after each test is performed.
 */
afterEach(() => {});

/**
 * Executed once after all tests are performed.
 */
afterAll(() => {});

/**
 * Vitest test to see if the Database Manager can get a User.
 */
test("Test #1) Reading a User from the Database", async () => {
  // FILL IN A USER WITH THE DATA YOU EXPECT THEM TO HAVE
  const expectedUser = {
    // FILL IN EXPECTED DATA
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@doe.com",
    passwordHash: "aaaaaaaa",
  };

  await dbManager.createUser(expectedUser);

  // THIS WILL STORE THE DATA RETRUNED BY A READ USER

  // READ THE USER
  const actualUser = await dbManager.findUserByEmail(expectedUser.email);

  // COMPARE THE VALUES OF THE EXPECTED USER TO THE ACTUAL ONE
  expect(expectedUser.firstName, actualUser.firstName);
  expect(expectedUser.lastName, actualUser.lastName);
  expect(expectedUser.email, actualUser.email);
  expect(expectedUser.passwordHash, actualUser.passwordHash);
  // AND SO ON
});

/**
 * Vitest test to see if the Database Manager can create a User
 */
test("Test #2) Creating a User in the Database", async () => {
  // MAKE A TEST USER TO CREATE IN THE DATABASE
  const testUser = {
    // FILL IN TEST DATA, INCLUDE AN ID SO YOU CAN GET IT LATER
    firstName: "Joe",
    lastName: "Shmo",
    email: "joe@shmo.com",
    passwordHash: "aaaaaaaa",
  };

  // CREATE THE USER
  // dbManager.somethingOrOtherToCreateAUser(...)
  const createdUser = await dbManager.createUser(testUser);

  // NEXT TEST TO SEE IF IT WAS PROPERLY CREATED

  // FILL IN A USER WITH THE DATA YOU EXPECT THEM TO HAVE
  const expectedUser = {
    // FILL IN EXPECTED DATA
    firstName: "Joe",
    lastName: "Shmo",
    email: "joe@shmo.com",
    passwordHash: "aaaaaaaa",
  };

  // THIS WILL STORE THE DATA RETRUNED BY A READ USER
  const actualUser = await dbManager.findUserById(createdUser._id);

  // READ THE USER
  // actualUser = dbManager.somethingOrOtherToGetAUser(...)

  // COMPARE THE VALUES OF THE EXPECTED USER TO THE ACTUAL ONE
  expect(expectedUser.firstName, actualUser.firstName);
  expect(expectedUser.lastName, actualUser.lastName);
  expect(expectedUser.email, actualUser.email);
  expect(expectedUser.passwordHash, actualUser.passwordHash);
  // AND SO ON
});

// THE REST OF YOUR TEST SHOULD BE PUT BELOW

test("Test #3) Reading a User by ID from the Database", async () => {
  const testUser = {
    firstName: "Average",
    lastName: "Joe",
    email: "average@joecom",
    passwordHash: "aaaaaaaa",
  };

  const createdUser = await dbManager.createUser(testUser);
  const actualUser = await dbManager.findUserById(createdUser._id);

  expect(testUser.firstName, actualUser.firstName);
  expect(testUser.lastName, actualUser.lastName);
  expect(testUser._id, actualUser._id);
});

test("Test #4) Creating a playlist", async () => {
  const testPlaylist = {
    name: "Test Playlist",
    ownerEmail: "average@joecom",
    songs: [],
  };

  const createdPlaylist = await dbManager.createPlaylist(testPlaylist);

  const expectedPlaylist = {
    name: "Test Playlist",
    ownerEmail: "average@joecom",
    songs: [],
  };

  expect(expectedPlaylist.firstName, createdPlaylist.firstName);
  expect(expectedPlaylist.lastName, createdPlaylist.lastName);
  expect(expectedPlaylist._id, createdPlaylist._id);
});

test("Test #5) Adding a playlist to user", async () => {
  const testUser = {
    firstName: "Average",
    lastName: "Joe",
    email: "average@joecom",
    passwordHash: "aaaaaaaa",
  };

  const createdUser = await dbManager.createUser(testUser);

  const testPlaylist = {
    name: "Test Playlist",
    ownerEmail: "average@joecom",
    songs: [],
  };

  const createdPlaylist = await dbManager.createPlaylist(testPlaylist);

  const updatedUser = await dbManager.addPlaylistToUser(
    createdUser._id,
    createdPlaylist._id
  );

  expect(updatedUser.playlists).toBeDefined();
  expect(updatedUser.playlists.length).toBeGreaterThan(0);
});

test("Test #6) Reading a playlist by ID", async () => {
  const testPlaylist = {
    name: "Back In my Day",
    ownerEmail: "average@joe.com",
    songs: [],
  };

  const createdPlaylist = await dbManager.createPlaylist(testPlaylist);
  const readPlaylist = await dbManager.findPlaylistById(createdPlaylist._id);

  expect(testPlaylist.name, readPlaylist.name);
  expect(testPlaylist._id, readPlaylist._id);
});

test("Test #7) Reading a playlists by owner email", async () => {
  const ownerEmail = "average@joe.com";

  await dbManager.createPlaylist({ name: "Playlist 1", ownerEmail, songs: [] });
  await dbManager.createPlaylist({ name: "Playlist 2", ownerEmail, songs: [] });

  const playlists = await dbManager.findPlaylistsByOwnerEmail(ownerEmail);

  expect(2, playlists.length);
  expect(ownerEmail, playlists[0].ownerEmail);
});

test("Test #8) Reading all playlists", async () => {
  await dbManager.createPlaylist({
    name: "On Repeat",
    ownerEmail: "average@joe.com",
    songs: [],
  });
  await dbManager.createPlaylist({
    name: "Back In My Day",
    ownerEmail: "jane@doe.com",
    songs: [],
  });

  const allPlaylists = await dbManager.findAllPlaylists();

  expect(allPlaylists.length).toBeGreaterThanOrEqual(2);
});

test("Test #9) Updating a playlist", async () => {
  const testPlaylist = {
    name: "New Discoveries",
    ownerEmail: "average@joe.com",
    songs: [],
  };

  const createdPlaylist = await dbManager.createPlaylist(testPlaylist);
  const updatedPlaylist = await dbManager.updatePlaylist(createdPlaylist._id, {
    name: "Interesting songs",
    songs: [
      { title: "Song 1", artist: "Artist", year: 2025, youTubeId: "arbefe" },
    ],
  });

  expect("Interesting songs", updatedPlaylist.name);
  expect(1, updatedPlaylist.songs.length);
});

test("Test #10) Deleting a playlist", async () => {
  const testPlaylist = {
    name: "deleted playlist",
    ownerEmail: "jane@doe.com",
    songs: [],
  };

  const createdPlaylist = await dbManager.createPlaylist(testPlaylist);
  const result = await dbManager.deletePlaylist(createdPlaylist._id);

  expect(true, result);

  const deletedPlaylist = await dbManager.findPlaylistById(createdPlaylist._id);
  expect(deletedPlaylist).toBeNull();
});

test("Test #11) Clearing a collection", async () => {
  await dbManager.createUser({
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@doe.com",
    passwordHash: "aaaaaaaa",
  });
  await dbManager.clearCollection("users");

  const user = await dbManager.findUserByEmail("jane@doe.com");
  expect(user).toBeNull();
});

test("Test #12) Inserting many collections", async () => {
  const usersData = [
    {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@doe.com",
      passwordHash: "aaaaaaa",
    },
    {
      firstName: "Joe",
      lastName: "Shmo",
      email: "joe@shmo.com",
      passwordHash: "aaaaaaaa",
    },
  ];

  await dbManager.insertMany("users", usersData);

  const user1 = await dbManager.findUserByEmail("jane@doe.com");
  const user2 = await dbManager.findUserByEmail("joe@shmo.com");

  expect("Jane", user1.firstName);
  expect("Joe", user2.firstName);
});
