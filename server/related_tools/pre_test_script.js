global.fetch = require('node-fetch');
const keys = require('../config/keys');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const constants = require('../config/constants');

const UserModel = require('../models/UserModel');
const permitTypeSchema = require('../models/PermitTypeSchema');

const mongoose = require('mongoose');

function initializeAdministratorUser(callback) {
  console.log('Initializing the administrator user!');
  let user = new UserModel();
  user.username = 'vntAdministrator';
  user.firstName = 'AdministratorFN';
  user.lastName = 'AdministratorLN';
  user.middleInitial = 'A';
  user.emailAddress = 'admin@website.com';
  user.phoneNumber = '1234567890';
  user.addressLine1 = '123 Admin Drive';
  user.addressLine2 = 'Address Line Two Admin';
  user.city = 'Admin City';
  user.state = 'FL';
  user.zipCode = '12345';
  user.accountLevel = constants.userLevels.administrator;
  user.allowedPermits = [
    { permitType: 'A', spaceNumber: 144 },
    { permitType: 'B' },
    { permitType: 'C' },
    { permitType: 'D' },
    { permitType: 'R' },
    { permitType: 'RL' },
    { permitType: 'KP' },
  ];
  user.swapsAllowed = 5;

  // Create the user in our user pool...
  var attributeList = [];
  var dataEmail = {
    Name: 'email',
    Value: user.emailAddress,
  };
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail));
  constants.userPool.signUp(user.username, 'password', attributeList, null, function(err, result) {
    if (err) {
      console.log('Failed to initialize the administrator user in the user pool: ' + err);
      callback();
    } else {
      // They're created in the user pool, so enter them into the database.
      user.save(function(error) {
        if (error) {
          console.log('Failed to initialize the administrator user in the database: ' + error);
        } else {
          console.log('Administrator user initialized in user pool and database!');
        }
        callback();
      });
    }
  });
}

function initializeEnforcerUser(callback) {
  console.log('Initializing the enforcer user!');
  let user = new UserModel();
  user.username = 'vntEnforcer';
  user.firstName = 'EnforcerFN';
  user.lastName = 'EnforcerLN';
  user.middleInitial = 'E';
  user.emailAddress = 'enforcer@website.com';
  user.phoneNumber = '0123456789';
  user.addressLine1 = '123 Enforcer Drive';
  user.addressLine2 = 'Address Line Two Enforcer';
  user.city = 'Enforcer City';
  user.state = 'GA';
  user.zipCode = '51234';
  user.accountLevel = constants.userLevels.enforcer;
  user.allowedPermits = [{ permitType: 'B' }, { permitType: 'C' }, { permitType: 'D' }];
  user.swapsAllowed = 5;

  // Create the user in our user pool...
  var attributeList = [];
  var dataEmail = {
    Name: 'email',
    Value: user.emailAddress,
  };
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail));
  constants.userPool.signUp(user.username, 'password', attributeList, null, function(err, result) {
    if (err) {
      console.log('Failed to initialize the enforcer user in the user pool: ' + err);
      callback();
    } else {
      // They're created in the user pool, so enter them into the database.
      user.save(function(error) {
        if (error) {
          console.log('Failed to initialize the enforcer user in the database: ' + error);
        } else {
          console.log('Enforcer user initialized in user pool and database!');
        }
        callback();
      });
    }
  });
}

function initializeStandardUser(callback) {
  console.log('Initializing the standard user!');
  let user = new UserModel();
  user.username = 'vntStandard';
  user.firstName = 'StandardFN';
  user.lastName = 'StandardLN';
  user.middleInitial = 'S';
  user.emailAddress = 'standard@website.com';
  user.phoneNumber = '9012345678';
  user.addressLine1 = '123 Standard Drive';
  user.addressLine2 = 'Address Line Two Standard';
  user.city = 'Standard City';
  user.state = 'NY';
  user.zipCode = '45123';
  user.accountLevel = constants.userLevels.standard;
  user.allowedPermits = [{ permitType: 'D' }];
  user.swapsAllowed = 5;

  // Create the user in our user pool...
  var attributeList = [];
  var dataEmail = {
    Name: 'email',
    Value: user.emailAddress,
  };
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail));
  constants.userPool.signUp(user.username, 'password', attributeList, null, function(err, result) {
    if (err) {
      console.log('Failed to initialize the standard user in the user pool: ' + err);
      callback();
    } else {
      // They're created in the user pool, so enter them into the database.
      user.save(function(error) {
        if (error) {
          console.log('Failed to initialize the standard user in the database: ' + error);
        } else {
          console.log('Standard user initialized in user pool and database!');
        }
        callback();
      });
    }
  });
}

function printToken(username) {
  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
    Username: username,
    Password: 'password',
  });

  var userData = {
    Username: username,
    Pool: constants.userPool,
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function(result) {
      console.log(username + ' access token = ' + result.getAccessToken().getJwtToken());
      // console.log('id token + ' + result.getIdToken().getJwtToken());
      // console.log('refresh token + ' + result.getRefreshToken().getToken());
    },
    onFailure: function(err) {
      console.log(err);
    },
  });
}

// Feed me all the tokens!
let readyToClose = false;
mongoose.connect(keys.mongoURI).then(() => {
  console.log('Connected to MongoDB!');
  if (keys.mode !== 'test') {
    console.log('KEYS NOT SET TO TEST MODE, ABORTING');
    return;
  }
  initializeAdministratorUser(() => {
    printToken('vntAdministrator');
    initializeEnforcerUser(() => {
      printToken('vntEnforcer');
      initializeStandardUser(() => {
        printToken('vntStandard');
        setTimeout(() => {
          readyToClose = true;
        }, 1000);
      });
    });
  });
});

(function wait() {
  if (!readyToClose) setTimeout(wait, 1000);
})();
