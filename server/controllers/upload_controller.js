const moment = require("moment");

const Photo = require("../models/photo_model");

const createUserPhoto = async (req, res) => {
  let uploadSize = 0;
  const userid = req.user.userid;
  let queryStr1 =
    "INSERT INTO photo (userid, url, albumid, public, trash, date, diaryid, size, deleted, upload_date) VALUES ";
  for (let i = 0; i < req.files.length; i += 1) {
    // orders insert
    const unixTime = parseInt(req.files[i].key.split(".")[0]);
    const date = moment(unixTime).format("YYYY-MM-DDTHH:mm:ss.SSS");
    const size = req.files[i].size;
    queryStr1 += `(${userid}, "${
      req.files[i].location
    }", null, false, false, "${date}", null, ${size}, false, "${
      date.split("T")[0]
    }"),`;
    uploadSize += size;
  }
  queryStr1 = queryStr1.replace(/.$/, ";");
  await Photo.insertPhotos(queryStr1);
  const percentage = (uploadSize / 2000000000) * 100; // 2GB up limit per user
  const queryStr2 = `UPDATE user SET storage = storage + ${percentage} WHERE userid = ${userid};`;
  await Photo.insertPhotos(queryStr2);
  res.status(200).send("photos uploading complete!");
};

module.exports = {
  createUserPhoto
};
