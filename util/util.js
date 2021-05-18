require("dotenv").config();
const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
// const path = require("path");

// reference: https://thecodebarbarian.com/80-20-guide-to-express-error-handling
const wrapAsync = (fn) => {
  return function (req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next);
  };
};

aws.config.update({
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  accessKeyId: process.env.S3_ACCESS_KEY,
  region: "us-east-2"
});
const s3 = new aws.S3();

// multer upload to AWS S3
const storage = multerS3({
  s3: s3,
  bucket: "cloud-photo-henry/photos",
  acl: "public-read",
  contentType: function (req, file, cb) {
    cb(null, file.mimetype);
  },
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
    const fileExtension = file.mimetype.split("/")[1]; // get file extension from original file name
    const fileName = Date.now() + "." + fileExtension;
    cb(null, fileName); // use Date.now() for unique file keys
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 } // 2 MB max photo size
});

module.exports = {
  upload,
  wrapAsync
};
