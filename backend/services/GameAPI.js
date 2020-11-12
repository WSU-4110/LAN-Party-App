'use strict';

// Imports
const shortid = require("shortid");
const AWS = require("aws-sdk");

// Updating AWS settings
AWS.config.update({ region: "us-east-2" }); // region
const tableName = 'GAMES-LAN'; // the name of our game table in the AWS database

module.exports = {

  // CREATE A NEW GAME //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  Create: async function (ID, GameInfo) {   
    try { 
      let dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" }); // connect to the database
      let NewGame = GameInfo;

      if (ID)
        NewGame.ID = ID;
      else
        NewGame.ID = shortid.generate(); // make a new ID

      // we will be sending this file to the database
      const parameters = {
        TableName: tableName,
        Item: NewGame,
      };

      await dynamoDB.put(parameters).promise(); // add the user to the database
      return NewGame; // return this account as we leave
    } catch (err) {
      console.log(err);
      throw new Error("Game Create Error");
    }
  },

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

  // GET A GAME BY AN EMAIL //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  GetByName: async function (Name) {
    try {
      let dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" }); // connect to the database

      // create the parameters for the query
      let params = {
        TableName: tableName,
        IndexName: "Name",
        KeyConditionExpression: "#key = :n",
        ExpressionAttributeNames: {
          "#key": "Name",
        },
        ExpressionAttributeValues: {
          ":n": Name,
        },
      };

      let result = await dynamoDB.query(params).promise(); // query the database

      // return the result of the query
      if (result.Items[0]) {
        let game = result.Items[0];
        return game;
      } else false;
    } catch (err) {
      console.log(err.message);
      throw new Error("Get Game By Name Error");
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