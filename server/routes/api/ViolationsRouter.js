const express = require('express');

const debugPrint = require('../../development/DebugPrint');
const ViolationModel = require('../../models/ViolationModel');
const inputChecker = require('../../helpers/InputChecker.js');
const amh = require('../../middleware/AuthenticationMiddlewareHelper');
const constants = require('../../config/constants');

const router = express.Router();

router.post('/addViolation', function(req, res) {
  amh.checkUserLevel(req, constants.userLevels.enforcer, function(isAllowed) {
    if (!isAllowed) {
      res.json({
        status: 1,
        message: 'Only enforcers and above can create violations.',
      });
      return;
    }

    let violation = new ViolationModel();
    violation.issuer = amh.getUsername(req);
    violation.licensePlate = {
      tag: req.body.tag,
      state: req.body.state,
    };
    violation.date = new Date();
    violation.requiredPermitType = req.body.requiredPermitType;
    violation.location = {
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      altitude: req.body.altitude,
    };
    violation.save(function(err) {
      if (err) {
        res.status(400).json({
          status: 1,
          message: 'Failed to add violation: ' + err,
        });
        return;
      }

      // We're good!
      res.json({
        status: 0,
        message: 'Violation added successfully!',
      });
    });
  });
});

// Expects query parameters for start date long end date long
router.get('/fetchViolations', function(req, res) {
  if (!inputChecker.isIntegerString(req.query.startDate)) {
    res.status(400).json({
      status: 1,
      message: 'startDate must be a date in long format!',
    });
  }

  if (!inputChecker.isIntegerString(req.query.endDate)) {
    res.status(400).json({
      status: 1,
      message: 'endDate must be a date in long format!',
    });
  }

  amh.checkUserLevel(req, constants.userLevels.administrator, function(isAllowed) {
    if (!isAllowed) {
      res.status(400).json({
        status: 1,
        message: 'Only administrators can use this endpoint.',
      });
      return;
    }

    // We're allowed!
    ViolationModel.find({ date: { $gte: req.query.startDate, $lte: req.query.endDate } }, function(error, results) {
      if (error || results === null) {
        res.status(400).json({
          status: 1,
          message: 'Failed to find relevant violations.',
        });
      }
      res.json({ results: results });
    });
  });
});

module.exports = router;
