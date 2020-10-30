'use strict';

// Imports
const ImageAPI = require("../services/ImageAPI");
const responseUtil = require("../utilities/response");
const shortid = require("shortid");

module.exports = {

  // UPLOAD IMAGE //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  Upload: async function (request) {

    let body = JSON.parse(request.body); // parse the request

    return responseUtil.Build(200, ImageAPI.Save(body));
  },

  // Update IMAGE //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  Update: async function (request) {

    let body = JSON.parse(request.body); // parse the request

    return responseUtil.Build(200, ImageAPI.Save(body));
  },
};