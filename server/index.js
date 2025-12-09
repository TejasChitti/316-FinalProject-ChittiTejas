const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS Configuration - MUST come before routes
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Cookie parser middleware
app.use(cookieParser());

// Routes
const authRouter = require("./routes/auth-router");
const playlistRouter = require("./routes/playlist-router");
const songRouter = require("./routes/song-router");

app.use("/auth", authRouter);
app.use("/api/playlists", playlistRouter);
app.use("/api/songs", songRouter);

// MongoDB Connection
mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });

module.exports = app;
