const express = require('express');
const bodyParser = require('body-parser');

const debugPrint = require('../../development/DebugPrint');
const authenticationMiddleware = require('../../middleware/AuthenticationMiddleware');
const amh = require('../../middleware/AuthenticationMiddlewareHelper');
const globalHelper = require('../../helpers/GlobalHelper');
const constants = require('../../config/constants');

const usersRouter = require('./UsersRouter');
const permitsRouter = require('./PermitsRouter');
const violationsRouter = require('./ViolationsRouter');
const utilsRouter = require('./UtilsRouter');

const UserModel = require('../../models/UserModel');
const PermitModel = require('../../models/PermitModel').PermitModel;
const ViolationModel = require('../../models/ViolationModel');
const GlobalModel = require('../../models/GlobalModel');

const router = express.Router();

// Middleware to deconstruct the HTTP request body into an JavaScript object
router.use(bodyParser.json());

// Get authentication information from token
router.use(authenticationMiddleware);

// Route functions that are specific to one collection out
router.use('/users', usersRouter);
router.use('/permits', permitsRouter);
router.use('/violations', violationsRouter);
router.use('/utils', utilsRouter);

// Handle functions that are not specifc to one collection

router.get('/fetchGlobal/:name', function(req, res) {
  amh.checkUserLevel(req, constants.userLevels.administrator, function(isAllowed) {
    if (!isAllowed) {
      res.status(400).json({
        status: 1,
        message: 'Only administrators can manipulate globals.',
      });
      return;
    }

    // We're allowed!
    globalHelper
      .fetchGlobal(req.params.name)
      .then(value => {
        res.json({
          value: value,
        });
      })
      .catch(() => {
        res.json({
          value: null,
        });
      });
  });
});

router.post('/putGlobal/:name', function(req, res) {
  amh.checkUserLevel(req, constants.userLevels.administrator, function(isAllowed) {
    if (!isAllowed) {
      res.status(400).json({
        status: 1,
        message: 'Only administrators can manipulate globals.',
      });
      return;
    }

    // We're allowed!
    globalHelper
      .putGlobal(req.params.name, req.body.value)
      .then(() => {
        res.json({
          status: 0,
          message: 'Success!',
        });
      })
      .catch(error => {
        res.status(400).json({
          status: 1,
          message: 'Failed! ' + error,
        });
      });
  });
});

//TODO: remove!
router.post('/testEndpoint', function(req, res) {
  globalHelper
    .fetchGlobals('permitPricesOneDayBeforeTax', 'permitPricesOneYearBeforeTax')
    .then(value => {
      res.json(value);
    })
    .catch(error => {
      res.status(400).json({
        status: 1,
        message: 'Failed! ' + error,
      });
    });
});

module.exports = router;
