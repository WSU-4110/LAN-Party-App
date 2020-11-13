'use strict';

const AWS = require("aws-sdk");

// Export the module to import and use globaly in other endpoints/lambdas // 
module.exports = {

  Connection: async function (req) {
    const dynamoDB = new AWS.DynamoDB.DocumentClient();

    const pool = dynamoDB.createPool({
        host: {process.env.HOST},
        user: {process.env.USERNAME},
        password: {process.env.PASSWORD},
        database: {process.env.DATABASE},
    });

    let query = "";
    return new Promise(function(resolve, reject){
      return resolve({
        statusCode: 200,
        body: "Success"
      });
    })
  }
};