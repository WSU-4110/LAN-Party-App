'use strict';

const moment = require("moment-timezone");
const AccountAPI = require("../services/AccountAPI");
const genUtils = require("./generalUtils")

module.exports = {
    validPartyKeys: async function(key, value, context){
        let output = {
            value: {}
        };
        
        switch (key) {
            case 'PartyName':
                output.value[key] = await this.isValidPartyName(value);
                output.isValid = (output.value !== false);
                return output;

            case 'PartyLocation':
                return this.isValidLocation(value);

            case 'Host':
                let account;
                try {
                    account = await AccountAPI.Get(value);
                    if (account === false){
                        output.isValid = false;
                        return output;
                    }
                } catch (err) {
                    output.isValid = false;
                    return output;
                }

                output.value = {
                    Host: account.ID,
                    HostUsername: account.Username
                };
                output.isValid = true;
                
                //If context is present, it's an update. Make sure new host is attending
                if(context !== undefined){
                    let saveItem = {
                        ID: account.ID,
                        Username: account.Username
                    }
                    if(await genUtils.isInSortedList(account, context.Attendees) === false){
                        //Insert the user into the list such that it is sorted.
                        output.value.Attendees = await genUtils.insertSorted(saveItem, context.Attendees);
                        if(output.value.Attendees === false){
                            output.isValid = false;
                        }
                    }
                }
                return output;

            case 'PartyTime':
                let curTime = moment();
                output.value[key] = value;
                value = moment(value, ["MMMM D, yyyy h:mm a", "MMMM DD, yyyy h:mm a",
                                        "MMMM D, yyyy hh:mm a", "MMMM DD, yyyy hh:mm a"], true);
                try {
                    //output.isValid = value.isAfter(curTime);
                } catch (err){
                    output.isValid = false;
                    console.log("error: " + err);
                }
                output.isValid = true;
                return output;

            case 'AgeGate':
                output.value[key] = value;
                output.isValid = true;//(typeof value === "boolean")
                return output;

            case 'Intent':
                output.value[key] = value;
                output.isValid = (value === "Casual" || value === "Competative");
                return output;

            case 'RequestLocationChange':
                output.value[key] = null;
                output.isValid = true;
                return output;

            case 'Attendees':
                if(value.hasOwnProperty("Add")){
                    let user;
                    
                    //Make sure that the user is valid
                    try {
                        user = await AccountAPI.Get(value.Add);
                        if(user === false){
                            output.isValid = false;
                            return output;
                        } 
                    } catch (err){
                        output.isValid = false;
                        return output;
                    }

                    //Check if the user is in the array
                    if(await genUtils.isInSortedList(user, context.Attendees) !== false){
                        output.isValid = false;
                        return output;
                    }

                    let saveItem = {
                        ID: user.ID,
                        Username: user.Username
                    }

                    //Insert them into the array
                    let result = await genUtils.insertSorted(saveItem, context.Attendees);
                    console.log(context);
                    //If invites exist, check if they're in them
                    if(context.hasOwnProperty("Invited")){
                        console.log(context.Invited);
                        console.log(user.ID);
                        
                        for(let i = 0 ; i < context.Invited.length; i++){

                            if(context.Invited[i].ID === user.ID){
                                context.Invited.splice(i, 1);
                                output.value.Invited = context.Invited;
                                break;
                            }
                        }
                    }
                    console.log(output);
                    output.isValid = (result !== false);
                    output.value.Attendees = result;
                } 

                else if (value.hasOwnProperty("Remove")){
                    //Try to find the spot that they are in
                    let remove = value.Remove;
                    value.Remove = {
                        ID: remove
                    }
                    let index = await genUtils.isInSortedList(value.Remove, context.Attendees);
                    
                    console.log(index);
                    if(index === false){
                        output.isValid = false;
                    } else {
                        context.Attendees.splice(index, 1);
                        output.value.Attendees = context.Attendees;
                        output.isValid = true;
                    }
                }
                return output;  
            
            default:
                output.value[key] = value;
                output.isValid = (typeof(value) === 'string');
                return output;
        }
    },

    //Checks if incoming location is valid
    isValidLocation: async function (location, key = 'PartyLocation'){
        const reqs = ['Longitude', 'Latitude', 'Name'];
        
        let output = {
            value: {}
        }
        output.value[key] = {};
        let missingKey = false;
        for(let i = 0; i < reqs.length; i++){
            if(!location.hasOwnProperty(reqs[i])){
                missingKey = reqs[i];
                break;
            } else {
                output.value[key][reqs[i]] = location[reqs[i]];
            }
        }
        
        //Valid if there was no missing key
        output.isValid = (missingKey === false);
        
        return output;
    },

    isValidLocationRequest: async function (value, key){
        let output = {
            value: {}
        }
        switch(key){
            case 'Title':
                output.value.Title = await this.isValidPartyName(value);
                output.isValid = (output.value.Title !== false);
                return output;

            case 'RequestLocation':
                return this.isValidLocation(value, key);

            case 'User':
                let user
                try {
                    user = await AccountAPI.Get(value);
                } catch (err){
                    output.value = false;
                    return output;
                }
                if (user === false){
                    output.value = false;
                    return output;
                }

                output.value.User = {
                    ID: user.ID,
                    Username: user.Username
                }
                output.isValid = true
                return output;

            default:
                output.value[key] = value;
                output.isValid = (typeof(value) === 'string');
                return output;
        }
    },

    //Check if a name is valid
    isValidPartyName: async function (name){
        //Trim the string of whitespace 
        name = name.trim();

        //If the name was empty, return false
        if(name === ''){
            return false;
        }

        //Replace multiple neighboring whitespaces with single spaces
        name = name.split(/\s\s+/).join(' ');

        return name;
    },

    //Check for valid usernames
    isValidUserName: function (userName){
        //Check if the username has spaces
        if(/\s/.test(userName)){
            return false;
        }

        return true;
    }
};