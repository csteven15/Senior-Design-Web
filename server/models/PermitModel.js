const mongoose = require('mongoose');

const carSchema = require('./CarSchema');
const permitTypeSchema = require('./PermitTypeSchema');

const permitSchema = new mongoose.Schema({
  owner: {
    type: String,
    required: false,
  },
  car: {
    type: carSchema,
    required: true,
  },
  permitType: {
    type: permitTypeSchema,
    required: true,
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0,
    max: 100000000000,
  },
  purchaseDate: {
    type: Date,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  swapTimestamps: {
    type: [Date],
    required: true,
  },
});

permitSchema.index({ owner: 1 });
permitSchema.index({ 'car.licensePlate.tag': 1 });
// TODO index by expiration date?

module.exports = {
  PermitModel: mongoose.model('Permit', permitSchema),
  ExpiredPermitModel: mongoose.model('ExpiredPermit', permitSchema),
};
