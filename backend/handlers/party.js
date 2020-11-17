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
    for(let i = 0; i < required.length; i++){
      if(!request.hasOwnProperty(required[i])){
        badKey = "Missing Key: " + required[i];
        break;
      } else {
        let curObj = await PartyUtil.validPartyKeys(required[i], request[required[i]]);
        if(curObj.isValid === false){
          badKey = "Key value not valid: " + required[i] + "   " + request[required[i]];
        }

        else {
          if(required[i] === 'Host'){
            console.log(curObj);
            request['HostUsername'] = curObj.value.HostUsername; 
          } else {
            request[required[i]] = curObj.value;
          }
        }
      }
    };

    if (badKey !== false){
      return responseUtil.Build(403, badKey);
    }

    const defaults = {
      Intent: 'Casual',
      Games: [],
      AgeGate: false
    }

    let keys = Object.keys(defaults);

    for(let i = 0; i < keys.length; i++){
      if(!request.hasOwnProperty(keys[i])){
        request[keys[i]] = defaults[keys[i]];
      } else {
        let curObj = await PartyUtil.validPartyKeys(keys[i], request[keys[i]]);
        if(curObj.isValid === false){
          request[keys[i]] = defaults[keys[i]];
        } else {
          request[keys[i]] = curObj.value;
        }
      }
    };

    // add a time that the party was created
    request.CreateDate = moment().toISOString();

    console.log(request.HostUsername);
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
    
    //Constant object for modifyable objects
    let modifyable = {
      PartyName: ':n',
      PartyLocation:  ':l',
      Host: ':h',
      HostUsername: ":u",
      PartyTime: ':t',
      HardwareRequirements: ':r',
      Games: ':g',
      AgeGate: ':b',
      Intent: ':i',
      RequestLocationChange: ':x'
    }
    
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

    let badKey = false;

    //A string for the updates
    let updateExpression = 'set ';

    var curExpressions = [];
    
    var updateValues = {};

    let keys = Object.keys(modifyable);

    for(let i = 0; i < keys.length; i++){
      
      if(request.hasOwnProperty(keys[i])){
        let curObj = await PartyUtil.validPartyKeys(keys[i], request[keys[i]], party);
        if(curObj.isValid === false){
          badKey = keys[i];
          break;
        } else {
          if (keys[i] === 'Host'){
            curExpressions.push('HostUsername =' + modifyable['HostUsername']);
            updateValues[modifyable['HostUsername']] = curObj.value.HostUsername;
            curObj.value = curObj.value.Host;
          }
          
          curExpressions.push(keys[i] + '=' + modifyable[keys[i]]);
          updateValues[modifyable[keys[i]]] = curObj.value;
        }
      }
    };

    if(badKey !== false){
      return responseUtil.Build(403, "Requested value for " + badKey +" not valid: " + request[badKey]);
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

   
    curExpressions = curExpressions.join(', ');
    updateExpression = updateExpression.concat(curExpressions);
    let response = await PartyAPI.Update(request.ID, updateValues, updateExpression);

    if(!response){
      return responseUtil.Build(403, 'Party Update Failed');
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
    for(let i = 0; i < required.length; i++){
      console.log(keys[i] + '   ' +request.hasOwnProperty(keys[i]));
      if(request.hasOwnProperty(keys[i]) === false){
        missingKey = keys[i];
        return false;
      }
      //Add the key to the new request
      party.RequestLocationChange[keys[i]] = request[keys[i]];
    };

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