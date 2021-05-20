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

module.exports = {
  signInUp,
  userDetail
};
