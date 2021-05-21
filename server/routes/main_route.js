const router = require("express").Router();

const { wrapAsync, authentication } = require("../../util/util");

const { userPhotos } = require("../controllers/main_controller");

router.route("/user/photos").post(authentication(), wrapAsync(userPhotos));

module.exports = router;
