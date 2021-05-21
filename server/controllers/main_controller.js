const Photo = require("../models/photo_model");

const userPhotos = async (req, res) => {
  const queryStr = `SELECT * FROM photo WHERE userid = ${req.user.userid} ORDER BY UNIX_TIMESTAMP(date) DESC LIMIT 0, 20;`;
  const photos = await Photo.getPhotos(queryStr);
  res.status(200).send(photos);
};

module.exports = {
  userPhotos
};
