'use strict';

// Imports
const crypto = require("crypto");
const shortid = require("shortid");
const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");
const { exception } = require("console");

// Updating AWS settings
AWS.config.update({ region: "us-east-2" }); // region
const tableName = 'USERS-LAN'; // the name of our account table in the AWS database

module.exports = {

  // SAVE A NEW ACOUNT //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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

  // GET AN ACCOUNT BY AN EMAIL //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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

  // GET AN ACCOUNT BY AN ID //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
      else throw new exception;
    } catch (err) {
      console.error("Account Get Error:", err);
      throw err;
    }
  },

  // GET ALL ACCOUNTS //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  GetAll: async function () {
    try {
      let dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" }); // connect to the database
      let results = await dynamoDB.scan({ TableName: tableName }).promise(); // grab the users

      if (results) return results;
      else throw new Error("No Accounts Found!");
    } catch (err) {
      console.error("Account GetAll Error:", err);
      throw new Error("Account GetAll Error");
    }
  },

  // AUTHENTICATE THE ACCOUNT USING AN EMAIL AND A PASSWORD /////////////////////////////////////////////////////////////////////////////////////////////
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
  },
  
  
  Update: async function (ID, Values, updateExpression) {
    try {
      let dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" }); // connect to the database

      // create the parameters for the update
      let params = {
        TableName: tableName,
        Key: {ID: ID},
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: Values,
        ReturnValues:"UPDATED_NEW"
      };

      let result = await dynamoDB.update(params).promise(); // update the entry in the database
      
      return result ? result : false;
    } catch (err) {
      console.log(err.message);
      throw new Error("Account Update Error");
    }
  }
};