const express = require('express');
const mongoose = require('mongoose');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

const debugPrint = require('../../development/DebugPrint');
const amh = require('../../middleware/AuthenticationMiddlewareHelper');
const globalHelper = require('../../helpers/GlobalHelper');
const UserModel = require('../../models/UserModel');
const constants = require('../../config/constants.js');
const keys = require('../../config/keys.js');
const inputChecker = require('../../helpers/InputChecker.js');

const router = express.Router();

router.get('/specific/:username', function(req, res) {
  debugPrint('Fetch request for information about user ' + req.params.username);
  if (amh.assertAuthenticated(req, res)) {
    // Administrators can fetch information on any user. Otherwise, user can only fetch their own information.
    // This is what should run assuming the action is allowed
    let authorizedAction = function() {
      UserModel.findOne({ username: req.params.username }, { cars: 0 }, function(error, userModel) {
        if (error || userModel === null) {
          res.status(400).json({
            status: 1,
            message: "The requested user couldn't be fetched from the database.",
          });
        } else {
          res.json(userModel);
        }
      });
    };

    if (amh.isAuthenticatedAs(req, req.params.username)) {
      authorizedAction();
    } else {
      // We must check to ensure that the user is of type administrator
      amh.checkUserLevel(req, constants.userLevels.administrator, function(isAllowed) {
        if (isAllowed) {
          authorizedAction();
        } else {
          res.status(400).json({
            status: 1,
            message: 'This action requires a higher user level.',
          });
        }
      });
    }
  } else {
    debugPrint('Ignoring since unauthenticated!');
  }
});

router.get('/specific/:username/field/:field', function(req, res) {
  debugPrint('Fetching specific field ' + req.params.field + ' from ' + req.params.username);

  let authorizedAction = function() {
    UserModel.findOne({ username: req.params.username }, req.params.field, function(err, userModel) {
      if (err || userModel === null || userModel[req.params.field] === undefined) {
        res.status(400).json({
          status: 1,
          message: 'Failed to get field from user.',
        });
      } else {
        res.json({
          field: req.params.field,
          value: userModel[req.params.field],
        });
      }
    });
  };

  if (amh.assertAuthenticated(req, res)) {
    if (amh.isAuthenticatedAs(req, req.params.username)) {
      authorizedAction();
    } else {
      amh.checkUserLevel(req, constants.userLevels.administrator, function(isAllowed) {
        if (isAllowed) {
          authorizedAction();
        } else {
          res.status(400).json({
            status: 1,
            message: 'This action requires a higher user level.',
          });
        }
      });
    }
  } else {
    debugPrint('Ignoring since unauthenticated!');
  }
});

//maxResults/:maxResults/nid/:usernameFilter(*)/first/:firstNameFilter(*)/last/:lastNameFilter(*)/email/:emailAddressFilter(*)/level/:accountLevelFilter(*)
router.get('/searchUsers', function(req, res) {
  debugPrint('Searching users with params of ' + JSON.stringify(req.query));

  if (!inputChecker.isIntegerString(req.query.maxResults)) {
    res.status(400).json({
      status: 1,
      message: 'maxResults must be an integer!',
    });
    return;
  }
  let maxResults = parseInt(req.query.maxResults, 10);
  if (maxResults < 1 || maxResults > 100) {
    res.status(400).json({
      status: 1,
      message: 'maxResults should be in the range [1, 100]! ',
    });
    return;
  }

  if (!inputChecker.isIntegerStringOrEmpty(req.query.accountLevelFilter)) {
    res.status(400).json({
      status: 1,
      message: 'accountLevelFilter must be an integer!',
    });
    return;
  }
  let accountLevelFilter = null;
  if (req.query.accountLevelFilter.length === 0) {
    accountLevelFilter = null;
  } else {
    accountLevelFilter = parseInt(req.query.accountLevelFilter, 10);
  }

  if (!inputChecker.isAlphanumeric(req.query.usernameFilter) || req.query.usernameFilter.length > 256) {
    res.status(400).json({
      status: 1,
      message: 'usernameFilter must be an alphanumeric String of no more than 256 characters! ',
    });
    return;
  }

  if (!inputChecker.isAlphanumericWithSpaces(req.query.firstNameFilter) || req.query.firstNameFilter.length > 256) {
    res.status(400).json({
      status: 1,
      message: 'firstNameFilter must be an alphanumeric String of no more than 256 characters! ',
    });
    return;
  }

  if (!inputChecker.isAlphanumericWithSpaces(req.query.lastNameFilter) || req.query.lastNameFilter.length > 256) {
    res.status(400).json({
      status: 1,
      message: 'lastNameFilter must be an alphanumeric String of no more than 256 characters! ',
    });
    return;
  }

  if (!inputChecker.isEmailCharacters(req.query.emailAddressFilter) || req.query.emailAddressFilter.length > 256) {
    res.status(400).json({
      status: 1,
      message: 'emailAddressFilter must be an alphanumeric String of no more than 256 characters! ',
    });
    return;
  }

  let authorizedAction = function() {
    let searchObject = {
      username: new RegExp('^.*' + req.query.usernameFilter + '.*$'),
      firstName: new RegExp('^.*' + req.query.firstNameFilter + '.*$'),
      lastName: new RegExp('^.*' + req.query.lastNameFilter + '.*$'),
      emailAddress: new RegExp('^.*' + req.query.emailAddressFilter.replace(/\./g, '\\.') + '.*$'),
    };
    if (accountLevelFilter !== null) {
      searchObject['accountLevel'] = accountLevelFilter;
    }

    UserModel.find(searchObject, { cars: 0 }, { limit: maxResults, sort: { username: 1 } }, function(error, results) {
      if (error || results === null) {
        res.status(400).json({
          status: 1,
          message: 'Database fetching failed!',
        });
      } else {
        res.json({
          results: results,
        });
      }
    });
  };

  if (amh.assertAuthenticated(req, res)) {
    amh.checkUserLevel(req, constants.userLevels.administrator, function(isAllowed) {
      if (isAllowed) {
        authorizedAction();
      } else {
        res.status(400).json({
          status: 1,
          message: 'This action requires a higher user level.',
        });
      }
    });
  } else {
    debugPrint('Ignoring since unauthenticated!');
  }
});

router.post('/initializeNewUser', function(req, res) {
  debugPrint('Initializing a new user...');

  // Ensure authenticated
  if (amh.assertAuthenticated(req, res)) {
    // We are authenticated! Are we an administrator though?
    amh.checkUserLevel(req, constants.userLevels.administrator, function(isAllowed) {
      if (!isAllowed) {
        res.status(400).json({
          status: 1,
          message: 'This action required a higher user level.',
        });
        return;
      }

      // Populate a new model instance
      let newUser = new UserModel();
      newUser.username = req.body.username;
      newUser.firstName = req.body.firstName;
      newUser.lastName = req.body.lastName;
      newUser.middleInitial = req.body.middleInitial;
      newUser.emailAddress = req.body.emailAddress;
      newUser.phoneNumber = req.body.phoneNumber;
      newUser.addressLine1 = req.body.addressLine1;
      newUser.addressLine2 = req.body.addressLine2;
      newUser.city = req.body.city;
      newUser.state = req.body.state;
      newUser.zipCode = req.body.zipCode;
      newUser.accountLevel = req.body.accountLevel;
      newUser.allowedPermits = req.body.allowedPermits;

      let validateAndFinish = function() {
        // Validate it!
        newUser.validate(function(error) {
          if (error) {
            res.status(400).json({
              status: 1,
              message: 'Validation failed. ' + error,
            });
            return;
          }

          // What about our password?
          if (
            req.body.password === undefined ||
            req.body.password === null ||
            req.body.password.length === undefined ||
            req.body.password.length === null ||
            req.body.password.length < 8
          ) {
            res.status(400).json({
              status: 1,
              message: 'Password is too short or was not provided! ' + error,
            });
            return;
          }

          // No error, so we may try to insert into user pool and then database

          // Create the user in our user pool...
          var attributeList = [];
          var dataEmail = {
            Name: 'email',
            Value: req.body.email,
          };
          attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail));
          constants.userPool.signUp(req.body.username, req.body.password, attributeList, null, function(err, result) {
            if (err) {
              debugPrint(err);
              res.status(400).json({
                status: 1,
                message: 'Failed to create user in user pool: ' + err.message,
              });
            } else {
              // They're created in the user pool, so enter them into the database.
              newUser.save(function(error) {
                if (error) {
                  debugPrint(error);
                  ``;
                  res.status(400).json({
                    status: 1,
                    message: 'Failed to update the database: ' + error,
                  });
                } else {
                  res.json({
                    status: 0,
                    message: 'User successfully initialized in the database and user pool!',
                  });
                }
              });
            }
          });
        });
      };

      // Determine the correct swapsAllowed for this new user...
      if ('swapsAllowed' in req.body) {
        newUser.swapsAllowed = req.body.swapsAllowed;
        validateAndFinish();
      } else {
        globalHelper
          .fetchGlobal('swapsAllowedDefault')
          .then(value => {
            newUser.swapsAllowed = value;
            validateAndFinish();
          })
          .catch(() => {
            res.status(400).json({
              status: 1,
              message: 'Global lookup failed!',
            });
          });
      }
    });
  } else {
    debugPrint('Ignoring since unauthenticated!');
  }
});

router.post('/specific/:username/updateManyFields', function(req, res) {
  debugPrint('Setting many fields on user ' + req.params.username);

  let authorizedAction = function() {
    let setObject = {};
    let unsetObject = {};

    // All user directly settable fields plus account level and allowed permits are settable here
    let settableFields = { ...constants.userDirectlySettableAttributes, ...constants.userAdminSettableAttributes };

    for (let property in req.body) {
      if (property in settableFields) {
        // Both contain this property!
        if (req.body[property] === null) {
          // Unset the thing if possible!
          unsetObject[property] = 1;
        } else {
          setObject[property] = req.body[property];
        }
      } else {
        res.status(400).json({
          status: 1,
          message: 'The field ' + property + ' does not exist or cannot be set!',
        });
        return;
      }
    }

    let finalSetObject = {};
    if (Object.keys(setObject).length > 0) {
      finalSetObject['$set'] = setObject;
    }
    if (Object.keys(unsetObject).length > 0) {
      finalSetObject['$unset'] = unsetObject;
    }
    if (Object.keys(finalSetObject).length <= 0) {
      // Nothing to update!
      res.status(400).json({
        status: 1,
        message: 'No fields to be updated!',
      });
      return;
    }

    debugPrint('finalSetObject is now ' + JSON.stringify(finalSetObject));

    UserModel.updateOne({ username: req.params.username }, finalSetObject, { runValidators: true }, function(err, raw) {
      if (err) {
        res.status(400).json({
          status: 1,
          message: 'Failed to update user fields! ' + err,
        });
        return;
      }

      if (raw.n === 0) {
        res.status(400).json({
          status: 1,
          message: 'Failed to update user fields! No such user existed!',
        });
        return;
      }

      res.json({
        status: 0,
        message: 'User fields update successfully!',
      });
    });
  };

  if (amh.assertAuthenticated(req, res)) {
    amh.checkUserLevel(req, constants.userLevels.administrator, function(isAllowed) {
      if (isAllowed) {
        authorizedAction();
      } else {
        res.status(401).json({
          status: 1,
          message: 'This action required a higher user level.',
        });
      }
    });
  } else {
    debugPrint('Ignoring since unauthenticated!');
  }
});

router.post('/deleteUser', function(req, res) {
  if (amh.assertAuthenticated(req, res)) {
    amh.checkUserLevel(req, constants.userLevels.administrator, function(isAllowed) {
      if (isAllowed) {
        constants.cognitoIdentityServiceProvider.adminDeleteUser(
          {
            UserPoolId: keys.cognitoPoolData.UserPoolId,
            Username: req.body.username,
          },
          function(err, data) {
            if (err) {
              res.status(400).json({
                status: 1,
                message: 'Failed to delete user from user pool! ' + err,
              });
            } else {
              // Success in deleting from user pool, now clean up database entry!
              UserModel.findOneAndDelete({ username: req.body.username }, function(err, doc) {
                if (err) {
                  res.status(400).json({
                    status: 1,
                    message: 'User deleted from user pool but not from database: ' + err,
                  });
                } else {
                  res.json({
                    status: 0,
                    message: 'Successfully deleted user! ' + data,
                  });
                }
              });
            }
          }
        );
      } else {
        res.status(401).json({
          status: 1,
          message: 'This action required a higher user level.',
        });
      }
    });
  } else {
    debugPrint('Ignoring since unauthenticated!');
  }
});

router.post('/specific/:username/addCar', function(req, res) {
  if (amh.assertAuthenticated(req, res)) {
    if (amh.isAuthenticatedAs(req, req.params.username)) {
      UserModel.update(
        { username: req.params.username },
        {
          $push: {
            cars: {
              licensePlate: {
                tag: req.body.tag,
                state: req.body.state,
              },
              make: req.body.make,
              model: req.body.model,
              year: req.body.year,
              color: req.body.color,
            },
          },
        },
        { runValidators: true },
        function(err, raw) {
          if (err) {
            res.status(400).json({
              status: 1,
              message: 'Failed to add the car: ' + err,
            });
          } else {
            res.json({
              status: 0,
              message: 'Car added successfully!',
            });
          }
        }
      );
    } else {
      res.status(400).json({
        status: 1,
        message: 'You cannot add cars for a different user.',
      });
    }
  } else {
    debugPrint('Ignoring since unauthenticated!');
  }
});

router.get('/specific/:username/getCarByID/:id', function(req, res) {
  debugPrint('Fetching car by ID ' + req.params.id + ' for user ' + req.params.username);

  let authorizedAction = function() {
    /*
      This one warrants some commentary. The first match enforces that we can
      only look at the user req.params.username's cars. That is, all other user
      data is filtered out in that step since that first step requires that the
      user's username match req.params.username. You may be thinking that this
      is an issue. What if a user simply supplies a different user's username
      in req.params.username? Can they then fetch another user's car if they
      guess a car ID? Well, no, since then they would never have even made it to
      authorizedAction to begin with due to
      amh.isAuthenticatedAs(req, req.params.username)!

      The second step unwinds the cars array.

      The third step removes from cars all subdocuments which don't match the
      queried ObjectID.

      The fourth step says to only select the cars field of the returned user
      documents.

      This means the aggregate operation "returns" an array of user documents
      consisting only of the cars field, and the user documents must have
      matched req.params.username and also the cars field will contain only
      the car object whose id matched our requested id.

      We then select the 0th user document from this array, and return that
      single car objecct at the cars key. (arrayOfUserModel[0].cars)
    */
    UserModel.aggregate(
      [
        { $match: { username: req.params.username } },
        { $unwind: '$cars' },
        { $match: { 'cars._id': mongoose.mongo.ObjectID(req.params.id) } },
        { $project: { _id: 0, cars: 1 } },
      ],
      function(err, arrayOfUserModel) {
        if (err || arrayOfUserModel === null || arrayOfUserModel[0] === undefined) {
          res.status(400).json({
            status: 1,
            message: 'Failed to get car from user. ' + err,
          });
        } else {
          res.json({
            result: arrayOfUserModel[0].cars,
          });
        }
      }
    );
  };

  if (amh.assertAuthenticated(req, res)) {
    if (amh.isAuthenticatedAs(req, req.params.username)) {
      authorizedAction();
    } else {
      amh.checkUserLevel(req, constants.userLevels.administrator, function(isAllowed) {
        if (isAllowed) {
          authorizedAction();
        } else {
          res.status(400).json({
            status: 1,
            message: 'This action requires a higher user level.',
          });
        }
      });
    }
  } else {
    debugPrint('Ignoring since unauthenticated!');
  }
});

router.post('/specific/:username/updateCar', function(req, res) {
  debugPrint('Updating car for user ' + req.params.username);
  debugPrint('Body is ' + JSON.stringify(req.body));

  let authorizedAction = function() {
    UserModel.updateOne(
      { username: req.params.username, cars: { $elemMatch: { _id: req.body.id } } },
      {
        $set: {
          'cars.$.make': req.body.make,
          'cars.$.model': req.body.model,
          'cars.$.year': req.body.year,
          'cars.$.color': req.body.color,
          'cars.$.licensePlate.tag': req.body.tag,
          'cars.$.licensePlate.state': req.body.state,
        },
      },
      { runValidators: true },
      function(err, raw) {
        if (err) {
          res.status(400).json({
            status: 1,
            message: 'Failed to update car! ' + err,
          });
          return;
        }

        if (raw.n === 0) {
          res.status(400).json({
            status: 1,
            message: 'Failed to update car! No such car existed!',
          });
          return;
        }

        res.json({
          status: 0,
          message: 'Car updated successfully!',
        });
      }
    );
  };

  if (amh.assertAuthenticated(req, res)) {
    if (amh.isAuthenticatedAs(req, req.params.username)) {
      authorizedAction();
    } else {
      amh.checkUserLevel(req, constants.userLevels.administrator, function(isAllowed) {
        if (isAllowed) {
          authorizedAction();
        } else {
          res.status(400).json({
            status: 1,
            message: 'This action requires a higher user level.',
          });
        }
      });
    }
  } else {
    debugPrint('Ignoring since unauthenticated!');
  }
});

router.post('/specific/:username/removeCar', function(req, res) {
  if (amh.assertAuthenticated(req, res)) {
    UserModel.update(
      { username: amh.getUsername(req) },
      {
        $pull: {
          cars: {
            _id: req.body.id,
          },
        },
      },
      { runValidators: true },
      function(err, raw) {
        if (err) {
          res.status(400).json({
            status: 1,
            message: 'Failed to remove the car: ' + err,
          });
        } else {
          res.json({
            status: 0,
            message: 'Car removed successfully!',
          });
        }
      }
    );
  } else {
    debugPrint('Ignoring since unauthenticated!');
  }
});

router.post('/specific/:username/field/:field', function(req, res) {
  debugPrint('Attempting posting to user ' + req.params.username + "'s " + req.params.field + ' field.');

  if (amh.assertAuthenticated(req, res)) {
    let authorizedAction = function(isAdmin) {
      if (isAdmin) {
        if (!(req.params.field in constants.userDirectlySettableAttributes) && !(req.params.field in constants.userAdminSettableAttributes)) {
          res.status(400).json({
            status: 1,
            message: 'The specified field cannot be directly set.',
          });
          return;
        }
      } else {
        if (!(req.params.field in constants.userDirectlySettableAttributes)) {
          res.status(400).json({
            status: 1,
            message: 'The specified field cannot be directly set by non-administrators.',
          });
          return;
        }
      }

      let setObject = {};
      if (req.body.value === null) {
        // Unset the thing if possible!
        setObject[req.params.field] = 1;
        setObject = { $unset: setObject };
      } else {
        setObject[req.params.field] = req.body.value;
        setObject = { $set: setObject };
      }
      UserModel.findOneAndUpdate({ username: req.params.username }, setObject, { runValidators: true }, function(error, results) {
        if (error) {
          res.status(400).json({
            status: 1,
            message: 'Failed to set field: ' + error,
          });
        } else if (results === null) {
          res.status(400).json({
            status: 1,
            message: 'Failed to set field. User did not exist!',
          });
        } else {
          res.json({
            status: 0,
            message: 'Successfully set field!',
          });
        }
      });
    };

    amh.checkUserLevel(req, constants.userLevels.administrator, function(isAllowed) {
      if (isAllowed) {
        // Admins can do it!
        authorizedAction(true);
      } else {
        // Not admin, so are we modifying ourselves?
        if (amh.isAuthenticatedAs(req, req.params.username)) {
          authorizedAction(false);
        } else {
          res.status(400).json({
            status: 1,
            message: 'This action requires a higher user level.',
          });
        }
      }
    });
  } else {
    debugPrint('Ignoring since unauthenticated!');
  }
});

module.exports = router;
