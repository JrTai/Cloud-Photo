const { pool } = require("./mysqlcon");

const insertPhotos = async (sql) => {
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

const getPhotos = async (sql) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const photos = await conn.query(sql);
    await conn.query("COMMIT");
    return photos[0];
  } catch (error) {
    await conn.query("ROLLBACK");
    return error;
  } finally {
    await conn.release();
  }
};

const deletePhotoToTrash = async (photos) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    let deletePhoto =
      "UPDATE photo SET album_id = null, trash = true WHERE url IN";
    let url = "(";
    for (const photoURL of photos) {
      url += `"${photoURL}"` + ", ";
    }
    url = url.slice(0, -2);
    url += ");";
    deletePhoto += url;
    await conn.query(deletePhoto);
    await conn.query("COMMIT");
    return "Delete Photos To Trash Complete";
  } catch (error) {
    await conn.query("ROLLBACK");
    return error;
  } finally {
    await conn.release();
  }
};

module.exports = {
  insertPhotos,
  getPhotos,
  deletePhotoToTrash
};
