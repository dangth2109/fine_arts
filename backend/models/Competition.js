const mongoose = require('mongoose');

const competitionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Competition name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Competition description is required']
  },
  start: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function (value) {
        return !isNaN(value) && value instanceof Date;
      },
      message: 'Invalid start date'
    }
  },
  end: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function (value) {
        return !isNaN(value) && value instanceof Date;
      },
      message: 'Invalid end date'
    }
  },
  background: {
    type: String,
    required: [true, 'Background image is required']
  },
  isHide: {
    type: Boolean,
    default: false
  },
  totalSubmissions: {
    type: Number,
    default: 0
  },
  awards: {
    type: String,
    required: [true, 'Awards information is required']
  },
  winners: [{
    email: String,
    score: Number,
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission'
    },
    image: String
  }],
  isProcessed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

/**
 * Validate dates before saving
 */
competitionSchema.pre('save', function (next) {
  if (!(this.start instanceof Date) || isNaN(this.start)) {
    next(new Error('Invalid start date'));
  }
  if (!(this.end instanceof Date) || isNaN(this.end)) {
    next(new Error('Invalid end date'));
  }
  if (this.end <= this.start) {
    next(new Error('End date must be after start date'));
  }
  next();
});

module.exports = mongoose.model('Competition', competitionSchema);