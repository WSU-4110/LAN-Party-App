'use strict';

// Imports
const crypto = require("crypto");
const shortid = require("shortid");
const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");

// Updating AWS settings
AWS.config.update({ region: "us-east-2" }); // region
let tableName = 'USERS-LAN'; // the name of our account table in the AWS database

module.exports = {

  // Save A New Account //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  Save: async function (ID, AccountInfo) {   
    try { 
      let dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" }); // connect to the database
      let NewAccount = AccountInfo;

      if (ID)
        NewAccount.ID = ID;

      else {
        NewAccount.ID = shortid.generate(); // make a new ID
        const hash = crypto.createHmac("sha256", NewAccount.ID).update(NewAccount.Password).digest("hex"); // create a hash for the password
        NewAccount.Password = hash; // assign the has to the password
      }

      // we will be sending this file to the database
      const parameters = {
        TableName: tableName,
        Item: NewAccount,
      };

      await dynamoDB.put(parameters).promise(); // add the user to the database

      return NewAccount; // return this account as we leave

    } catch (err) {
      console.error("Account Save Error:", err.message);
      throw new Error("Account Save Error");
    }
  },

  // Get An Account By Their Email //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  GetByEmail: async function (Email) {
    try {
      let dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" }); // connect to the database

      // create the parameters for the query
      let params = {
        TableName: tableName,
        IndexName: "Email",
        KeyConditionExpression: "#key = :em",
        ExpressionAttributeNames: {
          "#key": "Email",
        },
        ExpressionAttributeValues: {
          ":em": Email,
        },
      };

      let result = await dynamoDB.query(params).promise(); // query the database

      // return the result of the query
      if (result.Items[0]) {
        let account = result.Items[0];
        return account;
      } else false;
    } catch (err) {
      console.error("Account Email Error:", err);
      throw new Error(err.message);
    }
  },

  // Authenticate The Account By An Email And Password  /////////////////////////////////////////////////////////////////////////////////////////////
  
  AuthByEmailPassword: async function (Email, Password) {
    try {
      let dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" }); // connect to the database

      // create the parameters for the query
      let params = {
        TableName: tableName,
        IndexName: "Email",
        KeyConditionExpression: "#key = :em",
        ExpressionAttributeNames: {
          "#key": "Email",
        },
        ExpressionAttributeValues: {
          ":em": Email,
        },
      };

      let result = await dynamoDB.query(params).promise(); // query the database

      if (result.Items[0]) {
        let account = result.Items[0];
        const hash = crypto
          .createHmac("sha256", account.ID)
          .update(Password)
          .digest("hex");

        if (hash === account.Password) {
          return account; // password matches!
        } else throw new Error("Invalid password!");
      } else throw new Error("No account found.");
    } catch (err) {
      console.error("Account Auth 1 Error:", err);
      throw new Error(err.message);
    }
  }
};