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


    let request = {
      body: events.body,
      ID: events.pathParameters.ID
    }

    console.log(request.body);
    //A string for the updates
    let updateExpression = 'set ';

    let curExpressions = [];
    

    //Check if the name is exists
    if(request.body.Name !== undefined){
      //Update the name to make sure it's valid
      request.body.Name = nameUtil.isValidParty(request.body.Name);

      //Check if the name is valid 
      if(request.body.Name === false){
        responseUtil.Build(403, "Party name not valid");
      }

      //Update the expressions
      curExpressions = curExpressions.concat('Name = :n');
    }

    // ensure that the party has a location
    if (typeof request.body.Location !== undefined 
      && request.body.Location !== ""){
      //Update the expressions
      curExpressions = curExpressions.concat('Location = :l')
    }

    /*
    // ensure that there is a host
    if (typeof request.body.Host !== undefined){
      // check that the host exists
      let test = await AccountAPI.Get(request.body.Host);
      if (!test){
        return responseUtil.Build(403, "Host doesn't exist!");
      }
  
      //Update the expressions
      updateExpression = updateExpression + ' Host = :h'
    }
    */

    //Check times
    if (typeof request.body.Time !== undefined){
      //Update the expressions
      curExpressions = curExpressions.concat('Time = :t')
    }

    //Check attendees
    if (typeof request.body.Attendees !== undefined){
      //Update the expressions
      curExpressions = curExpressions.concat('Attendees = :a')
    }

    
    curExpressions = curExpressions.join(', ');
    console.log(curExpressions)
    
    let response = await PartyAPI.Update(request.ID, updateExpression, request.body);

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
    //Ensure that the event is not empty
    if (!events){
      return responseUtil.Build(204, 'No request made');
    }

    let response = PartyAPI.GetAll();

    response.Message = 'Parties retrieved!';

    return responseUtil.Build(200, response);
  }
};