require("dotenv").config();
const { pool } = require("./mysqlcon");

const msRest = require("@azure/ms-rest-js");
const Face = require("@azure/cognitiveservices-face");
const key = process.env.AZURE_FACE_KEY;
const endpoint = process.env.AZURE_FACE_ENDPOINT;
const credentials = new msRest.ApiKeyCredentials({
  inHeader: { "Ocp-Apim-Subscription-Key": key }
});
const client = new Face.FaceClient(credentials, endpoint);

const imageBaseUrl = process.env.S3_BASE_URL;

async function detectFaceExtract (photoFileName) {
  console.log("========DETECT FACES========");
  console.log();

  const imageFileNames = [photoFileName];
  const detectReulst = {
    photoFileName: photoFileName,
    hasFace: false,
    faces: []
  };

  // NOTE await does not work properly in for, forEach, and while loops. Use Array.map and Promise.all instead.
  await Promise.all(
    imageFileNames.map(async function (imageFileName) {
      const detectedFaces = await client.face.detectWithUrl(
        imageBaseUrl + imageFileName,
        {
          returnFaceAttributes: [
            "Accessories",
            "Age",
            "Blur",
            "Emotion",
            "Exposure",
            "FacialHair",
            "Gender",
            "Glasses",
            "Hair",
            "HeadPose",
            "Makeup",
            "Noise",
            "Occlusion",
            "Smile"
          ],
          // We specify detection model 1 because we are retrieving attributes.
          detectionModel: "detection_01"
        }
      );
      console.log(
        detectedFaces.length +
          " face(s) detected from image " +
          imageFileName +
          "."
      );
      //   console.log("Face attributes for face(s) in " + imageFileName + ":");

      // Parse and print all attributes of each detected face.
      detectedFaces.forEach(async function (face) {
        // Get the bounding box of the face
        // console.log(
        //   "Bounding box:\n  Left: " +
        //     face.faceRectangle.left +
        //     "\n  Top: " +
        //     face.faceRectangle.top +
        //     "\n  Width: " +
        //     face.faceRectangle.width +
        //     "\n  Height: " +
        //     face.faceRectangle.height
        // );

        detectReulst.hasFace = true;
        const faceBoundingBox = {
          left: face.faceRectangle.left,
          top: face.faceRectangle.top,
          width: face.faceRectangle.width,
          height: face.faceRectangle.height
        };
        detectReulst.faces.push(faceBoundingBox);

        // Get the accessories of the face
        // const accessories = face.faceAttributes.accessories.join();
        // if (accessories.length === 0) {
        //   console.log("No accessories detected.");
        // } else {
        //   console.log("Accessories: " + accessories);
        // }

        // // Get face other attributes
        // console.log("Age: " + face.faceAttributes.age);
        // console.log("Blur: " + face.faceAttributes.blur.blurLevel);

        // // Get emotion on the face
        // let emotions = "";
        // const emotionThreshold = 0.0;
        // if (face.faceAttributes.emotion.anger > emotionThreshold) {
        //   emotions += "anger, ";
        // }
        // if (face.faceAttributes.emotion.contempt > emotionThreshold) {
        //   emotions += "contempt, ";
        // }
        // if (face.faceAttributes.emotion.disgust > emotionThreshold) {
        //   emotions += "disgust, ";
        // }
        // if (face.faceAttributes.emotion.fear > emotionThreshold) {
        //   emotions += "fear, ";
        // }
        // if (face.faceAttributes.emotion.happiness > emotionThreshold) {
        //   emotions += "happiness, ";
        // }
        // if (face.faceAttributes.emotion.neutral > emotionThreshold) {
        //   emotions += "neutral, ";
        // }
        // if (face.faceAttributes.emotion.sadness > emotionThreshold) {
        //   emotions += "sadness, ";
        // }
        // if (face.faceAttributes.emotion.surprise > emotionThreshold) {
        //   emotions += "surprise, ";
        // }
        // if (emotions.length > 0) {
        //   console.log("Emotions: " + emotions.slice(0, -2));
        // } else {
        //   console.log("No emotions detected.");
        // }

        // // Get more face attributes
        // console.log("Exposure: " + face.faceAttributes.exposure.exposureLevel);
        // if (
        //   face.faceAttributes.facialHair.moustache +
        //     face.faceAttributes.facialHair.beard +
        //     face.faceAttributes.facialHair.sideburns >
        //   0
        // ) {
        //   console.log("FacialHair: Yes");
        // } else {
        //   console.log("FacialHair: No");
        // }
        // console.log("Gender: " + face.faceAttributes.gender);
        // console.log("Glasses: " + face.faceAttributes.glasses);

        // // Get hair color
        // let color = "";
        // if (face.faceAttributes.hair.hairColor.length === 0) {
        //   if (face.faceAttributes.hair.invisible) {
        //     color = "Invisible";
        //   } else {
        //     color = "Bald";
        //   }
        // } else {
        //   color = "Unknown";
        //   let highestConfidence = 0.0;
        //   face.faceAttributes.hair.hairColor.forEach(function (hairColor) {
        //     if (hairColor.confidence > highestConfidence) {
        //       highestConfidence = hairColor.confidence;
        //       color = hairColor.color;
        //     }
        //   });
        // }
        // console.log("Hair: " + color);

        // // Get more attributes
        // console.log("Head pose:");
        // console.log("  Pitch: " + face.faceAttributes.headPose.pitch);
        // console.log("  Roll: " + face.faceAttributes.headPose.roll);
        // console.log("  Yaw: " + face.faceAttributes.headPose.yaw);

        // console.log(
        //   "Makeup: " +
        //     (face.faceAttributes.makeup.eyeMakeup ||
        //     face.faceAttributes.makeup.lipMakeup
        //       ? "Yes"
        //       : "No")
        // );
        // console.log("Noise: " + face.faceAttributes.noise.noiseLevel);

        // console.log("Occlusion:");
        // console.log(
        //   "  Eye occluded: " +
        //     (face.faceAttributes.occlusion.eyeOccluded ? "Yes" : "No")
        // );
        // console.log(
        //   "  Forehead occluded: " +
        //     (face.faceAttributes.occlusion.foreheadOccluded ? "Yes" : "No")
        // );
        // console.log(
        //   "  Mouth occluded: " +
        //     (face.faceAttributes.occlusion.mouthOccluded ? "Yes" : "No")
        // );

        // console.log("Smile: " + face.faceAttributes.smile);
        // console.log();
      });
    })
  );
  return detectReulst;
}

async function DetectFaceRecognize (url) {
  // Detect faces from image URL. Since only recognizing, use the recognition model 4.
  // We use detection model 3 because we are not retrieving attributes.
  const detectedFaces = await client.face.detectWithUrl(url, {
    detectionModel: "detection_03",
    recognitionModel: "recognition_04"
  });
  return detectedFaces;
}

async function findSimilarFaceFromDB (existFaceFileName, detectFaceFileName) {
  try {
    console.log("========FIND SIMILAR========");
    console.log();
    let confidentRate = 0;

    const sourceImageFileName = existFaceFileName;
    const targetImageFileNames = [detectFaceFileName];

    const targetFaceIds = (
      await Promise.all(
        targetImageFileNames.map(async function (targetImageFileName) {
          // Detect faces from target image url.
          const faces = await DetectFaceRecognize(
            imageBaseUrl + targetImageFileName
          );
          console.log(
            faces.length +
              " face(s) detected from image: " +
              targetImageFileName +
              "."
          );
          return faces.map(function (face) {
            return face.faceId;
          });
        })
      )
    ).flat();

    // Detect faces from source image url.
    const detectedFaces = await DetectFaceRecognize(
      imageBaseUrl + sourceImageFileName
    );

    // Find a similar face(s) in the list of IDs. Comapring only the first in list for testing purposes.
    const results = await client.face.findSimilar(detectedFaces[0].faceId, {
      faceIds: targetFaceIds
    });
    results.forEach(function (result) {
      console.log(
        "Faces from: " +
          sourceImageFileName +
          " and ID: " +
          result.faceId +
          " are similar with confidence: " +
          result.confidence +
          "."
      );
      //   console.log(result);
      confidentRate = result.confidence;
    });
    // console.log();
    return confidentRate;
  } catch (error) {
    // console.log(error);
    return true; // mean some error happend
  }
}

async function saveCroppedFaceToS3 (
  photoFileName,
  detectFaceFileName,
  faceBoundingBox
) {
  const aws = require("aws-sdk");
  const s3 = new aws.S3();
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: photoFileName
  };
  s3.getObject(params, function (err, data) {
    if (err) console.log(err, err.stack);
    // an error occurred
    // else console.log(data); // successful response

    // use sharp to crop face then save to s3
    const sharp = require("sharp");
    sharp(data.Body)
      .extract({
        width: faceBoundingBox.width,
        height: faceBoundingBox.height,
        left: faceBoundingBox.left,
        top: faceBoundingBox.top
      })
      .toBuffer(function (err, data) {
        console.log(err);
        s3.putObject(
          {
            Bucket: "cloud-photo-henry/photos",
            Key: detectFaceFileName,
            ACL: "public-read",
            Body: data
          },
          (err, status) => {
            console.log("err:::", err);
            console.log("status:::", status);
            console.log(status);
          }
        );
      });
  });
}

const getExistFace = async (userid) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const getExistFaces = `SELECT * FROM face WHERE user_id = ${userid}`;
    const result = await conn.query(getExistFaces);
    await conn.query("COMMIT");
    return result;
  } catch (error) {
    await conn.query("ROLLBACK");
    return error;
  } finally {
    await conn.release();
  }
};

const insertFace = async (
  photoFileNames,
  detectFaceFileName,
  faceBoundingBox,
  userid
) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const face = {
      photo_url: imageBaseUrl + photoFileNames,
      face_url: imageBaseUrl + detectFaceFileName,
      left: faceBoundingBox.left,
      top: faceBoundingBox.top,
      width: faceBoundingBox.width,
      height: faceBoundingBox.height,
      user_id: userid
    };
    const insertToFaceTable = "INSERT INTO face SET ?;";
    const result = await conn.query(insertToFaceTable, face);
    await conn.query("COMMIT");
    return result;
  } catch (error) {
    await conn.query("ROLLBACK");
    return error;
  } finally {
    await conn.release();
  }
};

const updatePhotoIncludeFaceId = async (photoFileName, existFaceId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const photoURL = imageBaseUrl + photoFileName;
    const updateUserStorage = `UPDATE photo SET include_face_id = CONCAT(include_face_id, "${existFaceId} ") WHERE url = "${photoURL}"`;
    const result = await conn.query(updateUserStorage);
    await conn.query("COMMIT");
    return result;
  } catch (error) {
    await conn.query("ROLLBACK");
    return error;
  } finally {
    await conn.release();
  }
};

const getFaces = async (sql) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const photos = await conn.query(sql);
    await conn.query("COMMIT");
    return photos[0];
  } catch (error) {
    await conn.query("ROLLBACK");
    return error;
  } finally {
    await conn.release();
  }
};

const getPhotosDetails = async (sql) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const photos = await conn.query(sql);
    await conn.query("COMMIT");
    return photos[0];
  } catch (error) {
    await conn.query("ROLLBACK");
    return error;
  } finally {
    await conn.release();
  }
};

module.exports = {
  detectFaceExtract,
  findSimilarFaceFromDB,
  saveCroppedFaceToS3,
  getExistFace,
  insertFace,
  updatePhotoIncludeFaceId,
  getFaces,
  getPhotosDetails
};
