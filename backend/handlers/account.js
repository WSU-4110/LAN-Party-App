'use strict';

// Imports
const AccountAPI = require("../services/AccountAPI");
const moment = require("moment-timezone");
const responseUtil = require("../utilities/response");

module.exports = {

    // SIGN UP FOR AN ACCOUNT //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    SignUp: async function (event) {
        try {
            // if nothing was provided in the request, return a 204 HTTPS code (No content)
            if (!event)
                return responseUtil.Build(204, { Message: "No information was provided with the request!" });

            // next parse the request
            let request = JSON.parse(event.body);

            // they need to have entered an email, username, and a password
            if (!request.Email)
                throw new Error("Account Email Required!");

            if (!request.Username)
                throw new Error("Account Username Required!");

            if (!request.Password)
                throw new Error("Account Password Required!");

            // change the email to lowercase
            request.Email = request.Email.toLowerCase();

            // let's have a create date for our new account
            request.CreateDate = moment().toISOString();

            // let's check and see if the user already has an account
            let exists = await AccountAPI.GetByEmail(request.Email);

            // if they don't already have an account then we can make them one
            if (!exists) {
                let AccountID = request.ID ? request.ID : false;
                await AccountAPI.Save(AccountID, request);

                let result = {
                    Message: "Account created, log in to continue!",
                    Account: request
                };

                return responseUtil.Build(200, result);
            } else throw new Error("Email Already Exists!");
        } catch (err) {
            console.error("New Account Error:", err);
            return responseUtil.Build(500, { Message: err.message });
        }
    },

    // SIGN IN TO AN ACCOUNT //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    SignIn: async function (event) {
        try {
            // if nothing was provided in the request, return a 204 HTTPS code (No content)
            if (!event)
                return responseUtil.Build(204, { Message: "No information was provided with the request!" });

            // next parse the request
            let request = JSON.parse(event.body);

            // we need to make sure that an email and password were inputted
            if (!request.Email)
                throw new Error("Account Email Required!");

            if (!request.Password)
                throw new Error("Account Password Required!");

            // change the email to lowercase
            request.Email = request.Email.toLowerCase();

            // authenticate the account
            let account = await AccountAPI.AuthByEmailPassword(request.Email, request.Password);

            // if we returned with success, then save
            if (account.ID)
                return responseUtil.Build(200, account);

            // else, return an error
            return responseUtil.Build(500, { Message: "Account Login Error Detected." });
        } catch (err) {
            console.error("Login Error:", err);
            return responseUtil.Build(500, { Message: err.message });
        }
    },

    // VIEW AN ACCOUNT //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    View: async function (event) {
        try {
            // grab the ID
            let request = {
                ID: event.pathParameters.ID
            };

            // we need to make sure that we were give an ID
            if (!request.ID)
                throw new Error("Account ID Required!");

            // return the account information
            let account = await AccountAPI.Get(request.ID);

            // if we returned with success, then create a result object
            if (account.ID) {
                let result = {
                    Message: "Returning the account!",
                    Account: account
                };
                return responseUtil.Build(200, result); // send the result
            } else return responseUtil.Build(500, { Message: "No Account With That ID." }); // else, return an error
        } catch (err) {
            console.error("View Account Error:", err);
            return responseUtil.Build(500, { Message: err.message });
        }
    },

    ViewAll: async function () {
        try {
            // return the account information
            let accounts = await AccountAPI.GetAll();
            
            // if we returned with success
            if (accounts) {
                return responseUtil.Build(200, accounts); // then, send the result
            } else return responseUtil.Build(500, { Message: "No Accounts Exist." }); // else, return an error
        } catch (err) {
            console.error("View Accounts Error:", err);
            return responseUtil.Build(500, { Message: err.message });
        }
    },

    UpdateFriends: async function(events) {
        if(!events){
            return responseUtil.Build(204, "No information was sent");
        }

        //Get the events
        let request = events.body;
        request.SenderID = events.pathParameters;

        //Check that the ID is valid
        try {
            let sender = await AccountAPI.Get(request.SenderID);
        } catch (err) {
            return responseUtil.Build(403, "Sender ID not valid!");
        }

        //Check if the request had request
        if(request.hasOwnProperty("Requested")){
            //Check if the requested id is valid
            try {
                let requested = await AccountAPI.Get(request.Requested);
            } catch (err){
                return responseUtil.Build(403, "Requested ID not valid!");
            }
            //Save the request to the sender's account
            let updateExpression = 'set FriendRequests = :f';

            //If the sender has no friends, make sure the item is at least initialized
            if(!sender.hasOwnProperty("FriendRequests")){
                sender.FriendRequests = [];
            }
            let updateValues = {
                ':f': sender.FriendRequests.concat({
                    ID: requested.ID,
                    Username: requested.Username,
                    Sender: true
                })
            }
            
            try {
                let result = await AccountAPI.Update(sender.ID, updateValues, updateExpression);

                if(!result){
                    return responseUtil.Build(500, "Could not update friends list");
                } else {
                    //Repeat for the recipient
                    if(!requested.hasOwnProperty('FriendRequests')){
                        requested.FriendRequests = [];
                    }

                    updateValues = {
                        ':f': requested.FriendRequests.concat({
                            ID: sender.ID,
                            Username: sender.Username,
                            Sender: false
                        })
                    };
                    result = await AccountAPI.Update(sender.ID, updateValues, updateExpression);

                    if(!result){
                        return responseUtil.Build(500, "Could not update friends list");
                    } else {
                        return responseUtil.Build(200, "Request sent");
                    }
                }
            } catch (err) {
                return responseUtil.Build(500, "Could not update friends list");
            }
        }
    }
};