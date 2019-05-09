/*
  This file contains helper methods for utilizing the authenticated request
  objects passed down after the authentication middleware.
*/

const UserModel = require('../models/UserModel');
const debugPrint = require('../development/DebugPrint');

function isAuthenticated(req) {
  return req.virtuallyNoTag_authenticationInformation != null;
}

/*
  Similar to isAuthenticated except that this will actually respond to the
  request if the user was not authenticated! Expected to be utilized with an
  if statement, such as if(assertAuthenticated(req, res)) { ... }
*/
function assertAuthenticated(req, res) {
  if (isAuthenticated(req)) {
    return true;
  } else {
    res.status(401).json({
      status: 1,
      message: 'You must be authenticated to access this endpoint!',
    });
    return false;
  }
}

/*
  Returns true iff the request is authenticated and the authenticated user's
  username matches the argument [username]. Returns false otherwise.
*/
function isAuthenticatedAs(req, username) {
  if (isAuthenticated(req)) {
    if (getUsername(req) === username) {
      return true;
    } else {
      return false;
    }
  }
}

/*
  Returns the authenticated user's username, or null if the request isn't
  authenticated.
*/
function getUsername(req) {
  if (isAuthenticated(req)) {
    return req.virtuallyNoTag_authenticationInformation.response.username;
  }
  return null;
}

function checkUserLevel(req, minimumRequiredAccountLevel, callback) {
  debugPrint('Checking user level of ' + getUsername(req) + ' >= ' + minimumRequiredAccountLevel);
  UserModel.findOne({ username: getUsername(req) }, function(error, userModel) {
    if (error) {
      debugPrint('User is NOT authorized due to error: ' + error);
      callback(false);
    } else if (userModel === null) {
      debugPrint('User is NOT authorized due to not existing!');
      callback(false);
    } else if (userModel.accountLevel >= minimumRequiredAccountLevel) {
      debugPrint('User is authorized with account level of ' + userModel.accountLevel);
      callback(true);
    } else {
      debugPrint('User is NOT authorized with account level of ' + userModel.accountLevel);
      callback(false);
    }
  });
}

module.exports = {
  isAuthenticated: isAuthenticated,
  assertAuthenticated: assertAuthenticated,
  getUsername: getUsername,
  isAuthenticatedAs: isAuthenticatedAs,
  checkUserLevel: checkUserLevel,
};
