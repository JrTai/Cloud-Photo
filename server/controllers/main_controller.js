const Photo = require("../models/photo_model");
const Album = require("../models/album_model");

const userPhotos = async (req, res) => {
  const index = req.body.loadIndex;
  const getPhotosDetails = `SELECT * FROM photo WHERE user_id = ${req.user.user_id} AND trash != true AND photo_owner_user_id = ${req.user.user_id} ORDER BY UNIX_TIMESTAMP(date) DESC LIMIT ${index}, 20;`;
  const photos = await Photo.getPhotos(getPhotosDetails);
  res.status(200).send(photos);
};

const userTrash = async (req, res) => {
  const index = req.body.loadIndex;
  const getPhotosDetails = `SELECT * FROM photo WHERE user_id = ${req.user.user_id} AND trash = true ORDER BY UNIX_TIMESTAMP(date) DESC LIMIT ${index}, 20;`;
  const photos = await Photo.getPhotos(getPhotosDetails);
  res.status(200).send(photos);
};

const userAlbums = async (req, res) => {
  const index = req.body.loadIndex;
  const shared = req.body.shared;
  const getUserAlbumsDetails = `SELECT * FROM photo JOIN album ON photo.album_id = album.album_id WHERE photo.user_id IN (${req.user.user_id}) AND album.shared = ${shared} ORDER BY album.album_id DESC LIMIT ${index}, 20;`;
  const photos = await Album.getAlbumPhotos(getUserAlbumsDetails);
  res.status(200).send(photos[0]);
};

const userNewAlbum = async (req, res) => {
  const photos = req.body.photos;
  const album = {
    name: req.body.albumName,
    shared: req.body.shared,
    album_owner_user_id: req.user.user_id
  };
  const countAlbum = await Album.countAlbum(req.body.albumName);
  if (countAlbum[0][0]["COUNT(name)"]) {
    res.status(200).send({
      msg: `Album Name "${req.body.albumName}" Exist!`,
      created: false
    });
    return;
  }
  const createUserNewAlbum = "INSERT INTO album SET ?";
  const result = await Album.insertNewAlbum(createUserNewAlbum, album);
  await Album.updatePhotosToAlbum(photos, result[0].insertId);
  res
    .status(200)
    .send({ msg: `Album "${req.body.albumName}" created!`, created: true });
};

const deletePhotos = async (req, res) => {
  const photos = req.body.photos;
  const userId = req.user.user_id;
  // check photos ownership
  const ownership = await Photo.checkOwnership(photos, userId);
  if (!ownership) {
    res.status(200).send({ msg: "No Ownership Of Photos!", deleted: false });
    return;
  }
  const deleteToTrash = req.body.deleteToTrash;
  // remove photos from album for all user_id(update many user_id photos, even if photo in other user's album)
  if (deleteToTrash) {
    await Photo.deletePhotoToTrash(photos);
  } else {
    await Album.removePhotosFromAlbum(photos);
  }
  if (deleteToTrash) {
    res.status(200).send({ msg: "Photo Deleted!", deleted: true });
  } else {
    res.status(200).send({ msg: "Photo Removed From Album!", deleted: true });
  }
};

const addPhotoToAlbum = async (req, res) => {
  const countAlbum = await Album.countAlbum(req.body.albumName);
  if (countAlbum[0][0]["COUNT(name)"]) {
    // album exist
    await Photo.addPhotoToExistAlbum(req.body.photos, req.body.albumName, req.user.user_id);
    res.status(200).send({
      msg: `Photo Added to Album "${req.body.albumName}"!`,
      created: true
    });
  } else {
    // album not exist
    res.status(200).send({
      msg: `Album "${req.body.albumName}" Not Exist!`,
      created: false
    });
  }
};

module.exports = {
  userPhotos,
  userAlbums,
  userTrash,
  userNewAlbum,
  deletePhotos,
  addPhotoToAlbum
};
