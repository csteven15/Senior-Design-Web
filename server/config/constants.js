/*
  This file contains constants used throughout the rest of the server code.
*/

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const keys = require('./keys');
const AWS = require('aws-sdk');
AWS.config.update(keys.awsSdkInformation);
const stripe = require('stripe')(keys.stripeKey);

const globalHelper = require('../helpers/GlobalHelper');

function calculateMaximumYearlyPrice(dailyPriceInCents) {
  //YP <= DP * (2 * sqrt(365) - 1)
  return dailyPriceInCents * (2 * Math.sqrt(365) - 1);
}

function calculatePermitPrice(permitType, startDate, expirationDate) {
  return new Promise(function(fulfill, reject) {
    // First we need to get permitTypes
    globalHelper
      .fetchGlobal('permitTypes')
      .then(permitTypes => {
        // Transform into mapping
        let pt = {};
        permitTypes.forEach(element => {
          pt[element.permitType] = element;
        });

        // Is permitType passed to us valid?
        if (permitType in pt) {
          let daysCoveredByPermit = Math.ceil((expirationDate - startDate) / (1000 * 60 * 60 * 24));

          let dp = pt[permitType].priceOneDay;
          let yp = pt[permitType].priceOneYear;
          let alpha = (yp - dp) / (Math.sqrt(365) - 1);
          let beta = dp - alpha;

          let total = Math.ceil(alpha * Math.sqrt(daysCoveredByPermit) + beta);
          fulfill(total);
        } else {
          reject(2); // Invalid permit type supplied
        }
      })
      .catch(() => {
        reject(1); // Global lookup failed
      });
  });
}

module.exports = {
  userLevels: {
    administrator: 300,
    enforcer: 200,
    standard: 100,
  },
  userPool: new AmazonCognitoIdentity.CognitoUserPool(keys.cognitoPoolData),
  aws: AWS,
  cognitoIdentityServiceProvider: new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18' }),
  stripe: stripe,
  userDirectlySettableAttributes: {
    firstName: true,
    lastName: true,
    middleInitial: true,
    phoneNumber: true,
    addressLine1: true,
    addressLine2: true,
    city: true,
    state: true,
    zipCode: true,
  },
  userAdminSettableAttributes: {
    allowedPermits: true,
    accountLevel: true,
    swapsAllowed: true,
  },
  calculatePermitPrice: calculatePermitPrice,
  calculateMaximumYearlyPrice: calculateMaximumYearlyPrice,
};
