'use strict';

// Imports
const AccountAPI = require("../services/AccountAPI");
const GameAPI = require("../services/GameAPI");
const moment = require("moment-timezone");
const responseUtil = require("../utilities/response");
const crypto = require("crypto");
const genUtils = require("../utilities/generalUtils");
const { isUndefined } = require("util");
const friendUtil = require('../utilities/friendUtils');
const generalUtils = require("../utilities/generalUtils");

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

            // let's check and see if this email is already being used
            let exists = await AccountAPI.GetByEmail(request.Email);
            
            // let's check and see if this username is already used
            let exists2 = await AccountAPI.GetByUsername(request.Username);

            // if the entered username and email are unique then we can proceed
            if (!exists) {
                if(!exists2) {
                    let AccountID = request.ID ? request.ID : false;
                    await AccountAPI.Save(AccountID, request);

                    let response = {
                        Message: "Account created, log in to continue!",
                        Account: request
                    };

                    return responseUtil.Build(200, response);
                } else throw new Error("Username Already Exists!");
            } else throw new Error("Email Already Exists!");
        } catch (err) {
            console.log(err);
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
            console.log(err);
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

            // if we returned with success, then create a response object
            if (account.ID) {
                let response = {
                    Message: "Returning the account!",
                    Account: account
                };
                return responseUtil.Build(200, response); // send the response
            } else return responseUtil.Build(500, { Message: "No Account With That ID." }); // else, return an error
        } catch (err) {
            console.log(err);
            return responseUtil.Build(500, { Message: err.message });
        }
    },

    // VIEW ALL ACCOUNTS //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ViewAll: async function () {
        try {
            // return the account information
            let accounts = await AccountAPI.GetAll();
            
            // if we returned with success
            if (accounts) {
                return responseUtil.Build(200, accounts); // then, send the response
            } else return responseUtil.Build(500, { Message: "No Accounts Exist." }); // else, return an error
        } catch (err) {
            console.log(err);
            return responseUtil.Build(500, { Message: err.message });
        }
    },

    // UPDATE AN ACCOUNT //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    Update: async function (event) {
        try {
            // if nothing was provided in the request, return a 204 HTTPS code (No content)
            if (!event)
                return responseUtil.Build(204, { Message: "No information was provided with the request!" });

            // next parse the request
            let request = JSON.parse(event.body);
            request.ID = event.pathParameters.ID;

            // we need to make sure that a valid ID was sent
            let ValidID = await AccountAPI.Get(request.ID);
            if (!ValidID)
                throw new Error("Invalid Account ID!");

            // these are the values that we need for updating Dynamo, we will concat them with whatever we are updating
            let updateExpression = "SET ";
            let curExpressions = [];
            let updateValues = {};

            // if we are updating the password, add it to the updateValues and curExpressions
            if (request.NewPassword) {
                let HashedPassword = crypto.createHmac("sha256", request.ID).update(request.NewPassword).digest("hex"); // create a hash for the new password
                updateValues[":p"] = HashedPassword;
                curExpressions = curExpressions.concat("Password = :p");
            }

            // if we are updating the username, add it to the updateValues and curExpressions
            if (request.NewUsername) {
                let UsernameExists = await AccountAPI.GetByUsername(request.NewUsername); // check that the new username doesn't already exist
                if (UsernameExists)
                    throw new Error("Username Already Taken!");
                updateValues[":u"] = request.NewUsername;
                curExpressions = curExpressions.concat("Username = :u");
            }

            // if we are updating the email, add it to the updateValues and curExpressions
            if (request.NewEmail) {
                request.NewEmail = request.NewEmail.toLowerCase(); // change the email to lowercase
                let EmailExists = await AccountAPI.GetByEmail(request.NewEmail); // check that the new email doesn't already exist
                if (EmailExists)
                    throw new Error("Email Already Taken!");
                updateValues[":e"] = request.NewEmail;
                curExpressions = curExpressions.concat("Email = :e");
            }

            // if we are updating the Avatar, add it to the updateValues and curExpressions
            if (request.Avatar) {
                updateValues[":a"] = request.Avatar;
                curExpressions = curExpressions.concat("Avatar = :a"); 
            }

            // update the UpdateDate
            updateValues[":d"] = moment().toISOString(); // let's take note of when we updated this account
            curExpressions = curExpressions.concat("UpdateDate = :d");

            // combine all the expressions and values
            curExpressions = curExpressions.join(', ');
            updateExpression = updateExpression.concat(curExpressions);

            // call the API
            let response = await AccountAPI.Update(request, updateValues, updateExpression);

            // if we returned with success, then return the new account
            if (response) {
                let UpdatedAccount = await AccountAPI.Get(request.ID);
                return responseUtil.Build(200, UpdatedAccount);
            } else return responseUtil.Build(500, { Message: "No Updates Were Requested." }); // else, return an error
        } catch (err) {
            console.log(err);
            return responseUtil.Build(500, { Message: err.message });
        }
    },

    // ADD OR REMOVE A GAME FROM ACCOUNT'S GAME LIST //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    UpdateGames: async function (event) {
        try {
            if (!event)
                throw new Error("No information was sent");
    
            let request = JSON.parse(event.body);

            // add the IDs
            request.AccountID = event.pathParameters.ID;
            request.ID = request.AccountID;
            
            // check that the user ID is valid
            let account = await AccountAPI.Get(request.AccountID);

            if (!account) // if the user doesn't exist, throw an error
                throw new Error("Invalid user!");
            
            if(!account.hasOwnProperty("Games"))
                account.Games = [];
            
            let NewGamesArray = account.Games; // this is an array that will hold all the IDs of each game as a string

            // ADDING A GAME ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            if(request.Add) {
                
                // make sure the game exists
                if (!(await GameAPI.Get(request.Add))) // if the game doesn't exist, throw an error
                    throw new Error("Invalid game!");

                let i = NewGamesArray.length;

                // check that it isn't in the list already
                while (i--) {
                    if(account.Games[i] === request.Add)
                        throw new Error("Game already added to account!");
                }

                // if we get here then we can add it to the list
                NewGamesArray.push(request.Add);
            }
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            // REMOVING A GAME ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            if (request.Remove) {
                let j = NewGamesArray.length;

                if (j !== 0) { // do nothing if the array is already empty
                    while(j--) { // loop through the array
                        if (account.Games[j] === request.Remove) // if we find it then we can delete it
                            NewGamesArray.splice(j, 1);
                    }
                } else throw new Error("The account doesn't have any games so you can't delete this game!");
            }
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
            // update the expressions before submitting
            let UpdateExpression = "SET Games = :g";
            let UpdateValues = {};
            UpdateValues[':g'] = NewGamesArray;

            // update via the API
            let UpdatedAccount = await AccountAPI.Update(request, UpdateValues, UpdateExpression);
            if(!UpdatedAccount)
                throw new Error("Could not update account game list");
            
            // return the updated account
            return responseUtil.Build(200, await AccountAPI.Get(request.AccountID));
        } catch (err) {
            console.log(err);
            return responseUtil.Build(500, { Message: err.message });
        }
    },

    // UPDATE FRIENDS LIST //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    UpdateFriends: async function(events) {
        if(!events){
            return responseUtil.Build(204, "No information was sent");
        }

        //Get the events
        let request = JSON.parse(events.body);
        request.SenderID = events.pathParameters.ID;

        //Initialize the requested user
        let requested;
        //Initialize the response from dynamo
        let response;
        //Initialize an update function that can be applied to both users
        let updateFunction;
        //Initialize the array for users
        let users;
        //Initialize senderVals. It will be undefined unless we go into senders
        let senderVals;

        //Check that the ID is valid
        try {
            var sender = await AccountAPI.Get(request.SenderID);
        } catch (err) {
            return responseUtil.Build(403, "Sender ID not valid!");
        }
        if (sender === false){
            return responseUtil.Build(403, "Sender ID not valid!");
        }

        //Check if the request had request
        if(request.hasOwnProperty("Requested")){
            if(sender.ID === request.Requested){
                return responseUtil.Build(403, "Cannot friend self");
            }
            
            try {
                requested = await AccountAPI.Get(request.Requested);     
            } catch (err){
                return responseUtil.Build(403, "Requested ID not valid!");
            }
            if(requested === false){
                return responseUtil.Build(403, "Requested ID not valid!");
            }
            //Sender has the sender val true, requested as false
            senderVals = [true, false];

            //The function used to update both of the users
            updateFunction = async function (user1, user2, sender){
                const updateExpression = 'SET FriendRequests =:f'

                //Get the updated friends list
                let updatedFriendReqs = await friendUtil.addToFriendRequests(user1, user2, sender);
                
                if(updatedFriendReqs === false){
                    return responseUtil.Build(403, 'Tried sending friend request to self');
                }
                
                let updateValues = {
                    ':f': updatedFriendReqs
                };


                try {
                    response = await AccountAPI.Update(user1.ID, updateValues, updateExpression);
                } catch (err) {
                    return responseUtil.Build(500, "Could not update friends list of " + user1.Username);
                }
                if(!response){
                    return responseUtil.Build(500, "Could not update friends list of " + user1.Username);
                } 
                return true;
            }
        }

        else if (request.hasOwnProperty("Confirm")){ 

            if(sender.ID === request.Confirm)
                return responseUtil.Build(403, "Cannot friend self");

            try {
                requested = await AccountAPI.Get(request.Confirm);
                
            } catch (err) {
                return responseUtil.Build(403, "Requested ID invalid");
            }
            if (requested === false){
                return responseUtil.Build(403, "Requested ID not valid!");
            }
            //Sender has the sender val true, requested as false
            senderVals = [true, false];

            //Initialize the update function
            updateFunction = async function (user1, user2, isSender){
                const updateExpression = 'set Friends = :f, FriendRequests = :r';

                //Remove the user2 from the user1's friend request
                let updatedFriendReqs = await friendUtil.removeFromFriendRequests(user1, user2);

                //If the item wasn't in there
                if(updatedFriendReqs === false){
                    return responseUtil.Build(403, "User not in " + user1.Username + "'s Friend Requests");
                
                //If the user1 of this request also sent the friend request
                } else if (updatedFriendReqs.deleted.Sender === isSender){
                    return responseUtil.Build(403, 'Cannot confirm request you sent!');

                //Set the value to the new friend request array
                } else {
                    updatedFriendReqs = updatedFriendReqs.FriendRequests;
                }

                //Update the friend request array
                let updatedFriends = await friendUtil.AddToFriends(user1, user2);

                if(updatedFriends === false){
                    return responseUtil.Build(403, "User already in "+ user1.Username + "'s friends!")
                }

                let updateValues = {
                    ':f' : updatedFriends,
                    ':r' : updatedFriendReqs
                }

                console.log(updateValues);

                try {
                    response = await AccountAPI.Update(user1.ID, updateValues, updateExpression);
                } catch (err) {
                    return responseUtil.Build(500, "Could not add friend to " + user1.Username);
                }
                if(response === false){
                    return responseUtil.Build(500, "Could not add friend to " + user1.Username);
                } 

                return true;
            }

        } else if (request.hasOwnProperty("Remove")){
            
            try {
                requested = await AccountAPI.Get(request.Remove);
            } catch (err){
                return responseUtil.Build(403, "Requested Account does not exist");
            }

            if(requested === false){
                return responseUtil.Build(403, "Requested Account does not exist");
            }

            //Initialize the update function
            updateFunction = async function (user1, user2){
                //Set the request statement
                const requestExpression = 'Set Friends = :f'

                //Get the updated friends list
                let updatedFriends = await friendUtil.RemoveFromFriends(user1, user2);
                //If the user2 was not in the list
                if(updatedFriends === false){
                    return responseUtil.Build(403, "User not in " + user1.Username + "'s friend array");
                }
                console.log(updatedFriends);
                //Set the expression value
                let expressionValue = {
                    ':f': updatedFriends
                }
                
                //Save to the account
                try {
                    response = await AccountAPI.Update(user1.ID, expressionValue, requestExpression);
                
                //Any errors saving to the account
                } catch (err) {
                    return responseUtil.Build(500, "Error saving to " + user1.Username)
                }
                if(response === false){
                    return responseUtil.Build(500, "Error saving to " + user1.Username)
                }

                return true;
            }
        
        } else if (request.hasOwnProperty("RemoveRequest")){
            
            const updateExpression = "Set FriendRequests=:r"
            
            try {
                requested = await AccountAPI.Get(request.RemoveRequest);
            } catch (err){
                return responseUtil.Build(403, "Requested user does not exist");
            }
            if(requested === false){
                return responseUtil.Build(403, "Requested Account does not exist");
            }

            //Initialize the update function
            updateFunction = async function (user1, user2){
                //Remove the friendRequest from the user2's array
                let updatedFriendReqs = await friendUtil.removeFromFriendRequests(user1, user2);

                if (updatedFriendReqs === false){
                    return responseUtil.Build(403, "User not in " + user1.Username +"'s friend request array");
                }

                //Set the updated friend requests to the Friend requests array
                updatedFriendReqs = updatedFriendReqs.FriendRequests;

                //Update the values
                let updateValues = {
                    ':r': updatedFriendReqs
                };

                //Save the item

                try {
                    response = await AccountAPI.Update(user1.ID, updateValues, updateExpression);
                    //If it could not save
                } catch (err) {
                    return responseUtil.Build(500, "Could not save to " + user1.Username);
                }
                if (response === false){
                    return responseUtil.Build(500, "Could not save to " + user1.Username);
                }

                return true;
            }
        }

        //Initialize the users as the sender and the requested
        users = [sender, requested];

        //Send the request to update both users
        response = await generalUtils.mutualUpdate(users, updateFunction, senderVals);

        //If the response is not true, the request was returned already
        if(response !== true){
            return response;
        } else {
            return responseUtil.Build(200, "Request completed!");
        }
    
    }
};