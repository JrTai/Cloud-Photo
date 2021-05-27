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

const addPhotoToExistAlbum = async (photos, albumName, userId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const getAlbumId = `SELECT album_id FROM album WHERE name = '${albumName}'`;
    const albumId = await conn.query(getAlbumId);
    // 1. get all user_id of album, add all photos to album for all user_id(insert many rows user_id photos)
    const usersOfAlum = `SELECT DISTINCT user_id FROM photo WHERE album_id = ${albumId[0][0].album_id}`;
    const users = await conn.query(usersOfAlum);
    let otherUser = false;

    let insertNewPhotos =
      "INSERT INTO photo (user_id, url, album_id, public, trash, date, diary_id, size, deleted, upload_date, photo_owner_user_id) VALUES ";
    for (const photoURL of photos) {
      for (const user of users[0]) {
        const eachUserId = user.user_id;
        if (eachUserId === userId) {
          continue;
        }
        otherUser = true;
        insertNewPhotos += `(${eachUserId}, "${photoURL}", ${albumId[0][0].album_id}, false, false, null, null, null, false, null, ${userId}),`;
      }
    }
    if (otherUser) {
      insertNewPhotos = insertNewPhotos.replace(/.$/, ";");
      console.log(insertNewPhotos);
      await conn.query(insertNewPhotos);
    }

    // 2. update userId itself, add photo to album
    let addPhotos = `UPDATE photo SET album_id = ${albumId[0][0].album_id} WHERE url IN`;
    let url = "(";
    for (const photoURL of photos) {
      url += `"${photoURL}"` + ", ";
    }
    url = url.slice(0, -2);
    url += ");";
    addPhotos += url;
    await conn.query(addPhotos);
    await conn.query("COMMIT");
    return "Add Photos To Album Complete";
  } catch (error) {
    await conn.query("ROLLBACK");
    return error;
  } finally {
    await conn.release();
  }
};

const checkOwnership = async (photos, userId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    let distinctId =
      "SELECT DISTINCT photo_owner_user_id FROM photo WHERE url IN";
    let url = "(";
    for (const photoURL of photos) {
      url += `"${photoURL}"` + ", ";
    }
    url = url.slice(0, -2);
    url += ");";
    distinctId += url;
    const result = await conn.query(distinctId);
    await conn.query("COMMIT");
    if (result[0].length > 1) {
      return false;
    } else {
      return result[0][0].photo_owner_user_id === userId;
    }
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
  deletePhotoToTrash,
  addPhotoToExistAlbum,
  checkOwnership
};
