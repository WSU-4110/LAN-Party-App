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
    if (!request.hasOwnProperty("PartyName"))
      return responseUtil.Build(403, "Party must have a name");

    //Update the name to make sure it is valid
    request.PartyName = nameUtil.isValidParty(request.PartyName);

    if(request.PartyName === false){
      return responseUtil.Build(403, "Party name not valid");
    }

    // ensure that the party has a location
    if (!request.hasOwnProperty("PartyLocation") 
    || request.PartyLocation === "")
      return responseUtil.Build(403, "Party must have a location");

    // add a time that the party was created
    request.CreateDate = moment().toISOString();

    // ensure that there is a host
    if (!request.hasOwnProperty("Host"))
      return responseUtil.Build(403, "Please send a host ID!");

    // check that the host exists
    try {
      request.HostUsername = await AccountAPI.Get(request.Host);
      request.HostUsername = request.HostUsername.Username;
    } catch (err){
      return responseUtil.Build(403, "Host ID invalid");
    }
    
    //If there was no intent attached, assume casual
    if(!request.hasOwnProperty("Intent")){
      request.Intent = "Casual";
    }

    //If there were games attached, add them. Otherwise, make the list blank
    if(!request.hasOwnProperty("Games")){
      request.Games = [];
    }

    request.Attendees = [{
      ID: Host,
      Username: HostUsername
    }];

    

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


    let request = JSON.parse(events.body)
      request.ID = events.pathParameters.ID;
    

    let party = await PartyAPI.Get(request.ID);

    if (!party){
      return responseUtil.Build(403, "Party ID not valid");
    }

    console.log(request);
    //A string for the updates
    let updateExpression = 'set ';

    let curExpressions = [];
    
    let updateValues = {};

    //Check if the name is exists
    if(request.hasOwnProperty('PartyName')){
      //Update the name to make sure it's valid
      request.PartyName = nameUtil.isValidParty(request.PartyName);

      //Check if the name is valid 
      if(request.PartyName === false){
        responseUtil.Build(403, "Party name not valid");
      }

      //Update the expressions
      curExpressions = curExpressions.concat('PartyName = :n');
      updateValues[':n'] = request.PartyName;
    }

    // ensure that the party has a location
    if (request.hasOwnProperty('PartyLocation')
      && request.PartyLocation !== ""){
        
      //Update the expressions
      curExpressions = curExpressions.concat('PartyLocation = :l')
      updateValues[':l'] = request.PartyLocation;
    }

    // ensure that there is a host
    if (request.hasOwnProperty('Host')){
      // check that the host exists
      try {
        request.HostUsername = await AccountAPI.Get(request.Host);
        request.HostUsername = request.HostUsername.Username
      } catch (err){
        return responseUtil.Build(403, "Host doesn't exist!");
      }
  
      //Update the expressions
      curExpressions = curExpressions.concat('Host = :h, HostUsername = :u')
      updateValues[':h'] = request.Host;
      updateValues[':u'] = request.HostUsername;
    }
    

    //Check times
    if (request.hasOwnProperty('PartyTime')){
      //Update the expressions
      curExpressions = curExpressions.concat('PartyTime = :t')
      updateValues[':t'] = request.PartyTime;
    }

    //Check attendees
    if (request.hasOwnProperty('Attendees')){
      //Update the expressions
      curExpressions = curExpressions.concat('Attendees = :a')
      updateValues[':a'] = request.Attendees;
    }

    //Check for hardware requirements
    if (request.hasOwnProperty('HardwareRequirements')){
      curExpressions = curExpressions.concat('HardwareRequirements = :r')
      updateValues[':r'] = request.HardwareRequirements;
    }

    //Check for ageGate
    if(request.hasOwnProperty('AgeGate')){
      curExpressions = curExpressions.concat('AgeGate = :g');
      updateValues[':g'] = request.AgeGate;
    }
    
    //Check for games
    if(request.hasOwnProperty('Games')){
      curExpressions = curExpressions.concat('Games = :m');
      updateValues[':m'] = request.Games;
    }

    //Check for intent
    if(request.hasOwnProperty('Intent')){
      curExpressions = curExpressions.concat('Intent = :i');
      updateValues[':i'] = request.Intent;
    }

    curExpressions = curExpressions.join(', ');
    updateExpression = updateExpression.concat(curExpressions);
    
    let response = await PartyAPI.Update(request.ID, updateValues, updateExpression);

    if(!response){
      return responseUtil.Build(403, 'Party creation failed ');
    } else {
      response.Message = "Party Created";
      return responseUtil.Build(200, response);
    }
  },

  // GET A PARTY BY AN ID //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  Get: async function (events) {
    //Ensure that the event is valid 
    if(!events){
      return responseUtil.Build(204, "Must send requested information");
    }
    
    //Set the request equal to the event body
    let request = {
      ID: events.pathParameters.ID
    }

    if(!request.ID){
      return responseUtil.Build(204, "Must provide ID");
    }
    
    console.log(request.ID);

    let party = await PartyAPI.Get(request.ID);

    //If the party wasn't found
    if(!party){
      return responseUtil.Build(500, {
        Message: "Party not found",
        Party: party
      });
    } else {
      
      let response = {
        Message: "Party found!",
        Party: party
      }
      return responseUtil.Build(200, response);
    }

    //
  },

  // GET ALL OF THE PARTIES //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  GetAll: async function (events) {
    try {
      //If the event is not empty
      if (events){
        let parties = await PartyAPI.GetAll();

        let result = {
          Message: "Parties retrieved",
          Parties: parties
        }
        return responseUtil.Build(200, result);
      }
      return responseUtil.Build(204, 'No request made');
    } catch (error) {
      return responseUtil.Build(500, { Message: error.Message });
    }
  }
}