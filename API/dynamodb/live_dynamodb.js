const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

//Export the module to import and use globaly in other endpoints/lambdas // 
module.exports = dynamoDB;