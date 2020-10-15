'use strict';

// Imports
const shortid = require("shortid");
const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");

// Updating AWS settings
AWS.config.update({ region: "us-east-2" }); // region
let tableName = 'PARTIES-LAN'; // the name of our account table in the AWS database

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
  }
};