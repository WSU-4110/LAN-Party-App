'use strict';

// Imports
const shortid = require("shortid");
const AWS = require("aws-sdk");

// Updating AWS settings
AWS.config.update({ region: "us-east-2" }); // region
const tableName = 'GAMES-LAN'; // the name of our game table in the AWS database

module.exports = {

  // RETURN A GAME BY ID //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  Get: async function (ID) {
    try {
      let dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" }); // connect to the database

      // create the parameters for the query
      let params = {
        TableName: tableName,
        Key: { ID: ID },
      };

      let result = await dynamoDB.get(params).promise(); // grab the game

      if (result.Item) return result.Item;
      else return false;
    } catch (err) {
      console.log(err.message);
      throw new Error("Get Game Error");
    }
  },

  // RETURN ALL GAMES //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  GetAll: async function () {
    try {
      let dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" }); // connect to the database
      let results = await dynamoDB.scan({ TableName: tableName }).promise(); // grab the users

      if (results) return results;
      else throw new Error("No Games Found!");
    } catch (err) {
      console.log(err.message);
      throw new Error("Game GetAll Error");
    }
  }

};