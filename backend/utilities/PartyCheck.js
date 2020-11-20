'use strict';

const moment = require("moment-timezone");
const AccountAPI = require("../services/AccountAPI");

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
                    if(await this.isInSortedList(account, context.Attendees, 'ID') === false){
                        //Insert the user into the list such that it is sorted.
                        output.value.Attendees = await this.insertSorted(saveItem, context.Attendees, 'ID');
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
                    if(await this.isInSortedList(user, context.Attendees, 'ID') !== false){
                        output.isValid = false;
                        return output;
                    }

                    let saveItem = {
                        ID: user.ID,
                        Username: user.Username
                    }

                    //Insert them into the array
                    let result = await this.insertSorted(saveItem, context.Attendees, 'ID');
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
                    let index = await this.isInSortedList(value.Remove, context.Attendees, 'ID');
                    
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
    isValidLocation: async function (location){
        const reqs = ['Longitude', 'Latitude', 'Name'];
        
        let output = {
            value: {
                PartyLocation: {}
            }
        }
        
        let missingKey = false;

        for(let i = 0; i < reqs.length; i++){
            if(!location.hasOwnProperty(reqs[i])){
                missingKey = reqs[i];
                break;
            } else {
                output.value.PartyLocation[reqs[i]] = location[reqs[i]];
            }
        }
        
        //Valid if there was no missing key
        output.isValid = (missingKey === false);
        
        return output;
    },

    isInSortedList: async function(item, list, sortedKey){
        let left = 0;
        let right = list.length - 1;
        console.log(item);
        try {
            console.log(left + " | " + right);
            while (right >= left){
                let middle = Math.round((left + right) / 2);
                console.log(middle);
                console.log(list[middle][sortedKey] + " " + item[sortedKey]);
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
            return list;
        }
        
        //If the first item is greater than the new item, put the item in the front
        else if(list[0][sortKey] > insertItem[sortKey]){
            list.unshift(insertItem);
            return list;
        } 
        
        //If the last item is less than the new item, put the item in the back
        else if(list[list.length - 1][sortKey] < insertItem[sortKey]){
            list.push(insertItem);
            return list;
        }

        //It's somewhere in the middle
        else {
            let left = 0;
            let right = list.length - 1;
            while(left < right){
                let middle = Math.Round((left + right) / 2);

                //If the current middle is greater
                if(list[middle][sortKey] > insertItem[sortKey]){
                    //If the one below is lesser, insert between
                    if(list[middle - 1][sortKey] < insertItem[sortKey]){
                        list.splice(middle, 0, insertItem);
                        return list;
                    }
                    
                    //Otherwise, move earlier in the list
                    else {
                        right = middle - 1;
                    }
                }

                //If the current middle is lesser
                else {
                    //If the next item is greater, insert between
                    if(list[middle + 1][sortKey] > insertItem[sortKey]){
                        list.splice(middle + 1, 0, insertItem);
                        return list;
                    }

                    //Otherwise, move to later in the list
                    else {
                        left = middle + 1;
                    }
                }
            }
        }

        //If it couldn't be inserted, return false
        return false;
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