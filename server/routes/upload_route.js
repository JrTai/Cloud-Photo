const router = require("express").Router();
const { uploadFile, wrapAsync } = require("../../util/util");

const { createUserPhoto } = require("../controllers/upload_controller");

const photoUpload = uploadFile.upload.array("photos");

router.route("/upload/photo").post(photoUpload, wrapAsync(createUserPhoto));

module.exports = router;
