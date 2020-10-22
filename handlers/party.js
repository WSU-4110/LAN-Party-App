'use strict';

// Imports
const PartyAPI = require("../services/PartyAPI");
const AccountAPI = require("../services/AccountAPI");
const responseUtil = require("../utilities/response");
const nameUtil = require("../utilities/nameCheck");
const shortid = require("shortid");
const moment = require("moment-timezone");

module.exports = {

  // CREATE //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  Create: async function (events) {
    // ensure that there was information in the event
    if(!events)
      return responseUtil.Build(204, "Event is empty");

    let request = JSON.parse(events.body);
    
    //Must have a name
    if (typeof request.Name === undefined)
      return responseUtil.Build(403, "Party must have a name");

    //Update the name to make sure it is valid
    request.Name = nameUtil.isValidParty(request.Name);

    if(request.Name === false){
      return responseUtil.Build(403, "Party name not valid");
    }

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
    //Check if the event exists
    if(!events){
      return responseUtil.Build(204, 'event is empty');
    }

    let request = JSON.parse(events.body);

    //Check if the name is exists
    if(request.Name === undefined){
      return responseUtil.Build(403, "Party must have a name");
    }

    //Update the name to make sure it's valid
    request.Name = nameUtil.isValidParty(request.Name);

    //Check if the name is valid 
    if(request.Name === false){
      responseUtil.Build(403, "Party name not valid");
    }

    // ensure that the party has a location
    if (typeof request.Location === undefined || request.Location === "")
    return responseUtil.Build(403, "Party must have a location");
 
    // ensure that there is a host
    if (typeof request.Host === undefined)
      return responseUtil.Build(403, "Please send a host ID!");

    // check that the host exists
    if (!AccountAPI.Get(request.Host))
      return responseUtil.Build(403, "Host doesn't exist!");

    let response = await PartyAPI.Update(request);

    response.Message = "Party Created!";
    return responseUtil.Build(200, response);
  },

  // GET A PARTY BY AN ID //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  Get: async function (events) {

  },

  // GET ALL OF THE PARTIES //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  GetAll: async function (events) {

  }
};