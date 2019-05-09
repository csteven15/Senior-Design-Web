/*
  This file exports a function representing a piece of Express middleware. The
  middleware will, provided the request, use cognito-express to determine if
  the JWT in the header represents a valid, authenticated user. If it is a valid
  user, then this middleware will modify the request object so that handlers
  further down in the pipeline will be able to easily access information about
  the authenticated user.
*/

const CognitoExpress = require('cognito-express');

const debugPrint = require('../development/DebugPrint');

const keys = require('../config/keys');

const cognitoExpressInstance = new CognitoExpress({
  region: 'us-east-2',
  cognitoUserPoolId: keys.cognitoPoolData.UserPoolId,
  tokenUse: 'access', //Possible Values: access | id
  tokenExpiration: 3600000, //Up to default expiration of 1 hour (3600000 ms)
});

module.exports = function(req, res, next) {
  debugPrint('Processing request in authentication middleware...');

  // Modify the request object so that it has our relevant authentication
  // information

  // Do we have an access token to play with?
  if ('authorization' in req.headers && req.headers.authorization !== null && req.headers.authorization.startsWith('Bearer ')) {
    // Yes we do.... but is it valid?
    let accessTokenJWT = req.headers.authorization.slice(7);
    cognitoExpressInstance.validate(accessTokenJWT, function(err, response) {
      if (err) {
        // Straight up reject this entire request!
        debugPrint('Authorization failure! ' + JSON.stringify(err));
        res.status(401).json({
          status: 1,
          message: 'Expired, invalid, or malformed authorization header in request!',
        });
      } else {
        // No issue, update and proceed
        debugPrint('Successful authorization: ' + JSON.stringify(response));
        debugPrint('Raw token is ' + accessTokenJWT);
        req.virtuallyNoTag_authenticationInformation = {
          accessTokenJWT: accessTokenJWT,
          response: response,
        };
        next();
      }
    });
  } else {
    // No we do not! Proceed as unauthenticated.
    debugPrint('Proceeding unauthenticated or unauthorized...');
    req.virtuallyNoTag_authenticationInformation = null;
    next();
  }
};
