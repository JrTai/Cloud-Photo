const Photo = require("../models/photo_model");
const Album = require("../models/album_model");
const Face = require("../models/face_model");

const photosPerLoad = 40;

const userPhotos = async (req, res) => {
  const index = req.body.loadIndex;
  const getPhotosDetails = `SELECT * FROM photo WHERE user_id = ${req.user.user_id} AND trash != true AND photo_deleted != true AND photo_owner_user_id = ${req.user.user_id} ORDER BY UNIX_TIMESTAMP(date) DESC LIMIT ${index}, ${photosPerLoad};`;
  const photos = await Photo.getPhotos(getPhotosDetails);
  res.status(200).send(photos);
};

const userFaces = async (req, res) => {
  const index = req.body.loadIndex;
  const getFaceDetails = `SELECT * FROM face WHERE user_id = ${req.user.user_id} ORDER BY face_id LIMIT ${index}, ${photosPerLoad};`;
  const faces = await Face.getFaces(getFaceDetails);
  res.status(200).send(faces);
};

const userFacePhotos = async (req, res) => {
  const index = req.body.loadIndex;
  const getFacePhotosDetails = `SELECT * FROM photo WHERE user_id = ${req.user.user_id} AND include_face_id LIKE '%${req.body.faceId}%' AND trash != true AND photo_deleted != true AND photo_owner_user_id = ${req.user.user_id} ORDER BY UNIX_TIMESTAMP(date) DESC LIMIT ${index}, ${photosPerLoad};`;
  const faces = await Face.getPhotosDetails(getFacePhotosDetails);
  res.status(200).send(faces);
};

const userExhibition = async (req, res) => {
  const index = req.body.loadIndex;
  const getPhotosDetails = `SELECT * FROM photo WHERE trash != true AND photo_deleted != true AND public = true ORDER BY UNIX_TIMESTAMP(date) DESC LIMIT ${index}, ${photosPerLoad};`;
  const photos = await Photo.getPhotos(getPhotosDetails);
  res.status(200).send(photos);
};

const userTrash = async (req, res) => {
  const index = req.body.loadIndex;
  const getPhotosDetails = `SELECT * FROM photo WHERE user_id = ${req.user.user_id} AND trash = true AND photo_deleted != true ORDER BY UNIX_TIMESTAMP(date) DESC LIMIT ${index}, ${photosPerLoad};`;
  const photos = await Photo.getPhotos(getPhotosDetails);
  res.status(200).send(photos);
};

const userAlbums = async (req, res) => {
  const index = req.body.loadIndex;
  const shared = req.body.shared;
  let getUserAlbumsDetails;
  if (shared) {
    getUserAlbumsDetails = `SELECT * FROM photo JOIN album ON photo.album_id = album.album_id WHERE photo.user_id IN (${req.user.user_id}) AND album.shared = ${shared} AND album.album_deleted != true ORDER BY album.album_id DESC, photo.photo_id DESC LIMIT ${index}, ${photosPerLoad};`;
  } else {
    getUserAlbumsDetails = `SELECT * FROM photo JOIN album ON photo.album_id = album.album_id WHERE photo.user_id IN (${req.user.user_id}) AND album.shared = ${shared} AND album.album_owner_user_id = ${req.user.user_id} AND album.album_deleted != true ORDER BY album.album_id DESC, photo.photo_id DESC LIMIT ${index}, ${photosPerLoad};`;
  }
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
    const msg = await Photo.addPhotoToExistAlbum(
      req.body.photos,
      req.body.albumName,
      req.user.user_id
    );
    if (msg === "Add Photos To Album Complete") {
      res.status(200).send({
        msg: `Photo Added to Album "${req.body.albumName}"!`,
        created: true
      });
    } else {
      res.status(200).send({
        msg: msg,
        created: false
      });
    }
  } else {
    // album not exist
    res.status(200).send({
      msg: `Album "${req.body.albumName}" Not Exist!`,
      created: false
    });
  }
};

const addUserToAlbum = async (req, res) => {
  const albumName = req.body.albumName;
  const userEmail = req.body.userEmail;
  const userId = req.body.userId;
  const albumOwnerUserId = req.user.user_id;

  // album exist
  await Photo.addUserToExistAlbum(albumName, userId, albumOwnerUserId);
  res.status(200).send({
    msg: `User '${userEmail}' Added to Album "${albumName}"!`,
    created: true
  });
};

const setAlbum = async (req, res) => {
  const albumName = req.body.albumName;
  const shared = req.body.shared;

  await Album.setAlbumAuthority(albumName, shared);
  let msg;
  if (shared) {
    msg = `Set Album '${albumName}' As Shared Album`;
  } else {
    msg = `Set Album '${albumName}' As My Album`;
  }
  res.status(200).send({
    msg: msg
  });
};

const deleteAlbum = async (req, res) => {
  const albumName = req.body.albumName;

  await Album.setAlbumDeleted(albumName);
  const msg = `Successfully Remove Album '${albumName}'`;
  res.status(200).send({
    msg: msg
  });
};

const deleteOrRecover = async (req, res) => {
  const photos = req.body.photos;
  const recoveryPhotos = req.body.recoveryPhotos;
  const deletedPhotos = req.body.deletedPhotos;

  await Photo.setTrashPhotos(photos, recoveryPhotos, deletedPhotos);
  let msg;
  if (recoveryPhotos) {
    msg = "Recovered Photos From Trash";
  }
  if (deletedPhotos) {
    msg = "Deleted Photos From Trash";
  }
  res.status(200).send({
    msg: msg
  });
};

const addPhotoToExhibition = async (req, res) => {
  const photos = req.body.photos;

  await Photo.setPhotosPublic(photos, req.user.user_id);
  const msg = "Set Photos To Exhibition";
  res.status(200).send({
    msg: msg
  });
};

module.exports = {
  userPhotos,
  userAlbums,
  userFaces,
  userFacePhotos,
  userTrash,
  userExhibition,
  userNewAlbum,
  deletePhotos,
  addPhotoToAlbum,
  addUserToAlbum,
  setAlbum,
  deleteAlbum,
  deleteOrRecover,
  addPhotoToExhibition
};
