const { pool } = require("./mysqlcon");

const queryDB = async (sql) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    await conn.query(sql);
    await conn.query("COMMIT");
    return "Insert Photo Table Complete";
  } catch (error) {
    await conn.query("ROLLBACK");
    return error;
  } finally {
    await conn.release();
  }
};

module.exports = {
  queryDB
};
