'use strict';

const moment = require("moment-timezone");
const AccountAPI = require("../services/AccountAPI");

module.exports = {
    validPartyKeys: async function(key, value, context){
        let output = {};
        
        switch (key) {
            case 'PartyName':
                output.value = this.isValidParty(value);
                output.isValid = (output.value !== false);
                return output;

            case 'PartyLocation':
                let reqs = ['Longitude', 'Latitude', 'Name'];

                output.value = {};
                
                let missingKey = false;

                reqs.forEach(key => {
                    if(!value.hasOwnProperty(key)){
                        missingKey = key;
                    } else {
                     output.value[key] = value[key];
                    }
                })

                output.isValid = (missingKey !== false);
                return output;

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
                
                console.log(output);

                return output;

            case 'PartyTime':
                output.value = value;
                try {
                output.isValid = value.isAfter(moment.now());
                } catch (err){
                    output.isValid = false;
                }
                return output;

            case 'AgeGate':
                output.value = value;
                output.isValid = (typeof value === Boolean)
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

    //Check if a name is valid
    isValidParty: function (name){
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