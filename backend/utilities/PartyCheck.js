'use strict';

const moment = require("moment-timezone");
const AccountAPI = require("../services/AccountAPI");

module.exports = {
    validPartyKeys: async function(key, value, context){
        let output = {};
        
        switch (key) {
            case 'PartyName':
                output.value = await this.isValidParty(value);
                output.isValid = (output.value !== false);
                return output;

            case 'PartyLocation':
                return this.isValidParty(value);

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

                return output;

            case 'PartyTime':
                let curTime = moment();
                output.value = value;
                value = moment(value, ["MMMM D, yyyy h:mm a", "MMMM DD, yyyy h:mm a",
                                        "MMMM D, yyyy hh:mm a", "MMMM DD, yyyy hh:mm a"], true);
                try {
                    output.isValid = value.isAfter(curTime);
                } catch (err){
                    output.isValid = false;
                    console.log("error: " + err);
                }
                return output;

            case 'AgeGate':
                output.value = value;
                output.isValid = (typeof value === "boolean")
                return output;

            case 'Intent':
                output.value = value;
                output.isValid = (value === "Casual" || value === "Competative");
                return output;

            case 'RequestLocationChange':
                output.value = null;
                output.isValid = true;
                return output;

            default:
                output.value = value;
                output.isValid = true;
                return output;
        }
    },

    //Checks if incoming location is valid
    isValidLocation: async function (location){
        const reqs = ['Longitude', 'Latitude', 'Name'];

        output.value = {};

        let missingKey = false;

        for(let i = 0; i < reqs.length; i++){
            if(!location.hasOwnProperty(reqs[i])){
                missingKey = reqs[i];
                break;
            } else {
                output.value[reqs[i]] = value[reqs[i]];
            }
        }
        
        //Valid if there was no missing key
        output.isValid = (missingKey === false);
        
        return output;
    },

    //Check if a name is valid
    isValidParty: async function (name){
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