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

  // X //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  X: async function (ID, AccountInfo) {
  }
};