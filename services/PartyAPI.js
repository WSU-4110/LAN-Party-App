'use strict';

// Imports
const shortid = require("shortid");
const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");
const { Get } = require("./AccountAPI");

// Updating AWS settings
AWS.config.update({ region: "us-east-2" }); // region
let tableName = 'PARTIES-LAN'; // the name of our account table in the AWS database

module.exports = {

  // SAVE A PARTY //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  Save: async function (ID, PartyInfo) {
    try {
        let dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" }); // connect to the database
        let newParty = PartyInfo;

        // ensure that the party has an ID
        if(!ID){
            ID = shortid.generate();
        }
        newParty.ID = ID;

        // create the parameters for putting into the table
        let params = {
            TableName: tableName,
            Item: newParty
        };

        // put it into the table
        await dynamoDB.put(params).promise();

        // return the party that was inserted.
        return newParty;
    } catch (err) { 
        console.log(err);
        throw err;
    }
  },

  Get: async function(ID){
    try{
      // connect to the database
      let dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" }); 

      // create the parameters for the query
      let params = {
        TableName: tableName,
        Key: { ID: ID },
      };

      //Try to get the party from the table
      let result = await dynamoDB.get(params).promise();

      //If the result isn't empty, return the item
      if(result.Item !== undefined){
        return result.Item;
      }
      //If it is empty, return false
      else {
        return false;
      }

    } catch(err){
      console.log('Party get error:', err);
      return false;
    }
  },
  
  Update: async function(PartyInfo){
    try{
      let dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" }); 

      //Load the parameters into the object
      let params = {
        TableName: tableName,
        Item: PartyInfo
      }
      //Update the item in the table
      dynamoDB.updateItem(params, (err, data) =>{
        //If there was an error
        if (err){
          //Log it, then return false
          console.log('There was an error: ', err);
          return false;
        } else {
          //return the data
          return data;
        }
      })
    } catch(err) {
      console.log('There was an error: ', err);
      return false;
    }
  },

  GetAll: async function(){
    try{
    let dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" }); 
    
    //Grab all the items from the Parties table
    let response = await dynamoDB.scan( {TableName: tableName }).promise();
    
    if(response){
      return response;
    } else {
      console.log('Nothing retrieved from the table.');
      return false;
    }

    } catch(err){
      console.log('there was a fatal error: ', err);
      return false;
    };

  }
};