const Photo = require("../models/photo_model");

const userPhotos = async (req, res) => {
  const index = req.body.loadPageIndex;
  const getPhotosDetails = `SELECT * FROM photo WHERE userid = ${req.user.userid} ORDER BY UNIX_TIMESTAMP(date) DESC LIMIT ${index}, 20;`;
  const photos = await Photo.getPhotos(getPhotosDetails);
  res.status(200).send(photos);
};

module.exports = {
  userPhotos
};
