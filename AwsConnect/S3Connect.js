var {AWSKey}=require("../Keys1/Security")
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

aws.config.update({
  secretAccessKey: AWSKey.AWSSecretKey,
  accessKeyId:AWSKey.AWSAccessKeyId,
  region: "ap-south-1"
});

const s3 = new aws.S3();



module.exports.upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: "myaudiojam",
      acl: "public-read",
      metadata: function(req, file, cb) {
        cb(null, { fieldName: "TESTING_METADATA" });
      },
      key: function(req, file, cb) {
        cb(null, "Video/" + Date.now().toString());
      }
    })
  });