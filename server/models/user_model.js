require("dotenv").config();
const bcrypt = require("bcrypt");
const { pool } = require("./mysqlcon");
const salt = parseInt(process.env.BCRYPT_SALT);
const { TOKEN_EXPIRE, TOKEN_SECRET } = process.env; // 30 days by seconds
const jwt = require("jsonwebtoken");

const signInUp = async (email, password) => {
  const conn = await pool.getConnection();
  try {
    // await conn.query("START TRANSACTION");

    const emails = await conn.query(
      "SELECT email FROM user WHERE email = ? FOR UPDATE",
      [email]
    );
    if (emails[0].length > 0) {
      return nativeSignIn(email, password);
    }

    const user = {
      email: email,
      password: bcrypt.hashSync(password, salt),
      access_expired: TOKEN_EXPIRE,
      storage: 0,
      premium: false
    };
    const accessToken = jwt.sign(
      {
        email: user.email
      },
      TOKEN_SECRET
    );
    user.access_token = accessToken;

    const queryStr = "INSERT INTO user SET ?";
    const result = await conn.query(queryStr, user);

    user.id = result[0].insertId;
    // await conn.query("COMMIT");
    return { user };
  } catch (error) {
    console.log(error);
    // await conn.query("ROLLBACK");
    return { error };
  } finally {
    // await conn.release();
  }
};

const nativeSignIn = async (email, password) => {
  const conn = await pool.getConnection();
  try {
    // await conn.query("START TRANSACTION");

    const users = await conn.query("SELECT * FROM user WHERE email = ?", [
      email
    ]);
    const user = users[0][0];
    if (!bcrypt.compareSync(password, user.password)) {
      //   await conn.query("COMMIT");
      return { error: "Password is wrong" };
    }

    const accessToken = jwt.sign(
      {
        email: user.email
      },
      TOKEN_SECRET
    );

    // problem, will block process, currently skip update step
    // const queryStr = `UPDATE user SET access_token = "${accessToken}", access_expired = ${TOKEN_EXPIRE} WHERE userid = ${user.userid};`;
    // await conn.query(queryStr);

    // await conn.query("COMMIT");

    user.access_token = accessToken;
    user.access_expired = TOKEN_EXPIRE;

    return { user };
  } catch (error) {
    // await conn.query("ROLLBACK");
    return { error };
  } finally {
    // await conn.release();
  }
};

const getStorage = async (email) => {
  const conn = await pool.getConnection();
  try {
    const users = await conn.query("SELECT * FROM user WHERE email = ?", [
      email
    ]);
    const user = users[0][0];
    return user.storage;
  } catch (error) {
    // await conn.query("ROLLBACK");
    return { error };
  } finally {
    // await conn.release();
  }
};

module.exports = {
  signInUp,
  getStorage
};
