const router = require("express").Router();

const { wrapAsync, authentication } = require("../../util/util");

const {
  userPhotos,
  userAlbums,
  userFaces,
  userFacePhotos,
  userTrash,
  userExhibition,
  userNewAlbum,
  deletePhotos,
  addPhotoToAlbum,
  addUserToAlbum,
  setAlbum,
  deleteAlbum,
  deleteOrRecover,
  addPhotoToExhibition
} = require("../controllers/main_controller");

router.route("/user/photos").post(authentication(), wrapAsync(userPhotos));

router.route("/user/albums").post(authentication(), wrapAsync(userAlbums));

router.route("/user/faces").post(authentication(), wrapAsync(userFaces));

router.route("/user/face/photos").post(authentication(), wrapAsync(userFacePhotos));

router.route("/user/trash").post(authentication(), wrapAsync(userTrash));

router
  .route("/user/exhibition")
  .post(authentication(), wrapAsync(userExhibition));

router.route("/user/new/album").post(authentication(), wrapAsync(userNewAlbum));

router
  .route("/user/photos/exist/album")
  .post(authentication(), wrapAsync(addPhotoToAlbum));

router
  .route("/user/exist/album")
  .post(authentication(), wrapAsync(addUserToAlbum));

router.route("/user/set/album").post(authentication(), wrapAsync(setAlbum));

router
  .route("/user/delete/album")
  .post(authentication(), wrapAsync(deleteAlbum));

router
  .route("/user/trash/set/photos")
  .post(authentication(), wrapAsync(deleteOrRecover));

router
  .route("/user/photos/set/exhibition")
  .post(authentication(), wrapAsync(addPhotoToExhibition));

router
  .route("/user/delete/photos")
  .post(authentication(), wrapAsync(deletePhotos));

module.exports = router;
