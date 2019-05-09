const mongoose = require('mongoose');
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

const licensePlate = new mongoose.Schema({
  tag: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
    validate: {
      isAsync: true,
      validator: validateState,
      message: 'General validation failure occurred for state!',
    },
  },
});

module.exports = licensePlate;
