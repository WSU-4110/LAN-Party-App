'use strict';

// Imports
const AWS = require("aws-sdk");
const responseUtil = require("../utilities/response");
const shortid = require("shortid");
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

    let body = JSON.parse(request.body); // parse the request

    const s3 = new AWS.S3();
    const fileName = body.fileName;
    const fileType = body.fileType;

    let guid = shortid.generate(); // generate an id for the image

    const params = {
      Bucket: S3_BUCKET,
      Key: fileName + '-' + guid,
      Expires: 500,
      ContentType: fileType,
      ACL: "public-read",
    };

    // make a request to the S3 API to get a signed URL which we can use to upload our file
    let returnData = await s3.getSignedUrl("putObject", params);

    let response = {
      signedRequest: returnData,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName + '-' + guid}`,
    };
    return responseUtil.Build(200, response);
  }
};