'use strict';

module.exports = {

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