/*
  This file specifically exports a function that takes a String and simply
  logs it to the console and handles other appropriate logging stuff. This is
  simply for code organization and having a single place to silence the server.
*/

module.exports = function(value) {
  console.log(new Date() + ': ' + value);
};
