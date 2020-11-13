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

    //Create prototype party
    let required = ['PartyName', 'PartyLocation', 'Host']
    
    for (const key in required){
      if(!request.hasOwnProperty(key)){
        return responseUtil.Build(403, 'Missing attribute: ' + key);
      }
    }

    let defaults = {
      Intent: 'casual',
      Games: []
    }

    for (const key in Object.keys(defaults)){
      if(!request.hasOwnProperty(key)){
        request[key] = defaults[key];
      }
    }

    //Update the name to make sure it is valid
    request.PartyName = nameUtil.isValidParty(request.PartyName);

    if(request.PartyName === false){
      return responseUtil.Build(403, "Party name not valid");
    }

    // ensure that the party has a location
    if (request.PartyLocation === "")
      return responseUtil.Build(403, "Party must have a location");

    // add a time that the party was created
    request.CreateDate = moment().toISOString();

    // check that the host exists
    try {
      request.HostUsername = await AccountAPI.Get(request.Host);
      request.HostUsername = request.HostUsername.Username;
    } catch (err){
      return responseUtil.Build(403, "Host ID invalid");
    }

    request.Attendees = [{
      ID: request.Host,
      Username: request.HostUsername
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
      //Check if we're adding users
      if(request.Attendees.hasOwnProperty('Add')){
        //Make sure that the account exists
        try {
          var newAttendee = await AccountAPI.Get(request.Attendees.Add);
          if (newAttendee === false){
            return responseUtil.Build(403, "New attendee does not exist");
          }
        } catch (err) {
          return responseUtil.Build(403, "New attendee could not be found");
        }

        let saveItem = {
          Username : newAttendee.Username,
          ID : newAttendee.ID
        }
        
        //Insert it into the list
        if(!party.hasOwnProperty('Attendees') || party.Attendees.length === 0){
          party.Attendees = [saveItem];
        }

        //Check that it isn't in the list already
        else if(party.Attendees.findIndex(attendee => attendee.ID === saveItem.ID) !== -1){
          console.log(party.Attendees.findIndex(attendee => attendee.ID === saveItem.ID));
          return responseUtil.Build(403, "Attendee already registered");
        }

        //Check that they aren't the new highest member
        else if(party.Attendees[party.Attendees.length - 1].ID < saveItem.ID){
          console.log(party.Attendees.findIndex(attendee => attendee.ID === saveItem.ID));
          party.Attendees.push(saveItem);
        } 

        else {
          console.log(party.Attendees.findIndex(attendee => attendee.ID === saveItem.ID));
          try{
            let i = 0; 
            while (party.Attendees[i].ID > saveItem.ID){
              console.log(i + ' | ' + party.Attendees[i]);
              i++
            }

            party.Attendees.splice(i, 0, saveItem);
          } catch(err){
            party.Attendees.push(saveItem);
          }
        }

      }
      
      //If there was a remove
      if(request.Attendees.hasOwnProperty("Remove")){
        //Check if the ID is present in the array
        let i = party.Attendees.findIndex(attendee => attendee.ID === request.Attendees.Remove);

        if(typeof i === -1){
          return responseUtil.Build(403, "User not in party already");
        } else {
          party.Attendees.splice(i, 1);
        }
      }


      //Update the expressions
      curExpressions = curExpressions.concat('Attendees = :a')
      updateValues[':a'] = party.Attendees;
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