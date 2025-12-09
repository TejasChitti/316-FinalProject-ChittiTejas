const express = require("express");
const router = express.Router();
const PlaylistController = require("../controllers/playlist-controller");

router.post("/", PlaylistController.createPlaylist);
router.get("/", PlaylistController.getPlaylists);
router.get("/:id", PlaylistController.getPlaylistById);
router.put("/:id", PlaylistController.updatePlaylist);
router.delete("/:id", PlaylistController.deletePlaylist);
router.post("/:id/copy", PlaylistController.copyPlaylist);
router.post("/:id/play", PlaylistController.playPlaylist);

module.exports = router;
