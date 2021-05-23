require("dotenv").config();
const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const { TOKEN_SECRET } = process.env; // 30 days by seconds
const jwt = require("jsonwebtoken");
const User = require("../server/models/user_model");

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

const authentication = () => {
  return async function (req, res, next) {
    let accessToken = req.get("Authorization");
    if (!accessToken) {
      res.status(401).send({ error: "Unauthorized" });
      return;
    }

    accessToken = accessToken.replace("Bearer ", "");
    if (accessToken === "null") {
      res.status(401).send({ error: "Unauthorized" });
      return;
    }

    try {
      const user = jwt.verify(accessToken, TOKEN_SECRET);
      const { userDetail } = await User.getUserDetail(user.email);
      user.storage = userDetail.storage;
      user.user_id = userDetail.user_id;
      req.user = user;
      next();
      return;
    } catch (err) {
      res.status(403).send({ error: "Forbidden" });
    }
  };
};

module.exports = {
  upload,
  wrapAsync,
  authentication
};
