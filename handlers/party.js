'use strict';

// Imports
const PartyAPI = require("../services/PartyAPI");
const AccountAPI = require("../services/AccountAPI");
const responseUtil = require("../utilities/response");
const shortid = require("shortid");
const moment = require("moment-timezone");

module.exports = {

  // CREATE //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  Create: async function (event) {
    // ensure that there was information in the event
    if(!event)
      return responseUtil.Build(204, "Event is empty");

    let request = JSON.parse(event.body);
    
    // a party's name is valid if it has a number or letter
    const nameChars = /\w/;

    if (typeof request.Name === undefined || !nameChars.test(request.Name))
      return responseUtil.Build(403, "Party must have a name with letters or numbers");

    // ensure that the party has a location
    if (typeof request.Location === undefined || request.Location === "")
      return responseUtil.Build(403, "Party must have a location");

    // add a time that the party was created
    request.CreateDate = moment().toISOString();

    // ensure that there is a host
    if (typeof request.Host === undefined)
      return responseUtil.Build(403, "Please send a host ID!");

    // check that the host exists
    if (!AccountAPI.Get(request.Host))
      return responseUtil.Build(403, "Host doesn't exist!");
    
    let response = await PartyAPI.Save(shortid.generate(), request);

    response.Message = "Party Created!";
    return responseUtil.Build(200, response);
  },

  // UPDATE A PARTY //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  Update: async function (events) {

  },

  // GET A PARTY BY AN ID //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  Get: async function (events) {

  },

  // GET ALL OF THE PARTIES //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  GetAll: async function (events) {

  }
};