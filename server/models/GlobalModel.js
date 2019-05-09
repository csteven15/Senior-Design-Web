const mongoose = require('mongoose');

const globalSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 1,
    maxlength: 256,
    required: true,
    unique: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
});

globalSchema.index({ name: 1 });

module.exports = mongoose.model('Global', globalSchema);
