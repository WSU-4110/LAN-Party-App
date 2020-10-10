module.exports = {
  Build: function (status, message) {
    return {
      statusCode: status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(message, null, 2),
    };
  },
};