'use strict';

// Imports
const shortid = require("shortid");
const AWS = require("aws-sdk");

// Updating AWS settings
AWS.config.update({
  region: "us-east-2",
  accessKeyId: process.env.S3_ACCESS_ID,
  secretAccessKey: process.env.S3_ACCESS_SECRET
});

const S3_BUCKET = "lan-party-images";

module.exports = {

  // SAVE IMAGE //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  Save: async function (image) {
    try {
      let ImageID = shortid.generate(); // generate an id for the image
      
      const s3 = new AWS.S3();
      const FileName = image.fileName;
      const FileType = image.fileType;

      const params = {
        Bucket: S3_BUCKET,
        Key: FileName + '-' + ImageID,
        Expires: 500,
        ContentType: FileType,
        ACL: "public-read",
      };

      // make a request to the S3 API to get a signed URL which we can use to upload our file
      let ReturnData = await s3.getSignedUrl("putObject", params);

      let response = {
        SignedRequest: ReturnData,
        URL: `https://${S3_BUCKET}.s3.amazonaws.com/${FileName + '-' + ImageID}`,
      };

      return responseUtil.Build(200, response);
    } catch (err) {
      throw new Error("Account Save Error");
    }
  },
  
  // Update Bucket //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  Update: async function (ID, AccountInfo) {
  }
};