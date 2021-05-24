const router = require("express").Router();

const { wrapAsync, authentication } = require("../../util/util");

const {
  userPhotos,
  userAlbums,
  userNewAlbum
} = require("../controllers/main_controller");

router.route("/user/photos").post(authentication(), wrapAsync(userPhotos));

router.route("/user/albums").post(authentication(), wrapAsync(userAlbums));

router.route("/user/new/album").post(authentication(), wrapAsync(userNewAlbum));

module.exports = router;
