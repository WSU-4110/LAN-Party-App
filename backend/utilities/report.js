'use strict';

// Imports
const shortid = require("shortid");
const AWS = require("aws-sdk");
const AccountAPI = require("../services/AccountAPI");
const moment = require("moment-timezone");
const responseUtil = require("../utilities/response");
const crypto = require("crypto");

// Updating AWS settings
AWS.config.update({ region: "us-east-2" }); // region
const tableName = 'REPORTS-LAN'; // the name of our account table in the AWS database

module.exports = {

  // REPORT A NEW ACCOUNT //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  NewReport: async function (event) {
    try {
      // if nothing was provided in the request, return a 204 HTTPS code (No content)
      if (!event)
        return responseUtil.Build(204, { Message: "No information was provided with the request!" });

      // next parse the request
      let request = JSON.parse(event.body);

      // they need to have entered an email, username, and a password
      if (!request.ReportedAccountID)
        throw new Error("Must include the ID of the account to be reported!");

      if (!request.AccuserID)
        throw new Error("Must include the ID of the account who is making the report!");

      // let's have a create date for our new report as well as an ID for the report
      request.CreateDate = moment().toISOString();
      request.ID = shortid.generate();

      // check to make sure that this ID is not already used
      while(Get(request.ID))
        request.ID = shortid.generate();

      // validate that both accounts exist
      let exists = await AccountAPI.Get(request.ReportedAccountID);
      if (!exists)
        throw new Error("Invalid ID for the user making the report!");

      let exists2 = await AccountAPI.Get(request.AccuserID);
      if(!exists2)
        throw new Error("Invalid ID for the reported user!");

      // save to the database
      let dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" }); // connect to the database

      const parameters = {
        TableName: tableName,
        Item: request,
      };

      let NewReport = await dynamoDB.put(parameters).promise();

      let result = {
        Message: "Report created!",
        Report: NewReport
      };

      return responseUtil.Build(200, result);
    } catch (err) {
      console.log(err);
      return responseUtil.Build(500, { Message: err.message });
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
  }
};