const router = require("express").Router();

const { wrapAsync, authentication } = require("../../util/util");

const { userPhotos, userNewAlbum } = require("../controllers/main_controller");

router.route("/user/photos").post(authentication(), wrapAsync(userPhotos));

router.route("/user/new/album").post(authentication(), wrapAsync(userNewAlbum));

module.exports = router;
