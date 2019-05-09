const mongoose = require('mongoose');

const licensePlateSchema = require('./LicensePlateSchema');
const locationSchema = require('./LocationSchema');
const permitTypeSchema = require('./PermitTypeSchema');
const globalHelper = require('../helpers/GlobalHelper');

function validatePermitType(value, callback) {
  globalHelper
    .fetchGlobal('permitTypes')
    .then(permitTypes => {
      let pt = [];
      permitTypes.forEach(element => {
        pt.push(element.permitType);
      });
      callback(pt.indexOf(value) >= 0, 'Invalid permit type was supplied! Must be one of ' + pt);
    })
    .catch(() => {
      callback(false, 'A server error occured and permit type validation could not be performed.');
    });
}

const violationSchema = new mongoose.Schema({
  issuer: {
    type: String,
    required: true,
  },
  licensePlate: {
    type: [licensePlateSchema],
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: locationSchema,
    required: true,
  },
  requiredPermitType: {
    type: String,
    required: true,
    validate: {
      isAsync: true,
      validator: validatePermitType,
      message: 'General validation failure occurred for permit type!',
    },
  },
});

violationSchema.index({ issuer: 1, date: 1 });
violationSchema.index({ date: 1 });

module.exports = mongoose.model('Violation', violationSchema);
