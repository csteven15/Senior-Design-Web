/*
  Returns true iff obj is a string.
*/
function isString(obj) {
  return Object.prototype.toString.call(obj) === '[object String]';
}

function isIntegerString(obj) {
  if (!isString(obj)) return false;
  return new RegExp('^([0-9])+$').test(obj);
}

function isIntegerStringOrEmpty(obj) {
  if (!isString(obj)) return false;
  return new RegExp('^([0-9])*$').test(obj);
}

function isNumber(obj) {
  return typeof obj === 'number';
}

function isInteger(obj) {
  if (!isNumber(obj)) {
    return false;
  }
  return Number.isInteger(obj);
}

/*
  Should return true iff val is a string and val contains only characters in
  [a-z] union [0-9] union [A-Z].
*/
function isAlphanumeric(val) {
  if (!isString(val)) return false;
  return new RegExp('^([a-z]|[A-Z]|[0-9])*$').test(val);
}

function isAlphanumericWithSpaces(val) {
  if (!isString(val)) return false;
  return new RegExp('^([a-z]|[A-Z]|[0-9]|\\s)*$').test(val);
}

function isEmailCharacters(val) {
  if (!isString(val)) return false;
  return new RegExp('^([a-z]|[A-Z]|[0-9]|\\s|@|\\.|_)*$').test(val);
}

/*
  For use checking if an object has a certain key and it is not null,
  or undefined.
*/
function fieldExists(obj, fieldName) {
  return fieldName in obj && obj[fieldName] !== null && obj[fieldName] !== undefined;
}

module.exports = {
  isString: isString,
  isNumber: isNumber,
  isInteger: isInteger,
  isAlphanumeric: isAlphanumeric,
  fieldExists: fieldExists,
  isIntegerString: isIntegerString,
  isIntegerStringOrEmpty: isIntegerStringOrEmpty,
  isAlphanumericWithSpaces: isAlphanumericWithSpaces,
  isEmailCharacters: isEmailCharacters,
};
