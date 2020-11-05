'use strict';

// Imports
const responseUtil = require("./response");
const shortid = require("shortid");
const AWS = require("aws-sdk");
const S3_BUCKET = "lan-party-images";

// Updating AWS settings
AWS.config.update({
  region: "us-east-2",
  accessKeyId: process.env.S3_ACCESS_ID,
  secretAccessKey: process.env.S3_ACCESS_SECRET
});

module.exports = {

  // UPLOAD IMAGE //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  Upload: async function (request) {
    try {
      let image = JSON.parse(request.body); // parse the request
      let guid = shortid.generate(); // generate an id for the image
        
      const s3 = new AWS.S3();
      const FileName = image.fileName;
      const FileType = image.fileType;

      const params = {
        Bucket: S3_BUCKET,
        Key: FileName + '-' + guid,
        Expires: 500,
        ContentType: FileType,
        ACL: "public-read",
      };

      // make a request to the S3 API to get a signed URL which we can use to upload our file
      let ReturnData = await s3.getSignedUrl("putObject", params);

      let response = {
        signedRequest: ReturnData,
        url: `https://${S3_BUCKET}.s3.amazonaws.com/${FileName + '-' + guid}`,
      };

      return responseUtil.Build(200, response);
    } catch (err) {
      console.log(err);
      return responseUtil.Build(500, { Message: err.message });
    }
  }
};