'use strict';

// Imports
const AccountAPI = require("../services/AccountAPI");
const moment = require("moment-timezone");
const responseUtil = require("../utilities/response");
const crypto = require("crypto");
const genUtils = require("../utilities/generalUtils");

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
            if(sender.ID === request.Requested){
                return responseUtil.Build(403, "Cannot friend self");
            }
            
            //Check if the requested id is valid
            let requested;
            try {
                requested = await AccountAPI.Get(request.Requested);
                if(requested === false){
                    return responseUtil.Build(403, "Requested ID not valid!");
                }
            } catch (err){
                return responseUtil.Build(403, "Requested ID not valid!");
            }

            //Save the request to the sender's account
            let updateExpression = 'set FriendRequests = :f';

            //If the sender has no friends, make sure the item is at least initialized
            if(!sender.hasOwnProperty("FriendRequests")){
                sender.FriendRequests = [];
            } else { //If the user already has a friend request w/ them, prevent them
                if(sender.FriendRequests.findIndex(FrenReq => {
                    FrenReq.ID === requested.ID
                }) !== -1){
                    return responseUtil.Build(403, "Already requested that friend");
                }
            }
            
            let updateValues = {
                ':f': sender.FriendRequests.concat({
                    ID: requested.ID,
                    Username: requested.Username,
                    Sender: true
                })
            }
            let result;
            
            try {
                result = await AccountAPI.Update(sender.ID, updateValues, updateExpression);
            } catch (err) {
                return responseUtil.Build(500, "Could not update friends list");
            }
            if(!result){
                return responseUtil.Build(500, "Could not update friends list");
            }
            
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
        
        
        else if (request.hasOwnProperty("Confirm")){ 

            if(sender.ID === request.Confirm)
                return responseUtil.Build(403, "Cannot friend self");

            let updateExpression = 'set Friends = :f, FriendRequests = :r';

            try {
                var requested = await AccountAPI.Get(request.Confirm);
                if(requested === false){
                    return responseUtil.Build(403, "Requested ID not valid!");
                }
            } catch (err) {
                return responseUtil.Build(403, "Requested ID invalid");
            }

            //let friendReqInd = await genUtils.isInSortedList(requested, sender.FriendRequests);
            let friendReqInd = sender.FriendRequests.findIndex(user => user.ID === requested.ID)
            if(friendReqInd === -1){
                return responseUtil.Build(403, "Requested user not in sender's FriendRequests");
            }

            sender.FriendRequests.splice(friendReqInd, 1);

            //Values to store in the sender's table.
            let storeVal = {
                ID: requested.ID,
                Username: requested.Username,
                Avatar: requested.Avatar
            }
            //Insert the friend such that it's sorted by ID
            sender.Friends = await genUtils.insertSorted(storeVal, sender.Friend);

            let updateValues = {
                ':f' : sender.Friends,
                ':r' : sender.FriendRequests
            }

            console.log(updateValues);
            
            let response;

            try {
                response = await AccountAPI.Update(sender.ID, updateValues, updateExpression);
            } catch (err) {
                return responseUtil.Build(500, "Could not add friend");
            }
            if(response === false){
                return responseUtil.Build(500, "Could not add friend");
            } 
            
            console.log(requested);

            //friendReqInd = await genUtils.isInSortedList(sender, requested.FriendRequests);
            friendReqInd = requested.FriendRequests.findIndex(user => user.ID === sender.ID);
            if(friendReqInd === -1){
                console.log("Sender not in requested friend requests array");
                return (403, "Sender not in requested friend requests array");
            }

            requested.FriendRequests.splice(friendReqInd, 1);
                
            let storeVal = {
                ID: sender.ID,
                Username: sender.Username,
                Avatar: sender.Avatar
            }

            console.log('Post-splice')
            console.log(requested);

            console.log(storeVal);

            requested.Friends = await genUtils.insertSorted(storeVal, requested.Friends);

            console.log(requested);


            updateValues = {
                ':f' : requested.Friends,
                ':r' : requested.FriendRequests
            }

            console.log(updateValues);
            try {
                response = await AccountAPI.Update(requested.ID, updateValues, updateExpression);
                if(response === false){
                    return responseUtil.Build(500, "Could not add friend");
                } else {
                    return responseUtil.Build(200, "Friend added!");
                }
            } catch (err){
                return response.Build(500, err);
            }
        
            
        } else if (request.hasOwnProperty("Remove")){
            let requested
            try {
            requested = await AccountAPI.Get(request.Remove);
            } catch (err){
                return responseUtil.Build(403, "Requested Account does not exist");
            }

            if(requested === false){
                return responseUtil.Build(403, "Requested Account does not exist");
            }

            //If the requested user is not in the sender's friends, 403
            let friendLoc = await genUtils.isInSortedList(requested, sender.Friends);

            if(friendLoc === false){
                return responseUtil.Build(403, "User not in Sender's friend array");
            }

            //Remove the user from the sender's friends
            sender.Friends.splice(friendLoc, 1);
            //Set the request statement
            let requestExpression = 'Set Friends = :f'
            //Set the expression value
            let expressionValue = {
                ':f': sender.Friends
            }

            let response;
            
            //Save to the account
            try {
                response = await AccountAPI.Update(sender.ID, expressionValue, requestExpression);
            
            //Any errors saving to the account
            } catch (err) {
                return responseUtil.Build(500, "Error saving to the sender")
            }
            if(response === false){
                return responseUtil.Build(500, "Error saving to the sender")
            }

            //Set up for removing from the other account
            friendLoc = genUtils.isInSortedList(sender, requested.Friends);

            if(friendLoc === false){
                return responseUtil.Build(403, "Sender not in requested friends");
            }

            //Remove the item
            requested.Friends.splice(friendLoc, 1);

            //Update the values
            expressionValue[':f'] = requested.Friends;
            //Save to the account
            try {
                response = await AccountAPI.Update(requested.ID, expressionValue, requestExpression);

            //Any errors saving to the account
            } catch (err) {
                return responseUtil.Build(500, "Error saving to the requested")
            }
            if(response === false){
                return responseUtil.Build(500, "Error saving to the requested")
            }

            return responseUtil.Build(200, "Friend removed");
        
        
        } else if (request.hasOwnProperty("RemoveRequest")){
            const updateExpression = "Set FriendRequests=:r"
            //Get the requested user
            let requested
            try {
                requested = await AccountAPI.Get(request.RemoveRequest);
            } catch (err){
                return responseUtil.Build(403, "Requested user does not exist");
            }

            //splice the requested out of the friend request list
            let reqIndex = sender.FriendRequests.findIndex(sentReq => sentReq.ID === requested.ID);
            if(reqIndex === -1){
                return responseUtil.Build(403, "Requested not in sender's friend requests");
            }

            sender.FriendRequests.splice(reqIndex, 1);

            //Update the values
            let updateValues = {
                ':r': sender.FriendRequests
            };

            //Save the item
            let response
            try {
                response = await AccountAPI.Update(sender.ID, updateValues, updateExpression);
                //If it could not save
            } catch (err) {
                return responseUtil.Build(500, "Could not save to sender");
            }
            if (response === false){
                return responseUtil.Build(500, "Could not save to sender");
            }

            //Repeat on the other user
            reqIndex = requested.FriendRequests.findIndex(i => i.ID === sender.ID);

            if(reqIndex === -1){
                return responseUtil.Build (403, "Sender not in requested friend requests");
            }
            
            requested.FriendRequests.splice(reqIndex, 1);

            //Update the values
            updateValues = {
                ':r': requested.FriendRequests
            };

            //Try to save it
            try {
                response = await AccountAPI.Update(requested.ID, updateValues, updateExpression);
            } catch (err) {
                return responseUtil.Build(500, "Cannot save to requested");
            }
            if (response === false){
                return responseUtil.Build(500, "Cannot save to requested");
            }

            return responseUtil.Build(200, "Friend requests removed");
        }
    }
};