const moment = require("moment");

const Database = require("../models/photo_model");

const createUserPhoto = async (req, res) => {
  console.log(req.files);
  let size = 0; // need to update user table size
  let sql =
    "INSERT INTO photo (userid, url, albumid, public, trash, date, diaryid) VALUES ";
  for (let i = 0; i < req.files.length; i += 1) {
    // orders insert
    const unixTime = parseInt(req.files[i].key.split(".")[0]);
    const date = moment(unixTime).format("YYYY-MM-DDTHH:mm:ss.SSS");
    sql += `(1, "${req.files[i].location}", null, false, false, "${date}", null),`; // userid need to be flex
    size += req.files[i].size;
  }
  console.log(size);
  sql = sql.replace(/.$/, ";");
  await Database.insertDB(sql);
  res.status(200).send("photos uploading complete!");
};

module.exports = {
  createUserPhoto
};
