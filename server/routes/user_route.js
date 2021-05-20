const router = require("express").Router();

const { wrapAsync, authentication } = require("../../util/util");

const { signInUp, userDetail } = require("../controllers/user_controller");

router.route("/user/signinup").post(wrapAsync(signInUp));

router
  .route("/user/authentication")
  .post(authentication(), wrapAsync(userDetail));

module.exports = router;
