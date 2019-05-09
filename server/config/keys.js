/*
  This file contains all relevant API key and similar information.

  mongoURI is the URI which specifies MongoDB database's location and
  credentials and database.
*/

let production = {
  mode: 'prod',
  mongoURI: 'mongodb://vntReadWriteUser:akibarlo558@virtuallynotag.com:27127/vntdb',
  cognitoPoolData: {
    UserPoolId: 'us-east-2_wKfl4Jx2m',
    ClientId: '3o5qk5p2ht6u4pq4d57uv47eis',
  },
  awsSdkInformation: {
    accessKeyId: 'AKIAINVNYWLO4WZYMK4A',
    secretAccessKey: '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',
    region: 'us-east-2',
  },
  stripeKey: 'sk_test_8tqhuPaO0Ly6ypvllYBJENUF',
};

let testing = {
  mode: 'test',
  mongoURI: 'mongodb://vntReadWriteUserTest:makimba72@virtuallynotag.com:27127/vntdb_test',
  cognitoPoolData: {
    UserPoolId: 'us-east-2_RgdUBpV52',
    ClientId: '14md4ce92cdt9m0edfl72v3qvq',
  },
  awsSdkInformation: {
    accessKeyId: 'AKIAINVNYWLO4WZYMK4A',
    secretAccessKey: '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',
    region: 'us-east-2',
  },
  stripeKey: 'sk_test_8tqhuPaO0Ly6ypvllYBJENUF',
};

module.exports = production;
