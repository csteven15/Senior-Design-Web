/* This is a separate tool for aiding in server development! */
global.fetch = require('node-fetch');
const faker = require('faker');
const constants = require('../config/constants');
const keys = require('../config/keys');
const mongoose = require('mongoose');
const UserModel = require('../models/UserModel');

const token =
  'eyJraWQiOiJwNStCWk9sUGFyVExpVVEyc1NubVBYMHFcL0Q5clphbmFxc3kzK0I4ZjVaRT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIyNDliNWUxZS1hM2I4LTRhZjAtOGFjYy1mYjZhOTI4MmY0ZGQiLCJldmVudF9pZCI6IjViNzY1YzQzLTNmZDgtMTFlOS05ZTExLWFiYWFkMmRhMDNjNSIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE1NTE4NTM0MDksImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTIuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0yX3dLZmw0SngybSIsImV4cCI6MTU1MTg1NzAwOSwiaWF0IjoxNTUxODUzNDA5LCJqdGkiOiJkNTEzNzdkMy1iZTMwLTQ2YjMtYWFhNC0wYTQ5N2UwYTdjMjgiLCJjbGllbnRfaWQiOiIxcWVmMW82MWhtajYwMGhhZDYxMTQ1N2hmOSIsInVzZXJuYW1lIjoidm50QWRtaW5pc3RyYXRvciJ9.isqbEAir0LJOB_Vlpzy4LcaZH-Wj1zNdviaHAGcP5WHyarjLsjFuBBclpBPE2FwMqll_Tto2PBaCTUP6cKGerSkObwu6gYhiKk5xwcsb-GlG44mYRD89QsNYYqpQVMVJbzA6g1TYwjJpxNUDRgqLtJLCvMVf4CUcq30U6fXwASk2e9ov-MvdCf9TliCb60yyF2m9Bqv0YbI3jHxc4hNaVvr0nG580YDl8g_Uh0Obt06nzyXrKqCYPbMfqN2hvmnEoz0uNVIKT9Ib2rH0tEhvFFLS8tloGOVLkviSKBTMqfEpbZZwyEr_22iexMg4tCurdsFDR4fdxqVP8RnL-46NOA';

// Connect to database
mongoose
  .connect(keys.mongoURI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
  })
  .catch(error => {
    console.log('Failed to connect to MongoDB: ' + error);
  });

function makeUsername() {
  var text = '';
  var possibleChar = 'abcdefghijklmnopqrstuvwxyz';
  var possibleNum = '0123456789';

  for (var i = 0; i < 2; i++) text += possibleChar.charAt(Math.floor(Math.random() * possibleChar.length));
  for (var i = 0; i < 6; i++) text += possibleNum.charAt(Math.floor(Math.random() * possibleNum.length));

  return text;
}

function getState() {
  var possibleStates = [
    'AL',
    'AK',
    'AZ',
    'AR',
    'CA',
    'CO',
    'CT',
    'DE',
    'FL',
    'GA',
    'HI',
    'ID',
    'IL',
    'IN',
    'IA',
    'KS',
    'KY',
    'LA',
    'ME',
    'MD',
    'MA',
    'MI',
    'MN',
    'MS',
    'MO',
    'MT',
    'NE',
    'NV',
    'NH',
    'NJ',
    'NM',
    'NY',
    'NC',
    'ND',
    'OH',
    'OK',
    'OR',
    'PA',
    'RI',
    'SC',
    'SD',
    'TN',
    'TX',
    'UT',
    'VT',
    'VA',
    'WA',
    'WV',
    'WI',
    'WY',
  ];

  return possibleStates[Math.floor(Math.random() * possibleStates.length)];
}

function makeTag() {
  var text = '';
  var possibleChar = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (var i = 0; i < Math.floor(Math.random() * 5) + 3; i++) text += possibleChar.charAt(Math.floor(Math.random() * possibleChar.length));

  return text;
}

//28.605744, -81.206419
//28.597637, -81.193879
function makeLatitude() {
  let lowerLat = 28.597637;
  let higherLat = 28.605744;
  let difference = higherLat - lowerLat;
  let result = lowerLat + difference * Math.random();
  return result;
}

function makeLongitude() {
  let lowerLat = -81.206419;
  let higherLat = -81.193879;
  let difference = higherLat - lowerLat;
  let result = lowerLat + difference * Math.random();
  return result;
}

function makeLatLonAround(center, diffPercent) {
  let trueDiffMax = 0.012 * diffPercent;
  return [center[0] + (Math.random() * 2 * trueDiffMax - trueDiffMax), center[1] + (Math.random() * 2 * trueDiffMax - trueDiffMax)];
}

function createFakeUsers(token, count) {
  for (let i = 0; i < count; i++) {
    fetch('https://virtuallynotag.com/api/users/initializeNewUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        username: makeUsername(),
        password: 'password',
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        emailAddress: faker.internet.email(),
        phoneNumber: faker.phone.phoneNumber(),
        addressLine1: faker.address.streetAddress(),
        city: faker.address.city(),
        state: getState(),
        zipCode: faker.address.zipCode(),
        accountLevel: 100,
        allowedPermits: [{ permitType: 'D' }],
      }),
    })
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        console.log('Got Data: ' + JSON.stringify(data));
      });
  }
}

function deleteAllUsersExceptAdmin(skipList) {
  UserModel.find({}, function(error, userModels) {
    if (error) {
      console.log('Failed to get users list');
    } else {
      console.log('Got users list!');
      for (let i = 0; i < userModels.length; i++) {
        if (userModels[i].username === 'vntAdministrator') {
          console.log('Skipping admin account!');
          continue;
        }

        // Not admin
        console.log('Nuking ' + userModels[i].username);
        constants.cognitoIdentityServiceProvider.adminDeleteUser(
          {
            UserPoolId: keys.cognitoPoolData.UserPoolId,
            Username: userModels[i].username,
          },
          function(err, data) {
            if (err) {
              console.log('~~~Failed to delete ' + userModels[i].username + ' from user pool! ' + err);
            } else {
              // Success in deleting from user pool, now clean up database entry!
              console.log('Successfully deleted ' + userModels[i].username + ' from user pool.');
              UserModel.findOneAndDelete({ username: userModels[i].username }, function(err, doc) {
                if (err) {
                  console.log('~~~Failed to delete ' + userModels[i].username + ' from database! ' + err);
                } else {
                  console.log('Successfully deleted ' + userModels[i].username + ' from database.');
                }
              });
            }
          }
        );
      }
    }
  });
}

function addRandomViolations(token, count) {
  for (let i = 0; i < count; i++) {
    fetch('http://localhost:8080/api/violations/addViolation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        tag: makeTag(),
        state: faker.address.state(),
        latitude: makeLatitude(),
        longitude: makeLongitude(),
        altitude: 3.1415926,
      }),
    })
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        console.log('Got Data: ' + JSON.stringify(data));
      });
  }
}

function addRandomViolationsAround(token, count, center) {
  for (let i = 0; i < count; i++) {
    let latlon = makeLatLonAround(center, 0.05);
    fetch('http://localhost:8080/api/violations/addViolation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        tag: makeTag(),
        state: 'FL',
        latitude: latlon[0],
        longitude: latlon[1],
        altitude: 3.1415926,
      }),
    })
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        console.log('Got Data: ' + JSON.stringify(data));
      });
  }
}

// Call desired function here...
