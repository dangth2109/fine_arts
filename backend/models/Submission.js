const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  image: {
    type: String,
    required: [true, 'Submission image is required']
  },
  competitionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Competition',
    required: [true, 'Competition ID is required']
  },
  author: {
    type: String,
    required: [true, 'Author email is required']
  },
  score: {
    type: Number,
    default: 0,
    min: [0, 'Score cannot be less than 0'],
    max: [10, 'Score cannot be greater than 10']
  },
  scoredBy: {
    type: String,
    default: null
  },
  scoredAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

/**
 * Ensure one submission per competition per author
 */
submissionSchema.index({ competitionId: 1, author: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);