const aws = require("aws-sdk");
const responseUtil = require("../utilities/response");
const shortid = require("shortid");

aws.config.update({
  region: "us-east-2",
  accessKeyId: process.env.S3_ACCESS_ID,
  secretAccessKey: process.env.S3_ACCESS_SECRET,
});

const S3_BUCKET = "lan-party-images";

exports.upload = async (req, res) => {
  let body = JSON.parse(req.body);
  console.log("body:", body);

  const s3 = new aws.S3();
  const fileName = body.fileName;
  const fileType = body.fileType;

  let guid = shortid.generate();

  const s3Params = {
    Bucket: S3_BUCKET,
    Key: fileName + '-' + guid,
    Expires: 500,
    ContentType: fileType,
    ACL: "public-read",
  };
  console.log("s3Params:", s3Params);

  // Make a request to the S3 API to get a signed URL which we can use to upload our file
  let returnData = await s3.getSignedUrl("putObject", s3Params);
  console.log("returnData:", returnData);

  let response = {
    signedRequest: returnData,
    url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName + '-' + guid}`,
  };
  console.log("response:", response);

  return responseUtil.Build(200, response);
};