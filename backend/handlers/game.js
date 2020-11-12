'use strict';

// Imports
const GameAPI = require("../services/GameAPI");
const responseUtil = require("../utilities/response");

module.exports = {
        
    // VIEW A GAME //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ViewGame: async function (event) {
        try {
            // grab the ID
            let request = {
                ID: event.pathParameters.ID
            };

            // we need to make sure that we were give an ID
            if (!request.ID)
                throw new Error("Game ID Required!");

            // return the account information
            let game = await GameAPI.Get(request.ID);

            // if we returned with success, then create a result object
            if (game.ID) {
                let result = {
                    Message: "Returning the game!",
                    Game: game
                };
                return responseUtil.Build(200, result); // send the result
            } else return responseUtil.Build(500, { Message: "No Game With That ID." }); // else, return an error
        } catch (err) {
            console.log(err);
            return responseUtil.Build(500, { Message: err.message });
        }
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