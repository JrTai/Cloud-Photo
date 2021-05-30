const router = require("express").Router();

const { wrapAsync, authentication } = require("../../util/util");

const {
  userPhotos,
  userAlbums,
  userTrash,
  userNewAlbum,
  deletePhotos,
  addPhotoToAlbum,
  addUserToAlbum,
  setAlbum,
  deleteAlbum,
  deleteOrRecover
} = require("../controllers/main_controller");

router.route("/user/photos").post(authentication(), wrapAsync(userPhotos));

router.route("/user/albums").post(authentication(), wrapAsync(userAlbums));

router.route("/user/trash").post(authentication(), wrapAsync(userTrash));

router.route("/user/new/album").post(authentication(), wrapAsync(userNewAlbum));

router.route("/user/photos/exist/album").post(authentication(), wrapAsync(addPhotoToAlbum));

router.route("/user/exist/album").post(authentication(), wrapAsync(addUserToAlbum));

router.route("/user/set/album").post(authentication(), wrapAsync(setAlbum));

router.route("/user/delete/album").post(authentication(), wrapAsync(deleteAlbum));

router.route("/user/trash/set/photos").post(authentication(), wrapAsync(deleteOrRecover));

router
  .route("/user/delete/photos")
  .post(authentication(), wrapAsync(deletePhotos));

module.exports = router;
