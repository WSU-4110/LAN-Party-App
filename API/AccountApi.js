'use strict';

const Joi = require("joi"); // package used for validating data types and patterns (using regex)
const dynamoDB = require("./dynamodb/live_dynamodb"); // DynamoDb instance
const moment = require("moment-timezone"); // for time accuracy

module.exports = {

  signup : async function (event) {

    try {
      
      //event --> carrys all the post parameters were sendiong to this end point ex : event.body.firstName, event.body.LastName, etc...
      if (!event) {
        return {
          statusCode: 204, //if nothing was provided in the request, return a 204 HTTPS code (No content)
          message: JSON.stringify("No information was provided with the request"),
        };
      }
  
      //Next, if there was data provided in the request
      const request_data = JSON.parse(event.body); // parse the data sent to this request (less syntax when we want to access it , ex : request_data.firstName instead of event.body.firstName)
  
      // THEN validate it and verify its credible for our database to accomodate (Using Joi)
      // const schema = Joi.object().keys({
      //   first_name: Joi.string().required(),
      //   last_name: Joi.string().required(),
      //   password: Joi.string().required(), // !! WORKING ON ENCRYPTION ATM !! //
      //   email: Joi.string().email().required(),
      // });
  
      // const { error, value } = schema.validate(request_data, schema); //validate function will either return value if all is validated, or error if 1 of them is invalid
  
      // if (error) {
      //   //if there was an error
      //   //return error to user
      //   return {
      //     statusCode: 400,
      //     body: JSON.stringify("Invalid data parameters"),
      //   };
      // }
  
      request_data.email = request_data.email.toLowerCase()
  
      //next we want to check if this user already has an account with us by using the email GSI we set up in the resources section for the users table (in the serverless.yml file)
      const confirm_non_exsisting_params = {
        TableName: "users", //table we want to query
        Key: {email : request_data.email}, //Key  want to query by
      };

      //Run the query
      const is_exsisting = await dynamoDB
        .get(confirm_non_exsisting_params)
        .promise();

      //if a result was returned and there was atleast 1 record with this email,
      if (is_exsisting && is_exsisting.Item ) {
        return {
          statusCode: 403,
          body: JSON.stringify("Error : User already exists"),
        };
      }

      // if the email doesnt exist in our system, then validate it exists
      console.log("continued");
  
      const current_life_moment = moment() //current time
      .tz("America/Detroit")
      .format("YYYY-MM-DD hh:mm a"); // <-- a for EDT
  
      //if email is valid, then sign user up for our servive !
      const parameters = {
        TableName: "users",
  
        Item: { 
          first_name: request_data.first_name,
          last_name: request_data.last_name,
          email: request_data.email.toLowerCase(),
          password: request_data.password, // !! WORKING ON ENCRYPTION ATM !!
          user_created: current_life_moment,
        },
      };
    
      await dynamoDB.put(parameters).promise(); // database interaction
  
      return {
        statusCode: 200, // new user was successfully created
        body: JSON.stringify(parameters.Item), // return data
      };

    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        body: JSON.stringify(error), //return error
      };
    }   
  },

//************************************************************** */

signin : async function (event) {
  try {
    //event --> carrys all the post parameters were sendiong to this end point ex : event.body.firstName, event.body.LastName, etc...
    if (!event) {
      //if nothing was provided in the request, return a 204 HTTPS code (No content)
      return {
        statusCode: 204,
        message: JSON.stringify("No information was provided with the request"),
      };
    }

    //Next, if there was data provided in the request
    const request_data = JSON.parse(event.body); // parse the data sent to this request (less syntax when we want to access it , ex : request_data.firstName instead of event.body.firstName)

    // THEN validate it and verify its credible for our database to accomodate (Using Joi)
    request_data.email = request_data.email.toLowerCase()

    //next we want to check if this user already has an account with us by using the email GSI we set up in the resources section for the users table (in the serverless.yml file)
    const get_user_by_email = {
      TableName: "users", //table we want to query
      Key: {email : request_data.email}, //Key  want to query by
    };

    //Run the query
    const is_exsisting = await dynamoDB
      .get(get_user_by_email)
      .promise();

    //if a result was returned and there was atleast 1 record with this email,
    if (!is_exsisting && !is_exsisting.Item ) {
      return {
        statusCode: 403,
        body: JSON.stringify("Error : Email not registered - Register for a new acount"),
      };
    }

    if (is_exsisting.Item.password === request_data.password){

      return {
        // new user was successfully created //
        statusCode: 200,
        body: JSON.stringify(is_exsisting.Item), //return data
      };

    }
    else {

      return {
        // new user was successfully created //
        statusCode: 200,
        body: JSON.stringify("Invalid password"), //return data
      };
    }

  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify(error), //return error
    };
  }


}


};