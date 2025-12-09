const express = require("express");
const router = express.Router();
const PlaylistController = require("../controllers/playlist-controller");
const auth = require("../auth/index"); // YOU FORGOT THIS

router.post("/", auth.verify, PlaylistController.createPlaylist);
router.get("/", PlaylistController.getPlaylists);
router.get("/:id", PlaylistController.getPlaylistById);
router.put("/:id", auth.verify, PlaylistController.updatePlaylist);
router.delete("/:id", auth.verify, PlaylistController.deletePlaylist);
router.post("/:id/copy", auth.verify, PlaylistController.copyPlaylist);
router.post("/:id/play", auth.verify, PlaylistController.playPlaylist);

module.exports = router;
