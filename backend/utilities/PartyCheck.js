'use strict';

const moment = require("moment-timezone");
const AccountAPI = require("../services/AccountAPI");

module.exports = {
    validPartyKeys: async function(key, value, context){
        let output = {
            key: {}
        };
        
        switch (key) {
            case 'PartyName':
                output.value[key] = await this.isValidPartyName(value);
                output.isValid = (output.value !== false);
                return output;

            case 'PartyLocation':
                return this.isValidPartyName(value);

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
                    if(this.isInSortedList(account, context.Attendees, 'ID') === false){
                        //Insert the user into the list such that it is sorted.

                    }
                }
                return output;

            case 'PartyTime':
                let curTime = moment();
                output.value[key] = value;
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
                output.value[key] = value;
                output.isValid = (typeof value === "boolean")
                return output;

            case 'Intent':
                output.value[key] = value;
                output.isValid = (value === "Casual" || value === "Competative");
                return output;

            case 'RequestLocationChange':
                output.value[key] = null;
                output.isValid = true;
                return output;

            default:
                output.value[key] = value;
                output.isValid = true;
                return output;
        }
    },

    //Checks if incoming location is valid
    isValidLocation: async function (location){
        const reqs = ['Longitude', 'Latitude', 'Name'];

        output.value = {
            PartyLocation: {}
        };

        let missingKey = false;

        for(let i = 0; i < reqs.length; i++){
            if(!location.hasOwnProperty(reqs[i])){
                missingKey = reqs[i];
                break;
            } else {
                output.value.PartyLocation[reqs[i]] = value[reqs[i]];
            }
        }
        
        //Valid if there was no missing key
        output.isValid = (missingKey === false);
        
        return output;
    },

    isInSortedList: async function(item, list, sortedKey){
        let left = 0;
        let right = list.length - 1;
        try {
            while (right > left){
                let middle = (left + right) / 2;
                if(list[middle][sortedKey] === item[sortedKey]){
                    return middle;
                } else if (list[middle][sortedKey] < item[sortedKey]){
                    left = middle + 1;
                } else {
                    right = middle - 1;
                }
            }

            return false;
        } catch (err) {
            return false;
        }
        
    },

    insertSorted: async function (insertItem, list, sortKey){
        //Make sure that the list isn't empty
        if(list === undefined || list.length === 0){
            list = [insertItem];
        }
        
        //If the first item is greater than the new item, put the item in the front
        else if(list[0][sortKey] > insertItem[sortKey]){
            list.unshift(insertItem);
        } 
        
        //If the last item is less than the new item, put the item in the back
        else if(list[list.length - 1][sortKey] < insertItem[sortKey]){
            
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