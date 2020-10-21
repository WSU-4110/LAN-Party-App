'use strict';

const { func } = require("joi");

module.exports = {

    //Check if a name is valid
    isValidParty: function (name){
        //Check if there are any non-whitespace characters in the start
        nonWhitespace = /\S/;
        if(nonWhitespace.test(name) === null){
            //Name is all whitespace. Not valid
            return false;
        }
        
        //The first character must be non-whitespace
        name = name.substr(nonWhitespace.lastIndex - 1);

        //Replace multiple neighboring whitespaces with single spaces
        name = name.split(/\s\s+/).join(' ');

        return name;
    }
};