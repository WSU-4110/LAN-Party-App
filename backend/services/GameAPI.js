'use strict';

// Imports
const crypto = require("crypto");
const shortid = require("shortid");
const AWS = require("aws-sdk");

// Updating AWS settings
AWS.config.update({ region: "us-east-2" }); // region
let tableName = 'GAMES-LAN'; // the name of our account table in the AWS database

module.exports = {

  // RETURN A GAME //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  Get: async function (ID, AccountInfo) {
  },

  // RETURN ALL GAMES //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  GetAll: async function (ID, AccountInfo) {
  }

};