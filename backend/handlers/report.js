'use strict';

// Imports
const shortid = require("shortid");
const AccountAPI = require("../services/AccountAPI");
const ReportAPI = require("../services/ReportAPI");
const moment = require("moment-timezone");
const responseUtil = require("../utilities/response");

module.exports = {

  // REPORT A NEW ACCOUNT //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  NewReport: async function (event) {
    try {
        // if nothing was provided in the request, return a 204 HTTPS code (No content)
        if (!event)
            return responseUtil.Build(500, { Message: "No information was provided with the request!" });

        // next parse the request
        let request = JSON.parse(event.body);

        // they need to have entered an two IDs and a message
        if (!request.ReportedAccountID)
          return responseUtil.Build(500, { Message: "Must include the ID of the account to be reported!" });

        if (!request.AccuserID)
          return responseUtil.Build(500, { Message: "Must include the ID of the account who is making the report!" });

        if (!request.Message)
          return responseUtil.Build(500, { Message: "Please include a message in your report!" });
        
        // let's have a create date for our new report as well as an ID for the report
        request.CreateDate = moment().toISOString();
        request.ID = shortid.generate();

        // validate that both accounts exist
        let exists = await AccountAPI.Get(request.ReportedAccountID);
        if (!exists)
          return responseUtil.Build(500, { Message: "Invalid ID for the user making the report!" });

        let exists2 = await AccountAPI.Get(request.AccuserID);
        if(!exists2)
          return responseUtil.Build(500, { Message: "Invalid ID for the reported user!" });

        let report = await ReportAPI.Create(request);

        if (report) {
          let result = {
              Message: "Report created!",
              Game: request
          };
          return responseUtil.Build(200, result);
        } else return responseUtil.Build(500, { Message: "Report Save Failed" });

    } catch (err) {
        console.log(err);
        return responseUtil.Build(500, { Message: err.message });
    }
},

// // REPORT A NEW ACCOUNT //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   NewReport: async function (event) {
//     try {
//       // if nothing was provided in the request, return a 204 HTTPS code (No content)
//       if (!event)
//         return responseUtil.Build(204, { Message: "No information was provided with the request!" });

//       // next parse the request
//       let request = JSON.parse(event.body);

//       // they need to have entered an email, username, and a password
//       if (!request.ReportedAccountID)
//         throw new Error("Must include the ID of the account to be reported!");

//       if (!request.AccuserID)
//         throw new Error("Must include the ID of the account who is making the report!");

//       // let's have a create date for our new report as well as an ID for the report
//       request.CreateDate = moment().toISOString();
//       request.ID = shortid.generate();

//       // check to make sure that this ID is not already used
//       while(ReportAPI.Get(request.ID))
//         request.ID = shortid.generate();

//       // validate that both accounts exist
//       let exists = await AccountAPI.Get(request.ReportedAccountID);
//       if (!exists)
//         throw new Error("Invalid ID for the user making the report!");

//       let exists2 = await AccountAPI.Get(request.AccuserID);
//       if(!exists2)
//         throw new Error("Invalid ID for the reported user!");

//       // save to the database
//       let dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" }); // connect to the database

//       const parameters = {
//         TableName: tableName,
//         Item: request,
//       };

//       let NewReport = await dynamoDB.put(parameters).promise();

//       let result = {
//         Message: "Report created!",
//         Report: NewReport
//       };

//       return responseUtil.Build(200, result);
//     } catch (err) {
//       console.log(err);
//       return responseUtil.Build(500, { Message: err.message });
//     }
//   },

  // VIEW A REPORT //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ViewReport: async function (event) {
    try {
        // grab the ID
        let request = {
            ID: event.pathParameters.ID
        };

        // we need to make sure that we were give an ID
        if (!request.ID)
            throw new Error("Report ID Required!");

        // return the account information
        let report = await ReportAPI.Get(request.ID);

        // if we returned with success, then create a result object
        if (report.ID) {
            let result = {
                Message: "Returning the report!",
                Report: report
            };
            return responseUtil.Build(200, result); // send the result
        } else return responseUtil.Build(500, { Message: "No Report With That ID." }); // else, return an error
    } catch (err) {
        console.log(err);
        return responseUtil.Build(500, { Message: err.message });
    }
  },

  // VIEW ALL REPORTS //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ViewAll: async function () {
      try {
          // return the game information
          let reports = await ReportAPI.GetAll();
          
          // if we returned with success
          if (reports) {
              return responseUtil.Build(200, reports); // then, send the result
          } else return responseUtil.Build(500, { Message: "No Reports Exist." }); // else, return an error
      } catch (err) {
          console.log(err);
          return responseUtil.Build(500, { Message: err.message });
      }
  }
};