const express = require('express');

const debugPrint = require('../../development/DebugPrint');
const amh = require('../../middleware/AuthenticationMiddlewareHelper');
const inputChecker = require('../../helpers/InputChecker');
const constants = require('../../config/constants');
const globalHelper = require('../../helpers/GlobalHelper');

const router = express.Router();

router.get('/getVehicleMakesList', function(req, res) {
  globalHelper
    .fetchGlobal('vehicleMakesList')
    .then(vehicleMakesList => {
      res.json({
        data: vehicleMakesList,
      });
    })
    .catch(() => {
      res.status(400).json({
        status: 1,
        message: 'Global lookup failed!',
      });
    });
});

router.get('/getVehicleColorsList', function(req, res) {
  globalHelper
    .fetchGlobal('vehicleColorsList')
    .then(vehicleColorsList => {
      res.json({
        data: vehicleColorsList,
      });
    })
    .catch(() => {
      res.status(400).json({
        status: 1,
        message: 'Global lookup failed!',
      });
    });
});

router.get('/getStatesList', function(req, res) {
  globalHelper
    .fetchGlobal('statesList')
    .then(statesList => {
      res.json({
        data: statesList,
      });
    })
    .catch(() => {
      res.status(400).json({
        status: 1,
        message: 'Global lookup failed!',
      });
    });
});

router.get('/getPermitTypes', function(req, res) {
  globalHelper
    .fetchGlobal('permitTypes')
    .then(permitTypes => {
      res.json({
        data: permitTypes,
      });
    })
    .catch(() => {
      res.status(400).json({
        status: 1,
        message: 'Global lookup failed!',
      });
    });
});

router.get('/calculateMaximumYearlyPrice/:dailyPriceInCents', function(req, res) {
  if (!inputChecker.isIntegerString(req.params.dailyPriceInCents)) {
    res.status(400).json({
      status: 1,
      message: 'Price in cents should be an integer.',
    });
    return;
  }

  res.json({
    result: constants.calculateMaximumYearlyPrice(parseInt(req.params.dailyPriceInCents, 10)),
  });
});

router.get('/calculatePermitPrice/:permitType/:startDate/:expirationDate', function(req, res) {
  if (!inputChecker.isIntegerString(req.params.expirationDate)) {
    res.status(400).json({
      status: 1,
      message: 'Expiration date should be in long form.',
    });
    return;
  }
  let expirationDate = parseInt(req.params.expirationDate);

  if (!inputChecker.isIntegerString(req.params.startDate)) {
    res.status(400).json({
      status: 1,
      message: 'Start date should be in long form.',
    });
    return;
  }
  let startDate = parseInt(req.params.startDate);

  constants
    .calculatePermitPrice(req.params.permitType, startDate, expirationDate)
    .then(price => {
      res.json({
        data: price,
      });
    })
    .catch(code => {
      res.status(400).json({
        status: 1,
        message: 'Failed to calculate permit price. (' + code + ')',
      });
    });
});

module.exports = router;
