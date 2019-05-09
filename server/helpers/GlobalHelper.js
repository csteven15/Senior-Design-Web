/*
  This is just a few helper methods for working with database-backed globals.
*/

const debugPrint = require('../development/DebugPrint');
const GlobalModel = require('../models/GlobalModel');

// Fetch the global from the database, return a promise which passes the value of the global through.
function fetchGlobal(name) {
  return new Promise(function(fulfill, reject) {
    GlobalModel.findOne({ name: name }, function(error, globalModel) {
      if (error || globalModel === null) {
        debugPrint('Failed to look up global by name ' + name);
        reject(error);
      } else {
        debugPrint('Looked up global by name ' + name);
        fulfill(globalModel.value);
      }
    });
  });
}

// Fetch the globals from the database, return a promise which passes the values of the globals through.
function fetchGlobals() {
  let orArray = [];
  for (let i = 0; i < arguments.length; i++) {
    orArray.push({
      name: arguments[i],
    });
  }
  return new Promise(function(fulfill, reject) {
    GlobalModel.find({ $or: orArray }, { _id: 0, __v: 0 }, function(error, globalModel) {
      if (error || globalModel === null) {
        debugPrint('Failed to look up globals: ' + arguments);
        reject(error);
      } else {
        debugPrint('Looked up many globals: ' + arguments);
        let resultingObject = {};
        for (let i = 0; i < globalModel.length; i++) {
          resultingObject[globalModel[i].name] = globalModel[i].value;
        }
        fulfill(resultingObject);
      }
    });
  });
}

// Add or overwrite the global with the provided value. Return a promise.
function putGlobal(name, value) {
  return new Promise(function(fulfill, reject) {
    GlobalModel.findOneAndUpdate({ name: name }, { $set: { value: value } }, { runValidators: true, upsert: true, new: true }, function(error, result) {
      if (error || result === null) {
        reject(error);
      } else {
        fulfill();
      }
    });
  });
}

function getAndIncrementGlobal(name, amount) {
  return new Promise(function(fulfill, reject) {
    GlobalModel.findOneAndUpdate({ name: name }, { $inc: { value: amount } }, { runValidators: true, new: true }, function(error, result) {
      if (error || result === null || result.value === null) {
        reject(error);
      } else {
        fulfill(result.value);
      }
    });
  });
}

module.exports = {
  fetchGlobal: fetchGlobal,
  putGlobal: putGlobal,
  getAndIncrementGlobal: getAndIncrementGlobal,
  fetchGlobals: fetchGlobals,
};
