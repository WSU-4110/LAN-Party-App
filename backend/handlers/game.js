'use strict';

// Imports
const GameAPI = require("../services/GameAPI");
const responseUtil = require("../utilities/response");

module.exports = {
        
    // VIEW A GAME //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ViewGame: async function () {

    },

    // VIEW THE ENTIRE LIST OF GAMES //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ViewAllGames: async function () {
        try {
            // return the game information
            let games = await GameAPI.GetAll();
            
            // if we returned with success
            if (games) {
                return responseUtil.Build(200, games); // then, send the result
            } else return responseUtil.Build(500, { Message: "No Games Exist." }); // else, return an error
        } catch (err) {
            console.log(err);
            return responseUtil.Build(500, { Message: err.message });
        }
    }
};