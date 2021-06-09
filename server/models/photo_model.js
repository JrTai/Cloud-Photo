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
    // get photos in album, to omit photo add to album multi times
    const getPhotosInAlum = `SELECT DISTINCT url FROM photo WHERE album_id = ${albumId[0][0].album_id}`;
    const photosInAlum = await conn.query(getPhotosInAlum);
    const albumPhotosSet = new Set();
    for (const photoInAlum of photosInAlum[0]) {
      albumPhotosSet.add(photoInAlum.url);
    }

    let insertNewPhotos =
      "INSERT INTO photo (user_id, url, album_id, public, trash, date, diary_id, size, photo_deleted, upload_date, photo_owner_user_id) VALUES ";
    for (const photoURL of photos) {
      for (const user of users[0]) {
        const eachUserId = user.user_id;
        if (eachUserId === userId || albumPhotosSet.has(photoURL)) {
          continue;
        }
        otherUser = true;
        insertNewPhotos += `(${eachUserId}, "${photoURL}", ${albumId[0][0].album_id}, false, false, null, null, null, false, null, ${userId}),`;
      }
    }
    if (otherUser) {
      insertNewPhotos = insertNewPhotos.replace(/.$/, ";");
      await conn.query(insertNewPhotos);
    }

    // 2. update userId itself, add photo to album
    let updatePhotoOwnerAlbum = `UPDATE photo SET album_id = ${albumId[0][0].album_id} WHERE url IN`;
    let url = "(";
    for (const photoURL of photos) {
      if (albumPhotosSet.has(photoURL)) {
        continue;
      }
      url += `"${photoURL}"` + ", ";
    }
    url = url.slice(0, -2);
    url += `) AND user_id = ${userId};`;
    updatePhotoOwnerAlbum += url;
    await conn.query(updatePhotoOwnerAlbum);
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

const addUserToExistAlbum = async (albumName, userId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const getAlbum = `SELECT album_id FROM album WHERE name = '${albumName}'`;
    const albumDetail = await conn.query(getAlbum);
    const albumId = albumDetail[0][0].album_id;
    const getAlbumPhotos = `SELECT * FROM photo WHERE album_id = '${albumId}'`;
    const albumPhotos = await conn.query(getAlbumPhotos);

    let insertNewPhotos =
      "INSERT INTO photo (user_id, url, album_id, public, trash, date, diary_id, size, photo_deleted, upload_date, photo_owner_user_id) VALUES ";
    for (const photo of albumPhotos[0]) {
      insertNewPhotos += `(${userId}, "${photo.url}", ${photo.album_id}, false, false, null, null, null, false, null, ${photo.photo_owner_user_id}),`;
    }
    insertNewPhotos = insertNewPhotos.replace(/.$/, ";");
    await conn.query(insertNewPhotos);

    await conn.query("COMMIT");
    return "Add User To Ablum Complete";
  } catch (error) {
    await conn.query("ROLLBACK");
    return error;
  } finally {
    await conn.release();
  }
};

const setTrashPhotos = async (photos, recoveryPhotos, deletedPhotos) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    let updateTrashPhotos;
    if (recoveryPhotos) {
      updateTrashPhotos = "UPDATE photo SET trash = false WHERE url IN";
    } else if (deletedPhotos) {
      updateTrashPhotos = "UPDATE photo SET photo_deleted = true WHERE url IN";
    }
    let url = "(";
    for (const photoURL of photos) {
      url += `"${photoURL}"` + ", ";
    }
    url = url.slice(0, -2);
    url += ");";
    updateTrashPhotos += url;
    await conn.query(updateTrashPhotos);
    await conn.query("COMMIT");
    return "Update Trash Photos Complete";
  } catch (error) {
    await conn.query("ROLLBACK");
    return error;
  } finally {
    await conn.release();
  }
};

const setPhotosPublic = async (photos, userId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    let updatePhotosPublic = "UPDATE photo SET public = true WHERE url IN";
    let url = "(";
    for (const photoURL of photos) {
      url += `"${photoURL}"` + ", ";
    }
    url = url.slice(0, -2);
    url += `) AND user_id = ${userId};`;
    updatePhotosPublic += url;
    await conn.query(updatePhotosPublic);
    await conn.query("COMMIT");
    return "Update Photos To Public Complete";
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
  checkOwnership,
  addUserToExistAlbum,
  setTrashPhotos,
  setPhotosPublic
};
