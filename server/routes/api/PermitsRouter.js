const express = require('express');

const debugPrint = require('../../development/DebugPrint');
const UserModel = require('../../models/UserModel');
const PermitModel = require('../../models/PermitModel').PermitModel;
const amh = require('../../middleware/AuthenticationMiddlewareHelper');
const inputChecker = require('../../helpers/InputChecker');
const constants = require('../../config/constants');
const globalHelper = require('../../helpers/GlobalHelper');
const keys = require('../../config/keys.js');

const router = express.Router();

/*
  Used only in /purchasePermit endpoint. Exists to reduce duplicate code.
  See that endpoint for example usage.
*/
function completePurchasePermit(req, res, userModel) {
  // Determine if allowed. All users can buy Visitor.
  let allowed = req.body.permitType.permitType === 'Visitor';
  if (!allowed && amh.isAuthenticated(req)) {
    // Go through allowed permits and see if it matches
    for (let i = 0; i < userModel.allowedPermits.length; i++) {
      let permitType = userModel.allowedPermits[i];
      if (permitType.permitType === req.body.permitType.permitType && permitType.spaceNumber === req.body.permitType.spaceNumber) {
        allowed = true;
        break;
      }
    }
  }
  if (!allowed) {
    res.status(400).json({
      status: 1,
      message: 'Not allowed to purchase a permit of this type!',
    });
    return;
  } else {
    // User is ok to purchase a permit of this type!

    // Validate BEFORE charging stripe!
    let permitModel = new PermitModel();
    if (amh.isAuthenticated(req)) permitModel.owner = amh.getUsername(req);
    permitModel.car = req.body.car;
    permitModel.permitType = req.body.permitType;
    permitModel.purchasePrice = req.body.purchasePrice;
    permitModel.purchaseDate = Date.now();
    permitModel.startDate = req.body.startDate;
    permitModel.expirationDate = req.body.expirationDate;

    permitModel.validate(function(error) {
      if (error) {
        res.status(400).json({
          status: 1,
          message: 'Validation failed: ' + error,
        });
        return;
      }

      // Validation success!

      // What about the price? Is it correct?
      constants
        .calculatePermitPrice(req.body.permitType.permitType, req.body.startDate, req.body.expirationDate)
        .then(correctPrice => {
          if (correctPrice !== req.body.purchasePrice) {
            debugPrint('Start Date: ' + req.body.startDate + ', End Date: ' + req.body.expirationDate);
            debugPrint('Purchase price mismatch: ' + correctPrice + ' != ' + req.body.purchasePrice);
            res.status(400).json({
              status: 1,
              message: 'Incorrect purchase price was supplied.',
            });
            return;
          }

          // Compute description
          let description =
            'UCF ' +
            req.body.permitType.permitType +
            ' parking permit valid from ' +
            new Date(req.body.startDate).toLocaleDateString('en-US', { timeZone: 'America/New_York' }) +
            ' to ' +
            new Date(req.body.expirationDate).toLocaleDateString('en-US', { timeZone: 'America/New_York' }) +
            '.';

          // Charge stripe...
          constants.stripe.charges.create(
            {
              amount: correctPrice,
              currency: 'usd',
              description: description,
              source: req.body.stripeToken,
              receipt_email: req.body.receiptEmailAddress,
            },
            function(err, charge) {
              if (keys.mode === 'test') {
                debugPrint('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
                debugPrint('~~~~~~~~IGNORING POTENTIALLY FAILED STRIPE CHARGE SINCE IN TEST MODE~~~~~~~~');
                debugPrint('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
              } else {
                if (err) {
                  debugPrint('Failed to charge via Stripe! Type: ' + err.type + '; Message: ' + err.message);
                  res.status(400).json({
                    status: 1,
                    message: 'Failed to charge via Stripe! Type: ' + err.type + '; Message: ' + err.message,
                  });
                  return;
                }
              }

              // Charge success! Create permit entry
              debugPrint('Successful charge through stripe! Charge object is ' + JSON.stringify(charge));
              permitModel.save(function(error) {
                if (error) {
                  res.status(400).json({
                    status: 1,
                    message: 'Failed to save permit to database! ' + error,
                  });
                } else {
                  res.json({
                    status: 0,
                    message: 'Successfully added permit!',
                    receiptURL: charge === null ? 'NOT AVAILABLE' : charge.receipt_url,
                  });
                }
              });
            }
          );
        })
        .catch(code => {
          res.status(400).json({
            status: 1,
            message: 'Failed to calculate permit price. (' + code + ')',
          });
          return;
        });
    });
  }
}

router.post('/purchasePermit', function(req, res) {
  debugPrint('Attempting to purchase permit... ' + JSON.stringify(req.body));

  if (!inputChecker.fieldExists(req.body, 'permitType')) {
    res.status(400).json({
      status: 1,
      message: 'Permit type must be specified!',
    });
    return;
  }
  if (!inputChecker.fieldExists(req.body, 'stripeToken')) {
    res.status(400).json({
      status: 1,
      message: 'Stripe token must be specified!',
    });
    return;
  }
  if (!inputChecker.isNumber(req.body.expirationDate)) {
    res.status(400).json({
      status: 1,
      message: 'Expiration date must be in long format!',
    });
    return;
  }
  if (!inputChecker.isNumber(req.body.startDate)) {
    res.status(400).json({
      status: 1,
      message: 'Start date must be in long format!',
    });
    return;
  }
  if (req.body.startDate >= req.body.expirationDate) {
    res.status(400).json({
      status: 1,
      message: 'Expiration date must be after start date!',
    });
    return;
  }
  if (!inputChecker.isNumber(req.body.purchasePrice)) {
    res.status(400).json({
      status: 1,
      message: 'Purchase price must be in integer format!',
    });
    return;
  }

  if (amh.isAuthenticated(req)) {
    // We need to check if the user is allowed to purchase this permit type!
    UserModel.findOne({ username: amh.getUsername(req) }, { allowedPermits: 1 }, function(error, userModel) {
      if (error) {
        res.status(400).json({
          status: 1,
          message: 'Failed to look up user: ' + error,
        });
      } else if (userModel === null) {
        res.status(400).json({
          status: 1,
          message: 'Failed to look up user, they did not exist!',
        });
      } else {
        completePurchasePermit(req, res, userModel);
      }
    });
  } else {
    debugPrint('Unauthenticated user attempting permit purchase!');
    completePurchasePermit(req, res, null);
  }
});

router.get('/specific/:username', function(req, res) {
  debugPrint('Fetching permits of user ' + req.params.username);

  let authorizedAction = function() {
    PermitModel.find({ owner: req.params.username }, function(error, results) {
      if (error) {
        res.status(400).json({
          status: 1,
          message: 'Failed to fetch permits: ' + error,
        });
        return;
      }

      res.json({
        results: results,
      });
    });
  };

  if (amh.assertAuthenticated(req, res)) {
    if (amh.isAuthenticatedAs(req, req.params.username)) {
      authorizedAction();
    } else {
      amh.checkUserLevel(req, constants.userLevels.administrator, function(isAllowed) {
        if (!isAllowed) {
          res.status(400).json({
            status: 1,
            message: "Only administrators can fetch another users' permits!",
          });
          return;
        }

        authorizedAction();
      });
    }
  } else {
    debugPrint('Ignoring since unauthenticated!');
  }
});

router.get('/tagspecific/:tag', function(req, res) {
  debugPrint('Fetching permits of tag ' + req.params.tag);

  if (!inputChecker.isAlphanumeric(req.params.tag)) {
    res.status(400).json({
      status: 1,
      message: 'Tag must be alphanumeric!',
    });
    return;
  }

  let authorizedAction = function() {
    PermitModel.find({ 'car.licensePlate.tag': req.params.tag }, function(error, results) {
      if (error) {
        res.status(400).json({
          status: 1,
          message: 'Failed to fetch permits: ' + error,
        });
        return;
      }

      res.json({
        results: results,
      });
    });
  };

  if (amh.assertAuthenticated(req, res)) {
    amh.checkUserLevel(req, constants.userLevels.enforcer, function(isAllowed) {
      if (!isAllowed) {
        res.status(400).json({
          status: 1,
          message: 'Only enforcers and above can use this endpoint!',
        });
        return;
      }

      authorizedAction();
    });
  } else {
    debugPrint('Ignoring since unauthenticated!');
  }
});

router.get('/idspecific/:id', function(req, res) {
  debugPrint('Fetching permit of id ' + req.params.id);

  let authorizedAction = function() {
    PermitModel.findOne({ _id: req.params.id }, function(error, result) {
      if (error) {
        res.status(400).json({
          status: 1,
          message: 'Failed to fetch permit: ' + error,
        });
        return;
      }

      if (result === null) {
        res.status(400).json({
          status: 1,
          message: 'Invalid permit ID (permit not found)!',
        });
      } else if (amh.isAuthenticatedAs(req, result.owner)) {
        // Good
        res.json({
          result: result,
        });
      } else {
        // Must be admin to proceed!
        amh.checkUserLevel(req, constants.userLevels.administrator, function(isAllowed) {
          if (!isAllowed) {
            res.status(400).json({
              status: 1,
              message: "Only administrators can fetch another user's permit!",
            });
            return;
          }

          res.json({
            result: result,
          });
        });
      }
    });
  };

  if (amh.assertAuthenticated(req, res)) {
    authorizedAction();
  } else {
    debugPrint('Ignoring since unauthenticated!');
  }
});

// Expects query parameters named p1, p2, and p3 representing the top 3 tags. Also expects query parameter permitType representing the scanning mode.
router.get('/processALPRResult', function(req, res) {
  debugPrint('Processing ALPR result for  ' + JSON.stringify(req.query));

  if (!(inputChecker.isAlphanumeric(req.query.p1) && inputChecker.isAlphanumeric(req.query.p2) && inputChecker.isAlphanumeric(req.query.p3))) {
    res.status(400).json({
      status: 1,
      message: 'Tags must be alphanumeric!',
    });
    return;
  }

  // Validate permitType query param using the permitTypes global.
  globalHelper
    .fetchGlobal('permitTypes')
    .then(permitTypes => {
      // Transform into mapping
      let pt = {};
      permitTypes.forEach(element => {
        pt[element.permitType] = element;
      });

      if (!(req.query.permitType in pt)) {
        res.status(400).json({
          status: 1,
          message: 'Invalid permit type/mode!',
        });
        return;
      }

      let authorizedAction = function() {
        // TODO: look up all 3 top tags, tie break to find top match, then do graph search to determine if allowed to park. return OK or not ok and list of found permits. Also echo the accepted scan result.
        PermitModel.find(
          { $or: [{ 'car.licensePlate.tag': req.query.p1 }, { 'car.licensePlate.tag': req.query.p2 }, { 'car.licensePlate.tag': req.query.p3 }] },
          function(error, results) {
            if (error) {
              res.status(400).json({
                status: 1,
                message: 'Failed to fetch permits: ' + error,
              });
              return;
            }

            let mapTagToPermits = {};
            mapTagToPermits[req.query.p1] = [];
            mapTagToPermits[req.query.p2] = [];
            mapTagToPermits[req.query.p3] = [];
            for (let i = 0; i < results.length; i++) {
              let element = results[i];
              mapTagToPermits[element.car.licensePlate.tag].push(element);
            }

            let orderedTags = [];
            for (let i = 0; i < results.length; i++) {
              let element = results[i];
              if (element.car.licensePlate.tag === req.query.p1) {
                orderedTags.push({ priority: 1, tag: req.query.p1 });
                // Break because p1 is definitely our selectedTag at this point.
                break;
              } else if (element.car.licensePlate.tag === req.query.p2) {
                orderedTags.push({ priority: 2, tag: req.query.p2 });
              } else if (element.car.licensePlate.tag === req.query.p3) {
                orderedTags.push({ priority: 3, tag: req.query.p3 });
              }
            }
            orderedTags.sort(function(a, b) {
              if (a.priority < b.priority) return -1;
              if (a.priority > b.priority) return 1;
              return 0;
            });

            if (orderedTags.length === 0) {
              // No matches at all!
              res.json({
                selectedTag: null,
                spaceNumber: null,
                priority: null,
                inViolation: true,
                matchedPermits: null,
              });
            } else {
              // Is the selected tag in violation?
              let validSet = {};
              validSet[req.query.permitType] = true;
              pt[req.query.permitType].children.forEach(element => {
                validSet[element] = true;
              });

              let inViolation = true;
              let spaceNumber = null;
              mapTagToPermits[orderedTags[0].tag].forEach(element => {
                if (element.permitType.permitType in validSet) {
                  inViolation = false;
                  if (element.permitType.permitType === 'A') {
                    spaceNumber = element.permitType.spaceNumber;
                  }
                }
              });

              res.json({
                selectedTag: orderedTags[0].tag, // Which tag of the 3 provided was used?,
                spaceNumber: spaceNumber, // Assuming inViolation is false AND permitType (mode) is A, then
                priority: orderedTags[0].priority, // What was teh priority of the selectedTag? Larger number means a worse match. 1 means a perfect match.
                inViolation: inViolation, // Is that tag allowed to park according to the current scanning mode?
                matchedPermits: mapTagToPermits[orderedTags[0].tag], // What permits matched our selectedTag
              });
            }
          }
        );
      };

      if (amh.assertAuthenticated(req, res)) {
        amh.checkUserLevel(req, constants.userLevels.enforcer, function(isAllowed) {
          if (!isAllowed) {
            res.status(400).json({
              status: 1,
              message: 'Only enforcers and above can use this endpoint!',
            });
            return;
          }

          authorizedAction();
        });
      } else {
        debugPrint('Ignoring since unauthenticated!');
      }
    })
    .catch(() => {
      res.status(400).json({
        status: 1,
        message: 'Global lookup failed!',
      });
      return;
    });
});

router.post('/updatePermitCar', function(req, res) {
  debugPrint('Updating car of permit ' + req.body.id);

  let finalFunction = function(error, results) {
    if (error) {
      res.status(400).json({
        status: 1,
        message: 'Failed to update permit car: ' + error,
      });
    } else if (results === null) {
      res.status(400).json({
        status: 3,
        message: 'Failed to update permit car. Permit did not exist or swap limit reached!',
      });
    } else {
      debugPrint('Swap succeeded!');
      res.json({
        status: 0,
        message: 'Successfully updated permit car!',
      });
    }
  };

  let authorizedAction = function(countsAgainstOwner, ownerAllowedSwaps) {
    if (countsAgainstOwner) {
      debugPrint('Performing swap that counts against user.');

      // We'll only find a permit with the exact id and whose length of
      // swapTimestamps is less than ownerAllowedSwaps. This ensures atomic
      // swapping, so that it will never be the case that a race condition gives
      // a user more than their allowed swaps.
      let findObject = {};
      findObject['_id'] = req.body.id;
      findObject['swapTimestamps.' + (ownerAllowedSwaps - 1)] = { $exists: false };
      PermitModel.findOneAndUpdate(findObject, { $set: { car: req.body.car }, $push: { swapTimestamps: new Date() } }, { runValidators: true }, finalFunction);
    } else {
      // Admins always swap for free
      debugPrint('Performing free swap since administrator user.');
      PermitModel.findOneAndUpdate({ _id: req.body.id }, { $set: { car: req.body.car } }, { runValidators: true }, finalFunction);
    }
  };

  if (amh.assertAuthenticated(req, res)) {
    globalHelper
      .fetchGlobal('swapPeriod')
      .then(swapPeriod => {
        // Remove all entries from swapTimestamps that are on or before the evictionDate
        let evictionDate = new Date(new Date().getTime() - swapPeriod);

        // Note it is always safe to be removing stape timestamps, even if we later
        // find out we're unauthorized, since these entries are purely "useless
        // trash" to be cleaned up
        PermitModel.findOneAndUpdate({ _id: req.body.id }, { $pull: { swapTimestamps: { $lte: evictionDate } } }, { new: true }, function(error, result) {
          if (error) {
            res.status(400).json({
              status: 1,
              message: 'Failed to update permit car: ' + error,
            });
          } else if (result === null) {
            res.status(400).json({
              status: 1,
              message: 'Failed to update permit car. Permit did not exist!',
            });
          } else {
            // At this point we've successfully found the permit and removed expired
            // timestamps
            debugPrint('Found applicable permit with ' + result.swapTimestamps.length + ' swaps on it.');

            // Now we need to know how many swaps this user is allowed to have!
            UserModel.findOne({ username: amh.getUsername(req) }, { swapsAllowed: 1, accountLevel: 1 }, function(error, userModel) {
              if (error || userModel === null) {
                res.status(400).json({
                  status: 1,
                  message: 'Failed to look up appropriate user!',
                });
                return;
              }

              if (userModel.accountLevel >= constants.userLevels.administrator) {
                // Admins always swap anyone for free
                authorizedAction(false, null);
              } else {
                // Not admin, so not free and limited to a specific user!
                if (amh.isAuthenticatedAs(req, result.owner)) {
                  if (result.swapTimestamps.length >= userModel.swapsAllowed) {
                    // Can't swap again!
                    debugPrint('Swap failed since ' + result.swapTimestamps.length + ' >= ' + userModel.swapsAllowed);

                    // But how long does the user need to wait to swap again?
                    let timeToWaitInMs = result.swapTimestamps[0].getTime() - evictionDate.getTime();
                    res.status(400).json({
                      status: 2,
                      message: 'User has swapped too many times!',
                      remainingWaitTime: timeToWaitInMs,
                    });
                    return;
                  } else {
                    // We can swap!
                    // True since this uses one of the allowed swaps
                    authorizedAction(true, userModel.swapsAllowed);
                  }
                } else {
                  res.status(400).json({
                    status: 1,
                    message: "Only administrators can update another users' permits!",
                  });
                  return;
                }
              }
            });
          }
        });
      })
      .catch(() => {
        res.status(400).json({
          status: 1,
          message: 'Global lookup failed!',
        });
      });
  } else {
    debugPrint('Ignoring since unauthenticated!');
  }
});

module.exports = router;
