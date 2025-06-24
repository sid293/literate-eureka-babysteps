const mongoose = require('mongoose');

const tipSchema = new mongoose.Schema({
  milestone_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User.milestones',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tip: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Tip', tipSchema); 