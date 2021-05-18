const router = require("express").Router();
const { upload, wrapAsync } = require("../../util/util");

const { createUserPhoto } = require("../controllers/upload_controller");

const photoUpload = upload.array("photos");

router.route("/upload/photo").post(photoUpload, wrapAsync(createUserPhoto));

module.exports = router;
