'use strict';

// Imports
const GameAPI = require("../services/GameAPI");
const moment = require("moment-timezone");
const responseUtil = require("../utilities/response");

module.exports = {
        
    // MAKE A NEW GAME  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    NewGame: async function (event) {
        try {
            // if nothing was provided in the request, return a 204 HTTPS code (No content)
            if (!event)
                return responseUtil.Build(204, { Message: "No information was provided with the request!" });

            // next parse the request
            let request = JSON.parse(event.body);

            // they need to have entered an email, username, and a password
            if (!request.GameName)
                throw new Error("Game Name Required!");

            if (!request.Genre)
                throw new Error("Game Genre Required!");

            // let's have a create date for our new account
            request.CreateDate = moment().toISOString();

            // let's check and see if this name is already being used
            let exists = await GameAPI.GetByName(request.GameName);

            // if the entered name is unique, then we can proceed
            if (!exists) {
                let GameID = request.ID ? request.ID : false;
                await GameAPI.Create(GameID, request);

                let result = {
                    Message: "Game created!",
                    Game: request
                };

                return responseUtil.Build(200, result);
            } else throw new Error("Game Name Already Exists!");
        } catch (err) {
            console.log(err);
            return responseUtil.Build(500, { Message: err.message });
        }
    },
    
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