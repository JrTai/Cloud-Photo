const Photo = require("../models/photo_model");
const Album = require("../models/album_model");

const userPhotos = async (req, res) => {
  const index = req.body.loadPageIndex;
  const getPhotosDetails = `SELECT * FROM photo WHERE user_id = ${req.user.user_id} ORDER BY UNIX_TIMESTAMP(date) DESC LIMIT ${index}, 20;`;
  const photos = await Photo.getPhotos(getPhotosDetails);
  res.status(200).send(photos);
};

const userNewAlbum = async (req, res) => {
  const photos = req.body.photos;
  const album = {
    user_id: req.user.user_id,
    name: req.body.albumName,
    shared: req.body.shared,
    owner_user_id: req.user.user_id
  };
  const createUserNewAlbum = "INSERT INTO album SET ?";
  const result = await Album.insertNewAlbum(createUserNewAlbum, album);
  await Album.updatePhotosToAlbum(photos, result[0].insertId);
  res.status(200).send(`Album "${req.body.albumName}" created!`);
};

module.exports = {
  userPhotos,
  userNewAlbum
};
