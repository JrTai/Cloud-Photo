const router = require("express").Router();
const { upload, wrapAsync, authentication } = require("../../util/util");

const { createUserPhoto } = require("../controllers/upload_controller");

const photoUpload = upload.array("photos");

router
  .route("/upload/photo")
  .post(authentication(), photoUpload, wrapAsync(createUserPhoto));

module.exports = router;
