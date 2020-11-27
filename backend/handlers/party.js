'use strict';

// Imports
const PartyAPI = require("../services/PartyAPI");
const AccountAPI = require("../services/AccountAPI");
const responseUtil = require("../utilities/response");
const PartyUtil = require("../utilities/PartyUtils");
const shortid = require("shortid");
const moment = require("moment-timezone");

module.exports = {

  // CREATE //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  Create: async function (events) {
    // ensure that there was information in the event
    if(!events)
      return responseUtil.Build(204, "Event is empty");

    let request = JSON.parse(events.body);
    if(request.hasOwnProperty('PartyLocation') 
      && typeof(request.PartyLocation) === 'string'){
        let name = request.PartyLocation;
        request.PartyLocation = {
          Name: name,
          Longitude: request.Longitude,
          Latitude: request.Latitude
        };
      }
    //Create prototype party
    const required = ['PartyName', 'PartyLocation', 'Host', 'PartyTime'];
    
    let badKey = false;

    //If it's missing a required key, store which one it is and call return false
    for(let i = 0; i < required.length; i++){
      if(!request.hasOwnProperty(required[i])){
        badKey = "Missing Key: " + required[i];
        break;
      } else {
        //Check that the value at the key is valid
        let curObj = await PartyUtil.validPartyKeys(required[i], request[required[i]]);
        if(curObj.isValid === false){
          badKey = "Key value not valid: " + required[i] + "   " + request[required[i]];
        }
        //Is valid
        else {
          //Go through the returned value's keys
          Object.keys(curObj.value).forEach( responseKey => {
            request[responseKey] = curObj.value[responseKey];
          })
        }
      }
    };

    if (badKey !== false){
      return responseUtil.Build(403, badKey);
    }

    const defaults = {
      Intent: 'Casual',
      Games: []
    }

    let keys = Object.keys(defaults);

    //Go through the optional keys
    for(let i = 0; i < keys.length; i++){
      
      //If the object doesn't have it, set it to the default
      if(!request.hasOwnProperty(keys[i])){
        request[keys[i]] = defaults[keys[i]];
      } else {
        let curObj = await PartyUtil.validPartyKeys(keys[i], request[keys[i]]);
        //If the current key for the optional key isn't valid, set it to default
        if(curObj.isValid === false){
          request[keys[i]] = defaults[keys[i]];
        } else {
          //Go through the returned value's keys
          Object.keys(curObj.value).forEach( responseKey => {
            request[responseKey] = curObj.value[responseKey];
          })
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
    const modifyable = {
      PartyName: ':n',
      PartyLocation:  ':l',
      Host: ':h',
      HostUsername: ":u",
      PartyTime: ':t',
      HardwareRequirements: ':r',
      Games: ':g',
      AgeGate: ':b',
      Intent: ':i',
      RequestLocationChange: ':x',
      Attendees: ":a",
      Invited: ":z"
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

    //Go through the modifiable attributes
    for(let i = 0; i < keys.length; i++){
      //If it's trying to be modified, check if it's valid
      if(request.hasOwnProperty(keys[i])){
        let curObj = await PartyUtil.validPartyKeys(keys[i], request[keys[i]], party);
        //If not valid, set the bad key and break the update.
        if(curObj.isValid === false){ 
          badKey = keys[i];
          break;
        } else { 
          //Go through the returned value's keys
          Object.keys(curObj.value).forEach( responseKey => {
            curExpressions.push(responseKey + '=' + modifyable[responseKey]);
            updateValues[modifyable[responseKey]] = curObj.value[responseKey];
          })
        }
      }
    };

    if(badKey !== false){
      return responseUtil.Build(403, "Requested value for " + badKey +" not valid: " + request[badKey]);
    }
   
    curExpressions = curExpressions.join(', ');
    updateExpression = updateExpression.concat(curExpressions);
    let response = await PartyAPI.Update(request.ID, updateValues, updateExpression);

    if(!response){
      return responseUtil.Build(403, 'Party Update Failed');
    } else {
      response.Message = "Party Updated";
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
    party.Invited = PartyUtil.insertSorted(saveItem, party.Invited, 'ID')

    //Create the save expressions
    let expression = 'Set Invited = :I'
    let values = {
      ':I': party.Invited
    };

    let response;

    try {
      //Try to save the item
      response = await PartyAPI.Update(request.ID, values, expression);
    } catch (err) {
      return responseUtil.Build(403, "Cant set invite on party");
    }

    if (response === false){
      return responseUtil.Build(403, 'Could not invite to party');
    }

    //Set the save item to include values of party ID and Name
    saveItem = {
      ID: party.ID,
      PartyName: party.PartyName
    }

    //Check if the invites exist on the user
    if (!user.hasOwnProperty('Invites') || user.Invites.length === 0){
      user.Invites = [saveItem];
    } else {
      //Append it to the front
      user.Invites.unshift(saveItem);
    }

    expression = 'Set Invites = :I'
    values = {
      ':I': user.Invites
    }

    try {
      response = await AccountAPI.Update(user.ID, values, expression);
    } catch (err) {
      return responseUtil.Build(403, "Could not add party to user invites")
    }
    
    if(response !== false){
      response.Message = 'Invite successful'
      return responseUtil.Build(200, response);
    } else {
      return responseUtil.Build(403, "Could not add party to user invites")
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
    const required = ['Title', 'Body', 'User', 'RequestLocation'];

    let badKey = false;

    party.RequestLocationChange = {};

    //Check if each required key is present
    for(let i = 0; i < required.length; i++){

      if(request.hasOwnProperty(required[i]) === false){
        badKey = required[i];
        break;
      } else {
        let validate = await PartyUtil.isValidLocationRequest(request[required[i]], required[i]);
        if(validate.isValid === false){
          badKey = required[i];
          break;
        } else {
          Object.keys(validate.value).forEach(key =>{
            party.RequestLocationChange[key] = validate.value[key];
          })
        }
      }
      
    };

    if(badKey !== false){
      return responseUtil.Build(403, "Bad key: " + badKey);
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