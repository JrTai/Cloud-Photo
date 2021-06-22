require("dotenv").config();
const { NODE_ENV } = process.env;
const bcrypt = require("bcrypt");
const {
  users
} = require("./fake_data");
const { pool } = require("../server/models/mysqlcon");
const salt = parseInt(process.env.BCRYPT_SALT);

async function _createFakeUser () {
  const encrypedUsers = users.map(user => {
    const encrypedUser = {
      user_id: user.user_id,
      email: user.email,
      password: user.password ? bcrypt.hashSync(user.password, salt) : null,
      storage: user.storage,
      premium: user.premium,
      access_token: user.access_token,
      access_expired: user.access_expired
    };
    return encrypedUser;
  });
  return await pool.query("INSERT INTO user (user_id, email, password, storage, premium, access_token, access_expired) VALUES ?", [encrypedUsers.map(x => Object.values(x))]);
}

async function createFakeData () {
  if (NODE_ENV !== "test") {
    console.log("Not in test env");
    return;
  }

  await _createFakeUser();
}

async function truncateFakeData () {
  if (NODE_ENV !== "test") {
    console.log("Not in test env");
    return;
  }

  const truncateTable = async (table) => {
    const conn = await pool.getConnection();
    await conn.query("START TRANSACTION");
    await conn.query("SET FOREIGN_KEY_CHECKS = ?", 0);
    await conn.query(`TRUNCATE TABLE ${table}`);
    await conn.query("SET FOREIGN_KEY_CHECKS = ?", 1);
    await conn.query("COMMIT");
    conn.release();
  };

  const tables = ["user", "photo", "face", "diary", "album"];
  for (const table of tables) {
    console.log(`Truncating table ${table}`);
    await truncateTable(table);
  }
}

async function closeConnection () {
  return await pool.end();
}

async function main () {
  await truncateFakeData();
  await createFakeData();
  await closeConnection();
}

// execute when called directly.
if (require.main === module) {
  main();
}

module.exports = {
  createFakeData,
  truncateFakeData,
  closeConnection
};
