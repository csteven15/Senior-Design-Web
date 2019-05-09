const debugPrint = require('../development/DebugPrint');
const PermitModel = require('../models/PermitModel').PermitModel;
const ExpiredPermitModel = require('../models/PermitModel').ExpiredPermitModel;

function expiredPermitSweep() {
  debugPrint('Running expired permit sweep!');
  PermitModel.find({ expirationDate: { $lte: new Date() } }, function(error, results) {
    if (error) {
      debugPrint('Error finding matching documents');
      return;
    }

    debugPrint('Migrating ' + results.length + ' old permit documents...');
    results.forEach(doc => {
      // We want to insert it into our new collection and then nuke it from our old one!
      let entry = new ExpiredPermitModel(doc);
      entry.isNew = true;
      entry.save(function(error) {
        if (error) {
          debugPrint('Error saving entry into expired collection: ' + error);
          return;
        }

        debugPrint('Successful insertion of ' + entry._id + '!');

        doc.remove(function(error) {
          if (error) {
            debugPrint('Failed to remove old document from permit collection: ' + error);
            return;
          }

          debugPrint('Successful removal of ' + doc._id + '!');
        });
      });
    });
  });
}

module.exports = expiredPermitSweep;
