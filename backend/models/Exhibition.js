const mongoose = require('mongoose');

const exhibitionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exhibition name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Exhibition description is required']
  },
  location: {
    type: String,
    required: [true, 'Exhibition location is required']
  },
  background: {
    type: String,
  },
  start: {
    type: Date,
    required: [true, 'Start date is required']
  },
  end: {
    type: Date,
    required: [true, 'End date is required']
  },
  artwork: {
    type: [{
      image: String,
      author: String
    }],
    default: []
  },
  isHide: {
    type: Boolean,
    default: false
  },
  totalSubmissions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

/**
 * Validate dates and update submission count before saving
 */
exhibitionSchema.pre('save', function(next) {
  if (this.end <= this.start) {
    next(new Error('End date must be after start date'));
  }
  this.totalSubmissions = this.artwork.length;
  next();
});

module.exports = mongoose.model('Exhibition', exhibitionSchema);