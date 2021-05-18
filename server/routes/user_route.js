const router = require("express").Router();

const { wrapAsync } = require("../../util/util");

const { signInUp } = require("../controllers/user_controller");

router.route("/user/signinup").post(wrapAsync(signInUp));

module.exports = router;
