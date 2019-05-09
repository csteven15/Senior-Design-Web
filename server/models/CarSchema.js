const mongoose = require('mongoose');

const licensePlateSchema = require('./LicensePlateSchema');
const globalHelper = require('../helpers/GlobalHelper');

function validateMake(value, callback) {
  globalHelper
    .fetchGlobal('vehicleMakesList')
    .then(vehicleMakesList => {
      callback(vehicleMakesList.indexOf(value) >= 0, 'Invalid vehicle make was supplied! Must be one of ' + vehicleMakesList);
    })
    .catch(() => {
      callback(false, 'A server error occured and make validation could not be performed.');
    });
}

function validateColor(value, callback) {
  globalHelper
    .fetchGlobal('vehicleColorsList')
    .then(vehicleColorsList => {
      callback(vehicleColorsList.indexOf(value) >= 0, 'Invalid vehicle color was supplied! Must be one of ' + vehicleColorsList);
    })
    .catch(() => {
      callback(false, 'A server error occured and color validation could not be performed.');
    });
}

const carSchema = new mongoose.Schema({
  licensePlate: {
    type: licensePlateSchema,
    required: true,
  },
  make: {
    type: String,
    required: true,
    validate: {
      isAsync: true,
      validator: validateMake,
      message: 'General validation failure occurred for vehicle make!',
    },
  },
  model: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
    min: 1800,
    max: 1000000,
  },
  color: {
    type: String,
    required: true,
    validate: {
      isAsync: true,
      validator: validateColor,
      message: 'General validation failure occurredfor vehicle color!',
    },
  },
});

module.exports = carSchema;
