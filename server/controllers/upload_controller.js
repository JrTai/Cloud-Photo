// const Photo = require("../models/photo_model");

const createUserPhoto = async (req, res) => {
  // insert photo url in s3 to DB
  // const productId = await Photo.insertPhoto(product, variants);
  res.status(200).send("photos uploading complete!");
};

module.exports = {
  createUserPhoto
};
