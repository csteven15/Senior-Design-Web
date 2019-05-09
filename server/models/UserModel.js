const mongoose = require('mongoose');

const carSchema = require('./CarSchema');
const permitTypeSchema = require('./PermitTypeSchema');
const globalHelper = require('../helpers/GlobalHelper');

function validateState(value, callback) {
  globalHelper
    .fetchGlobal('statesList')
    .then(statesList => {
      callback(statesList.indexOf(value) >= 0, 'Invalid license plate state was supplied! Must be one of ' + statesList);
    })
    .catch(() => {
      callback(false, 'A server error occured and state validation could not be performed.');
    });
}

// Note that cars, permits, and violations are implicit.
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    minlength: 1,
    maxlength: 256,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    minlength: 1,
    maxlength: 256,
    required: true,
  },
  lastName: {
    type: String,
    minlength: 1,
    maxlength: 256,
    required: true,
  },
  middleInitial: {
    type: String,
    minlength: 1,
    maxlength: 1,
    required: false,
  },
  emailAddress: {
    type: String,
    minlength: 1,
    maxlength: 256,
    required: true,
  },
  phoneNumber: {
    type: String,
    minlength: 1,
    maxlength: 32,
    required: true,
  },
  addressLine1: {
    type: String,
    minlength: 1,
    maxlength: 256,
    required: true,
  },
  addressLine2: {
    type: String,
    minlength: 1,
    maxlength: 256,
    required: false,
  },
  city: {
    type: String,
    minlength: 1,
    maxlength: 256,
    required: true,
  },
  state: {
    type: String,
    minlength: 1,
    maxlength: 256,
    required: true,
    validate: {
      isAsync: true,
      validator: validateState,
      message: 'General validation failure occurred for state!',
    },
  },
  zipCode: {
    type: String,
    minlength: 1,
    maxlength: 32,
    required: true,
  },
  accountLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 1000000000,
  },
  allowedPermits: {
    type: [permitTypeSchema],
    required: true,
  },
  cars: {
    type: [carSchema],
    required: true,
  },
  swapsAllowed: {
    type: Number,
    min: 0,
    max: 1000,
    required: true,
  },
});

userSchema.index({ username: 1 });

module.exports = mongoose.model('User', userSchema);
