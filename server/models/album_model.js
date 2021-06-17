const { pool } = require("./mysqlcon");

const insertNewAlbum = async (sql, album) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const result = await conn.query(sql, album);
    await conn.query("COMMIT");
    return result;
  } catch (error) {
    await conn.query("ROLLBACK");
    return error;
  } finally {
    await conn.release();
  }
};

const updatePhotosToAlbum = async (photos, albumId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    let updatePhoto = `UPDATE photo SET album_id = ${albumId} WHERE url IN`;
    let url = "(";
    for (const photoURL of photos) {
      url += `"${photoURL}"` + ", ";
    }
    url = url.slice(0, -2);
    url += ");";
    updatePhoto += url;
    await conn.query(updatePhoto);
    await conn.query("COMMIT");
    return "Update Photos To Album Complete";
  } catch (error) {
    await conn.query("ROLLBACK");
    return error;
  } finally {
    await conn.release();
  }
};

const removePhotosFromAlbum = async (photos) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    let removePhoto = "UPDATE photo SET album_id = null WHERE url IN";
    let url = "(";
    for (const photoURL of photos) {
      url += `"${photoURL}"` + ", ";
    }
    url = url.slice(0, -2);
    url += ");";
    removePhoto += url;
    await conn.query(removePhoto);
    await conn.query("COMMIT");
    return "Remove Photos From Album Complete";
  } catch (error) {
    await conn.query("ROLLBACK");
    return error;
  } finally {
    await conn.release();
  }
};

const getAlbumPhotos = async (sql) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const result = await conn.query(sql);
    await conn.query("COMMIT");
    return result;
  } catch (error) {
    await conn.query("ROLLBACK");
    return error;
  } finally {
    await conn.release();
  }
};

const countAlbum = async (albumName) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const countAlbum = `SELECT COUNT(name) FROM album WHERE name = '${albumName}'`;
    const result = await conn.query(countAlbum);
    await conn.query("COMMIT");
    return result;
  } catch (error) {
    await conn.query("ROLLBACK");
    return error;
  } finally {
    await conn.release();
  }
};

const setAlbumAuthority = async (albumName, shared) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const updateAlbum = `UPDATE album SET shared = ${shared} WHERE name = '${albumName}'`;
    await conn.query(updateAlbum);
    await conn.query("COMMIT");
    return "Set Album Complete";
  } catch (error) {
    await conn.query("ROLLBACK");
    return error;
  } finally {
    await conn.release();
  }
};

const setAlbumDeleted = async (albumName, shared) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const deleteAlbum = `UPDATE album SET album_deleted = true WHERE name = '${albumName}'`;
    await conn.query(deleteAlbum);
    await conn.query("COMMIT");
    return "Set Album Complete";
  } catch (error) {
    await conn.query("ROLLBACK");
    return error;
  } finally {
    await conn.release();
  }
};

module.exports = {
  insertNewAlbum,
  updatePhotosToAlbum,
  getAlbumPhotos,
  removePhotosFromAlbum,
  countAlbum,
  setAlbumAuthority,
  setAlbumDeleted
};
