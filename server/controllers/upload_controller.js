const moment = require("moment");

const Photo = require("../models/photo_model");

const createUserPhoto = async (req, res) => {
  let uploadSize = 0;
  const userid = req.user.user_id;
  let insertNewPhotos =
    "INSERT INTO photo (user_id, url, album_id, public, trash, date, diary_id, size, photo_deleted, upload_date, photo_owner_user_id) VALUES ";
  for (let i = 0; i < req.files.length; i += 1) {
    const unixTime = parseInt(req.files[i].key.split(".")[0]);
    const date = moment(unixTime).format("YYYY-MM-DDTHH:mm:ss.SSS");
    const size = req.files[i].size;
    insertNewPhotos += `(${userid}, "${
      req.files[i].location
    }", null, false, false, "${date}", null, ${size}, false, "${
      date.split("T")[0]
    }", ${userid}),`;
    uploadSize += size;
  }
  insertNewPhotos = insertNewPhotos.replace(/.$/, ";");
  await Photo.insertPhotos(insertNewPhotos);
  const percentage = (uploadSize / 2000000000) * 100; // 2GB up limit per user
  const updateUserStorage = `UPDATE user SET storage = storage + ${percentage} WHERE user_id = ${userid};`;
  await Photo.insertPhotos(updateUserStorage);
  res.status(200).send("Photos Uploading Completed!");
};

module.exports = {
  createUserPhoto
};
