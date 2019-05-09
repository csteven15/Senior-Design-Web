const mongoose = require('mongoose');
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

const permitTypeSchema = new mongoose.Schema({
  permitType: {
    type: String,
    required: true,
    validate: {
      isAsync: true,
      validator: validatePermitType,
      message: 'General validation failure occurred for permit type!',
    },
  },
  spaceNumber: {
    type: Number,
    required: false,
    min: 0,
    max: 1000000000,
  },
});

module.exports = permitTypeSchema;
