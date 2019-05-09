/*
  This file contains a helper method that initializes the first administrator
  user into the database, since without any existing administrator user, no
  other users can be created.
*/

const debugPrint = require('./DebugPrint');
const constants = require('../config/constants');
const UserModel = require('../models/UserModel');
const permitTypeSchema = require('../models/PermitTypeSchema');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

function initializeAdministratorUser() {
  debugPrint('Initializing the administrator user!');
  let adminUser = new UserModel();
  adminUser.username = 'vntAdministrator';
  adminUser.firstName = 'AdministratorFN';
  adminUser.lastName = 'AdministratorLN';
  adminUser.middleInitial = 'M';
  adminUser.emailAddress = 'admin@website.com';
  adminUser.phoneNumber = '1234567890';
  adminUser.addressLine1 = '123 Admin Drive';
  adminUser.addressLine2 = 'Address Line Two';
  adminUser.city = 'Root City';
  adminUser.state = 'FL';
  adminUser.zipCode = '12345';
  adminUser.accountLevel = constants.userLevels.administrator;
  adminUser.allowedPermits = [
    { permitType: 'A', spaceNumber: 144 },
    { permitType: 'B' },
    { permitType: 'C' },
    { permitType: 'D' },
    { permitType: 'R' },
    { permitType: 'RL' },
    { permitType: 'KP' },
  ];
  adminUser.swapsAllowed = 5;

  // Create the user in our user pool...
  var attributeList = [];
  var dataEmail = {
    Name: 'email',
    Value: adminUser.emailAddress,
  };
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail));
  constants.userPool.signUp(adminUser.username, 'password', attributeList, null, function(err, result) {
    if (err) {
      debugPrint('Failed to initialize the administrator user in the user pool: ' + err);
      return;
    } else {
      // They're created in the user pool, so enter them into the database.
      adminUser.save(function(error) {
        if (error) {
          debugPrint('Failed to initialize the administrator user in the database: ' + error);
        } else {
          debugPrint('Administrator user initialized in user pool and database!');
        }
      });
    }
  });
}

module.exports = initializeAdministratorUser;
