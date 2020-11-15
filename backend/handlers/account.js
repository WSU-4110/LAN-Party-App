'use strict';

// Imports
const AccountAPI = require("../services/AccountAPI");
const GameAPI = require("../services/GameAPI");
const moment = require("moment-timezone");
const responseUtil = require("../utilities/response");
const crypto = require("crypto");

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

                    let result = {
                        Message: "Account created, log in to continue!",
                        Account: request
                    };

                    return responseUtil.Build(200, result);
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

            // if we returned with success, then create a result object
            if (account.ID) {
                let result = {
                    Message: "Returning the account!",
                    Account: account
                };
                return responseUtil.Build(200, result); // send the result
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
                return responseUtil.Build(200, accounts); // then, send the result
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

    // ADD A GAME FROM ACCOUNT LIST //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    AddGame: async function (event) {
        try {
            if (!event)
                return responseUtil.Build(204, "No information was sent");
    
            // get the event
            let request = JSON.parse(event.body);
            request.AccountID = event.pathParameters.ID;
    
            // check that the game ID is valid
            if (!await GameAPI.Get(request.GameID))
                return responseUtil.Build(204, "Invalid game!");

            // check that the user ID is valid
            let user = await AccountAPI.Get(request.AccountID); // save the user since we will the list of current games that they have for later
            
            if (!user) // if the user doesn't exist, throw an error
                return responseUtil.Build(204, "Invalid user!");
            
            // check if the user already contains the game
            if (AccountAPI.ContainsGame(user.Games, GameID)) // if it does exist, check if it has the game already
                return responseUtil.Build(204, "Game already on the account list!");
            
            // if we got here then we can just add the game to the account's game list
            let games = await AccountAPI.AddGame(AccountID, GameID);
            
            // if we returned with success
            if (games) {
                return responseUtil.Build(200, games); // then, send the result
            } else return responseUtil.Build(500, { Message: "Adding Game To List Error" }); // else, return an error
        } catch (err) {
            console.log(err);
            return responseUtil.Build(500, { Message: err.message });
        }
    },

    // REMOVE A GAME FROM ACCOUNT LIST //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    RemoveGame: async function (event) {
        try {
            // return the account information
            let games = await AccountAPI.RemoveGame();
            
            // if we returned with success
            if (games) {
                return responseUtil.Build(200, games); // then, send the result
            } else return responseUtil.Build(500, { Message: "Removing Game From List Error" }); // else, return an error
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

        console.log(request.SenderID);
        //Check that the ID is valid
        try {
            var sender = await AccountAPI.Get(request.SenderID);
        } catch (err) {
            return responseUtil.Build(403, "Sender ID not valid!");
        }

        //Check if the request had request
        if(request.hasOwnProperty("Requested")){
            if(sender.ID === request.Requested)
                return responseUtil.Build(403, "Cannot friend self");
            //Check if the requested id is valid
            try {
                var requested = await AccountAPI.Get(request.Requested);
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
                    result = await AccountAPI.Update(requested.ID, updateValues, updateExpression);

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
        
        
        else if (request.hasOwnProperty("Confirm")){ 

            if(sender.ID === request.Confirm)
                return responseUtil.Build(403, "Cannot friend self");

            let updateExpression = 'set Friends = :f, FriendRequests = :r';

            try {
                var requested = await AccountAPI.Get(request.Confirm);
            } catch (err) {
                return responseUtil.Build(403, "Requested ID invalid");
            }

            try {
                //Remove the confirmed item from the sender's friend request 
                sender.FriendRequests.splice(
                    sender.FriendRequests.findIndex((element) =>{ element.ID === requested.ID}), 1);
            } catch(err) {
                return responseUtil.Build(403, "Requested ID not found in sender's friend requests");
            }
            //Values to store in the sender's table.
            let storeVal = {
                ID: requested.ID,
                Username: requested.Username
            }
            //Insert the friend such that it's sorted by ID
            if(!sender.hasOwnProperty("Friends") || sender.Friends === []){
                sender.Friends = [storeVal]
            } else if (sender.Friends[0].ID > requested.ID){ //Insert at the beginning
                sender.Friends.unshift(storeVal);
            } else if (sender.Friends[sender.Friends.length - 1].ID < requested.ID){ //Insert at the end
                sender.Friends.push(storeVal);
            } else { //Insert in the middle
                let i = 1;
                while (i < sender.Friends.length && sender.Friends[i].ID > requested.ID){
                    i++;
                }

                sender.Friends.splice(i, 0, storeVal);
            }

            let updateValues = {
                ':f' : sender.Friends,
                ':r' : sender.FriendRequests
            }

            try {
                let response = await AccountAPI.Update(sender.ID, updateValues, updateExpression);
                if(response === false){
                    return responseUtil.Build(500, "Could not add friend");
                } else {
                    console.log(requested);

                    
                    requested.FriendRequests.splice(
                        requested.FriendRequests.findIndex((element) =>{ element.ID === sender.ID}), 1);
                        
                    let storeVal = {
                        ID: sender.ID,
                        Username: sender.Username
                    }

                    console.log('Post-splice')
                    console.log(requested);

                    console.log(storeVal);

                    //Insert the friend such that it's sorted by ID
                    if(!requested.hasOwnProperty("Friends") || requested.Friends === []){
                        requested.Friends = [storeVal]
                    } else if (requested.Friends[0].ID > requested.ID){ //Insert at the beginning
                        requested.Friends.unshift(storeVal);
                    } else if (requested.Friends[requested.Friends.length - 1].ID < sender.ID){ //Insert at the end
                        requested.Friends.push(storeVal);
                    } else { //Insert in the middle
                        let i = 1;
                        while (i < requested.Friends.length && requested.Friends[i].ID > sender.ID){
                            i++;
                        }
        
                        requested.Friends.splice(i, 0, storeVal);
                    }

                    console.log(requested);


                    updateValues = {
                        ':f' : requested.Friends,
                        ':r' : requested.FriendRequests
                    }

                    response = await AccountAPI.Update(requested.ID, updateValues, updateExpression);
                    if(response === false){
                        return responseUtil.Build(500, "Could not add friend");
                    } else {
                        return responseUtil.Build(200, "Friend added!");
                    }
                    
                }
            } catch (err) {
                return responseUtil.Build(500, "Could not add friend");
            }
        }
    }
};