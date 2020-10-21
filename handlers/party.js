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
    
    //Update the name to make sure it is valid
    request.Name = nameUtil.isValidParty(request.Name);

    if (typeof request.Name === undefined || !request.Name)
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
    if(!events) {
      return responseUtil.Build(204, "Event is empty");
    }

    let request = JSON.parse(events.body);

    //Get the party
    let party = await PartyAPI.Get(request.ID).promise();

    //If the party was not found
    if(party === false){
      return responseUtil.Build(403, "Cannot get party");
    }

    //If the user wants to update the name
    if(request.Name !== undefined){
      //Update the requested name to make it valid
      request.Name = nameUtil.isValidParty(request.Name);
      
      //If the name was rejected, respond by rejecting the name
      if (request.Name === false){
        return responseUtil.Build(403, "Invalid party name");
      }

      //The name was accepted, put it into the party object
      party.Name = request.Name;
    } /*else if (){

    } */ else{ 
      //If there was no request
      return responseUtil.Build(204, 'No request made');
    }
  },

  // GET A PARTY BY AN ID //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  Get: async function (events) {

  },

  // GET ALL OF THE PARTIES //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  GetAll: async function (events) {

  }
};