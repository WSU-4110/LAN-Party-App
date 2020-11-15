'use strict';

// Imports
const PartyAPI = require("../services/PartyAPI");
const AccountAPI = require("../services/AccountAPI");
const responseUtil = require("../utilities/response");
const PartyUtil = require("../utilities/PartyCheck");
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
    const required = ['PartyName', 'PartyLocation', 'Host', 'PartyTime'];
    
    let badKey = false;

    //If it's missing a required key, store which one it is and call return false
    required.forEach(async function (key){
      if(!request.hasOwnProperty(key)){
        badKey = "Missing Key: " + key;
      } else {
        let objVal = await PartyUtil.validPartyKeys(key, request[key]);
        if(objVal.isValid === false){
          badKey = "Key value not valid: " + key + "   " + request[key];
        }

        else {
          if(key === 'Host'){
            request.HostUsername = objVal.value.HostUsername; 
          } else {
            request[key] = objVal.value;
          }
        }
      }
    });

    if (badKey !== false){
      return responseUtil.Build(403, badKey);
    }

    const defaults = {
      Intent: 'Casual',
      Games: [],
      AgeGate: false
    }

    Object.keys(defaults).forEach((key) =>{
      if(!request.hasOwnProperty(key)){
        request[key] = defaults[key];
      }
    });

    // add a time that the party was created
    request.CreateDate = moment().toISOString();

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
      request.PartyName = PartyUtil.isValidParty(request.PartyName);

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
        
        //If the new attendee is currently in the invites, take them out
        if(party.hasOwnProperty('Invited')){
          let locOfInvite = party.Invited.findIndex(attendee => attendee.ID === newAttendee.ID);
          if(locOfInvite !== -1){
            party.Invited.splice(locOfInvite, 1);
    
            curExpressions.push('Invited = :z')
            updateValues[':z'] = party.Invited;
          }
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

        if(i === -1){
          return responseUtil.Build(403, "User not in party already");
        } else {
          party.Attendees.splice(i, 1);
        }
      }


      //Update the expressions
      curExpressions = curExpressions.concat('Attendees = :a')
      updateValues[':a'] = party.Attendees;
    }

    //If the LocChange has been removed or loc has been changed
    if(request.hasOwnProperty('RequestLocationChange') || 
        updateValues.hasOwnProperty(':l')){
          curExpressions.push('RequestLocationChange = :x');
          updateValues[':x'] = null;
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

  // INVITE USER TO PARTY //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  Invite: async function(events){
    if(!events){
      return responseUtil.Build(204, "Events is empty");
    }

    let request = JSON.parse(events.body);
    request.ID = events.pathParameters.ID;

    //Check that we have a userID in the event
    if(!request.hasOwnProperty('ID')){
      return responseUtil.Build(204, "No user ID provided")
    }
    
    let user

    try{
      user = await AccountAPI.Get(request.User);
        if(user === false){
          return responseUtil.Build(403, "User ID not valid");
        }
    } catch (err){
      return responseUtil.Build(403, "User ID not valid");
    }

    let party = await PartyAPI.Get(request.ID);

    if (party === false){
      return responseUtil.Build(403, "Party ID not valid");
    }

    

    //Check that the user isn't in the party
    if(party.Attendees.findIndex(attendee => attendee.ID ===user.ID) !== -1){
      return responseUtil.Build(403, "User already in party");
    }

    //Create an item to save in the list
    let saveItem = {
      ID: user.ID,
      Username: user.Username
    }

    //If there is no invite list, create one
    if(!party.hasOwnProperty('Invited') || party.Invited.length === 0){
      party.Invited = [saveItem];
    } else {
      try {
        let i = 0;
        while(party.Invited[i].ID > saveItem.ID){
          i++;
        }
        if(party.Invited[i].ID === saveItem.ID){
          return responseUtil.Build(403, "User already invited");
        } else {
          party.Invited.splice(i, 0, saveItem);
        }
      } catch (err){
        party.Invited.push(saveItem);
      }
    }

    //Create the save expressions
    let expression = 'Set Invited = :I'
    let values = {
      ':I': party.Invited
    };

    try{
      //Try to save the item
      let response = await PartyAPI.Update(request.ID, values, expression);
      if (response !== false){
        //Set the save item to include values of party ID and Name
        saveItem = {
          ID: party.ID,
          PartyName: party.PartyName
        }

        //Check if the invites exist on the user
        if(!user.hasOwnProperty('Invites') || user.Invites.length === 0){
          user.Invites = [saveItem];
        } else {
          //Append it to the front
          user.Invites.unshift(saveItem);
        }

        expression = 'Set Invites = :I'
        values = {
          ':I': user.Invites
        }

        try{
          response = await AccountAPI.Update(user.ID, values, expression);
          if(response !== false){
            response.Message = 'Invite successful'
            return responseUtil.Build(200, response);
          } else {
            return responseUtil.Build(403, "Could not add party to user invites")
          }
        } catch (err) {
          return responseUtil.Build(403, "Could not add party to user invites")
        }
      } else {
        return responseUtil.Build(403, 'Could not invite to party');
      }
    } catch (err) {
      return responseUtil.Build(403, err);
    }
    
  },

  // REQUEST LOCATION CHANGE //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  RequestLocationChange: async function (events){
    if(!events){
      return responseUtil.Build(204, "Events is empty");
    }

    let request = JSON.parse(events.body)
    request.ID = events.pathParameters.ID;

    //Retrieve the party
    let party = await PartyAPI.Get(request.ID);
    
    if(party === false) {
      return responseUtil.Build(403, 'Party ID not valid');
    }

    //If there is already a request made for the party, we keep the original
    if(party.hasOwnProperty('RequestLocationChange') 
        && party.RequestLocationChange !== null){
      return responseUtil.Build(403, "There is a request already in progress");
    }

    //A prototype of the required fields of the required fields
    let required = ['Title', 'Body', 'User', 'RequestLocation'];

    let missingKey = false;

    console.log(request);
    party.RequestLocationChange = {};

    //Check if each required key is present
    required.forEach((key) => {
      console.log(key + '   ' +request.hasOwnProperty(key));
      if(request.hasOwnProperty(key) === false){
        missingKey = key;
        return false;
      }
      //Add the key to the new request
      party.RequestLocationChange[key] = request[key];
    });

    if(missingKey !== false){
      return responseUtil.Build(403, "Missing key: " + missingKey);
    }
    //Make sure that a user is valid
    let user
    
    try {
      user = await AccountAPI.Get(request.User);
      if(user === false){
        return responseUtil.Build(403, "User not valid");
      }
    } catch (err){
      return responseUtil.Build(403, "User not valid")
    }

    party.RequestLocationChange.User = {
      ID: user.ID,
      Username: user.Username
    }
    //Create a new update expression
    let updateExpression = 'Set RequestLocationChange = :R';
    let expressionValues = {
      ':R': party.RequestLocationChange
    }
    
    try{
      let response = await PartyAPI.Update(request.ID, expressionValues, updateExpression);
      if (response !== false){
        return responseUtil.Build(200, response);
      } else {
        return responseUtil.Build(500, "Could not fulfil update request")
      }
    } catch (err) {
      return responseUtil.Build(500, "Could not fulfil update request")
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