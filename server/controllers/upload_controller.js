const moment = require("moment");

const Photo = require("../models/photo_model");
const Face = require("../models/face_model");

const createUserPhoto = async (req, res) => {
  let uploadSize = 0;
  const photoFileNames = [];
  const userid = req.user.user_id;
  let insertNewPhotos =
    "INSERT INTO photo (user_id, url, album_id, public, trash, date, diary_id, size, photo_deleted, upload_date, photo_owner_user_id) VALUES ";
  for (let i = 0; i < req.files.length; i += 1) {
    const unixTime = parseInt(req.files[i].key.split(".")[0]);
    const date = moment(unixTime).format("YYYY-MM-DDTHH:mm:ss.SSS");
    const size = req.files[i].size;
    insertNewPhotos += `(${userid}, "${
      req.files[i].location
    }", null, false, false, "${date}", null, ${size}, false, "${
      date.split("T")[0]
    }", ${userid}),`;
    uploadSize += size;
    photoFileNames.push(
      req.files[i].location.split("/")[req.files[i].location.split("/").length - 1]
    );
  }
  insertNewPhotos = insertNewPhotos.replace(/.$/, ";");
  await Photo.insertPhotos(insertNewPhotos);
  const percentage = (uploadSize / 2000000000) * 100; // 2GB up limit per user
  const updateUserStorage = `UPDATE user SET storage = storage + ${percentage} WHERE user_id = ${userid};`;
  await Photo.insertPhotos(updateUserStorage);
  FaceClassification(photoFileNames, userid); // process in brackground
  res.status(200).send("Photos Uploading Completed!");
};

async function FaceClassification (photoFileNames, userid) {
  for (const photoFileName of photoFileNames) {
    const detectFaceResult = await Face.detectFaceExtract(photoFileName);
    if (detectFaceResult.hasFace) {
      let faceId = 1;
      for (const faceBoundingBox of detectFaceResult.faces) {
        let findSimilarFace = false;
        // first need to save to db
        const photoFileNameArr = photoFileName.split(".");
        const detectFaceFileName = photoFileNameArr[0] + `-face${faceId}.` + photoFileNameArr[1];
        await Face.saveCroppedFaceToS3(photoFileName, detectFaceFileName, faceBoundingBox);
        await new Promise(resolve => setTimeout(resolve, 30000)); // wait for 30 sec
        // get all faces first
        const existFaces = await Face.getExistFace(userid);
        for (const existFace of existFaces[0]) {
          const existFaceFileName = existFace.face_url.split("/")[existFace.face_url.split("/").length - 1];
          const existFaceId = existFace.face_id;
          const confidentRate = await Face.findSimilarFaceFromDB(existFaceFileName, detectFaceFileName);
          await new Promise(resolve => setTimeout(resolve, 25000)); // wait for 25 sec
          if (confidentRate === true) {
            // some error from API, skip thie compare result
            findSimilarFace = true;
            break;
          }

          if (confidentRate > 0.78) {
            findSimilarFace = true;
            // find similar face
            // console.log("exist face id: ", existFaceId);
            await Face.updatePhotoIncludeFaceId(photoFileName, existFaceId);
            break;
          }
        }
        if (!findSimilarFace) {
          // new face
          // console.log(insertResult, "new face id: ", insertResult[0].insertId);
          const insertResult = await Face.insertFace(photoFileName, detectFaceFileName, faceBoundingBox, userid);
          await Face.updatePhotoIncludeFaceId(photoFileName, insertResult[0].insertId);
        }
        faceId += 1;
      }
    }
  }
  console.log("Face Table Compare Complete");
}

module.exports = {
  createUserPhoto
};
