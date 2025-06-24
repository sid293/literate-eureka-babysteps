const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  milestones: [{
    title: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    notes: String,
    status: {
      type: String,
      enum: ['completed', 'pending'],
      default: 'pending'
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema); 