'use strict';

// Imports
const AccountAPI = require("../services/AccountAPI");
const moment = require("moment-timezone");
const responseUtil = require("../utilities/response");
const crypto = require("crypto");

module.exports = {
    Test: async function () {
        try{   
         
            //let response = JSON.parge(event.body);
            let idd = process.env.S3_ACCESS_ID;

            let result = {
                Message: "success!",
                Account: idd
            };
            return responseUtil.Build(204, result);
        } catch (err) {
            return responseUtil.Build(500, { Message: err.message });
        }
    },

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
                response.Message = "Account updated!";
                return responseUtil.Build(200, response);
            } return responseUtil.Build(500, { Message: "No Updates Were Requested." }); // else, return an error
        } catch (err) {
            return responseUtil.Build(500, { Message: err.message });
        }
    }
};