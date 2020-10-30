'use strict';

// Imports
const shortid = require("shortid");
const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");
const { Get } = require("./AccountAPI");
const response = require("../utilities/response");

// Updating AWS settings
AWS.config.update({ region: "us-east-2" }); // region
let tableName = 'P-LAN'; // the name of our account table in the AWS database

module.exports = {

  // SAVE A PARTY //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  Save: async function (ID, PartyInfo) {
    try {
        let dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" }); // connect to the database
        let newParty = PartyInfo;

        // ensure that the party has an ID
        if(!ID){
            ID = shortid.generate();
        }
        newParty.ID = ID;

        // create the parameters for putting into the table
        let params = {
            TableName: tableName,
            Item: newParty
        };

        // put it into the table
        await dynamoDB.put(params).promise();

        // return the party that was inserted.
        return newParty;
    } catch (err) { 
        console.log(err);
        throw err;
    }
  },

  Get: async function(ID) {
    try{
      // connect to the database
      let dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" }); 

      let request = ID;
  
      // create the parameters for the query
      let params = {
        TableName: tableName,
        Key: { ID: request }
      };

      console.log(params.Key.ID);
      //Try to get the party from the table
      let result = await dynamoDB.get(params).promise();
      
      return result ? result.Item : false;

    } catch(err){
      console.log('Party get error:', err);
      return false;
    }
  },
  
  Update: async function(ID, Values, updateExpression){
    try{
      let dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" }); 

      console.log(Values);
      //Load the parameters into the object
      let params = {
        TableName: tableName,
        Key: {ID: ID},
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: Values,
        ReturnValues:"UPDATED_NEW"
      }
      console.log(params);

      let response = await dynamoDB.update(params).promise();
      
      console.log(response);

      return response ? response : false;
    } catch(err) {
      console.log('There was an error: ', err);
      return false;
    }
  },

  GetAll: async function(){
    try {
      // connect to the database
      let dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" }); 

      // SCAN THE TABLE FOR THE PARTY OBJS
      let results = await dynamoDB.scan({ TableName:tableName }).promise();
      let parties = results.Items;

      // IF parties IS NOT AN ARRAY, MAKE IT AN EMPTY ARRAY
      if (!Array.isArray(parties))
        parties = [];
      
      return parties;
    } catch (error) {
      console.error("Get All Parties Error", error);
      throw new Error("Get All Parties Error");
    }

  }
};