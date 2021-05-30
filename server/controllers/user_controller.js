require("dotenv").config();
const validator = require("validator");
const User = require("../models/user_model");

const signInUp = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res
      .status(400)
      .send({ error: "Request Error: email and password are required." });
    return;
  }

  if (!validator.isEmail(email)) {
    res.status(400).send({ error: "Request Error: Invalid email format" });
    return;
  }

  const result = await User.signInUp(email, password);
  if (result.error) {
    res.status(403).send({ error: result.error });
    return;
  }

  const user = result.user;
  if (!user) {
    res.status(500).send({ error: "Database Query Error" });
    return;
  }

  res.status(200).send({
    data: {
      access_token: user.access_token,
      access_expired: user.access_expired,
      user: {
        id: user.id,
        email: user.email
      }
    }
  });
};

const userDetail = async (req, res) => {
  res.status(200).send(req.user);
};

const checkHasUser = async (req, res) => {
  const userEmail = req.body.userEmail;
  const checkResult = await User.checkExist(userEmail);
  if (checkResult.hasUser) {
    res.status(200).send({ msg: `Adding User '${userEmail}' To Shared Album...`, hasUser: true, userId: checkResult.userId });
  } else {
    res.status(200).send({ msg: "User Does Not Exist!", hasUser: false, userId: null });
  }
};

module.exports = {
  signInUp,
  userDetail,
  checkHasUser
};
