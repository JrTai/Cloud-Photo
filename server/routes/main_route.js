const router = require("express").Router();

const { wrapAsync, authentication } = require("../../util/util");

const {
  userPhotos,
  userAlbums,
  userNewAlbum,
  deletePhotos
} = require("../controllers/main_controller");

router.route("/user/photos").post(authentication(), wrapAsync(userPhotos));

router.route("/user/albums").post(authentication(), wrapAsync(userAlbums));

router.route("/user/new/album").post(authentication(), wrapAsync(userNewAlbum));

router
  .route("/user/delete/photos")
  .post(authentication(), wrapAsync(deletePhotos));

module.exports = router;
