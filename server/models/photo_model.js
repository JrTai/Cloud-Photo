// const { pool } = require("./mysqlcon");

const insertPhoto = async (product, variants) => {
  // insert photo to DB (under user account)
  //   const conn = await pool.getConnection();
  //   try {
  //     await conn.query("START TRANSACTION");
  //     const result = await conn.query("INSERT INTO product SET ?", product);
  //     await conn.query(
  //       "INSERT INTO variant(color_code,color_name,size,stock,product_id) VALUES ?",
  //       [variants]
  //     );
  //     await conn.query("COMMIT");
  //     return result.insertId;
  //   } catch (error) {
  //     await conn.query("ROLLBACK");
  //     return error;
  //   } finally {
  //     await conn.release();
  //   }
};

module.exports = {
  insertPhoto
};
