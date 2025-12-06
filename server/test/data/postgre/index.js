const dotenv = require("dotenv").config({ path: __dirname + "/../../../.env" });

async function fillTable(model, tableName, data) {
  for (let i = 0; i < data.length; i++) {
    await model.create(data[i]);
  }
  console.log(tableName + " filled");
}

async function resetPostgre() {
  const {
    User,
    Playlist,
    sequelize,
  } = require("../../../models/sequelize-models");
  const testData = require("../example-db-data.json");

  console.log("Resetting the PostgreSQL DB");

  try {
    console.log("Syncing database schema...");
    await sequelize.sync({ force: true });
    console.log("Database schema synced");

    await fillTable(User, "User", testData.users);
    await fillTable(Playlist, "Playlist", testData.playlists);

    console.log("PostgreSQL reset completed successfully.");
  } catch (error) {
    console.error("Error during reset:", error);
    throw error;
  }
}

const { sequelize } = require("../../../models/sequelize-models");

sequelize
  .authenticate()
  .then(() => {
    console.log("PostgreSQL connection established successfully.");
    return resetPostgre();
  })
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error("Connection error:", e.message);
    process.exit(1);
  });
