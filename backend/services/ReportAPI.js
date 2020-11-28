'use strict';

// Imports
const AWS = require("aws-sdk");

// Updating AWS settings
AWS.config.update({ region: "us-east-2" }); // region
const tableName = 'REPORTS-LAN'; // the name of our game table in the AWS database

module.exports = {

  // CREATE A NEW REPORT //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  Create: async function (ReportInfo) {   
    try { 
      let dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" }); // connect to the database

      // we will be sending this file to the database
      const parameters = {
        TableName: tableName,
        Item: ReportInfo,
      };

      let NewReport = await dynamoDB.put(parameters).promise(); // add the user to the database
      return NewReport; // return this account as we leave
    } catch (err) {
      console.log(err);
      throw new Error("Report Create Error");
    }
  },
  
  // GET REPORT BY ID //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  Get: async function (ID) {
    try {
      let dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" }); // connect to the database

      // create the parameters for the query
      let params = {
        TableName: tableName,
        Key: { ID: ID },
      };

      let result = await dynamoDB.get(params).promise(); // grab the user

      if (result.Item) return result.Item;
      else return false;
    } catch (err) {
      console.log(err.message);
      throw new Error("Get Report Error");
    }
  },

  // RETURN ALL REPORTS //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  GetAll: async function () {
    try {
      let dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" }); // connect to the database
      let results = await dynamoDB.scan({ TableName: tableName }).promise(); // grab the users

      if (results) return results;
      else throw new Error("No Reports Found!");
    } catch (err) {
      console.log(err.message);
      throw new Error("Report GetAll Error");
    }
  }
};