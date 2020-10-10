'use strict';

// Imports
const AccountAPI = require("../services/AccountAPI");
const moment = require("moment-timezone");
const responseUtil = require("../utilities/response");

module.exports = {

    // SIGN UP //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    signup: async function (event) {
        try {

            // if nothing was provided in the request, return a 204 HTTPS code (No content)
            if (!event) {
                return {
                    statusCode: 204,
                    message: JSON.stringify("No information was provided with the request!"),
                };
            }
            
            // next parse the request
            let request = JSON.parse(event.body);
            
            // they need to have entered an email, username, and a password
            if (!request.Email) {
                throw new Error("Account Email Required!");
            }

            if (!request.Username) {
                throw new Error("Account Username Required!");
            }

            if (!request.Password) {
                throw new Error("Account Password Required!");
            }

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
            } else {
                throw new Error("Email Already Exists!");
            }
        } catch (err) {
            console.error("New Account Error:", err);
            return responseUtil.Build(500, { Message: err.message });
        }
    },

    // SIGN IN //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    signin: async function (event) {
        try {
            // if nothing was provided in the request, return a 204 HTTPS code (No content)
            if (!event) {
                return {
                    statusCode: 204,
                    message: JSON.stringify("No information was provided with the request!"),
                };
            }
            
            // next parse the request
            let request = JSON.parse(event.body);

            // we need to make sure that an email and password were inputted
            if (!request.Email) {
                throw new Error("Account Email Required!");
            }

            if (!request.Password) {
                throw new Error("Account Password Required!");
            }
            
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
    }
};