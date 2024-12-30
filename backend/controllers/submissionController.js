const Submission = require('../models/Submission');
const Competition = require('../models/Competition');
const fs = require('fs');
const path = require('path');
const { runCronManually } = require('../utils/cronJobs');

/**
 * Create a new submission for a competition
 * Authenticated users only
 */
exports.createSubmission = async (req, res) => {
  try {
    const { competitionId } = req.body;
    const author = req.user.email;

    const competition = await Competition.findById(competitionId);
    if (!competition) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      });
    }

    const now = new Date();
    if (now > new Date(competition.end)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Competition is not active'
      });
    }

    const existingSubmission = await Submission.findOne({
      competitionId,
      author
    });

    if (existingSubmission) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'You already have a submission for this competition'
      });
    }

    const submission = new Submission({
      competitionId,
      author,
      image: req.file ? `/images/submissions/${req.file.filename}` : null
    });

    await submission.save();

    await Competition.findByIdAndUpdate(competitionId, {
      $inc: { totalSubmissions: 1 }
    });

    res.status(201).json({
      success: true,
      data: submission
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all submissions
 * Admin: all submissions
 * Users: only their own submissions
 */
exports.getAllSubmissions = async (req, res) => {
  try {
    const { competitionId } = req.query;
    const query = competitionId ? { competitionId } : {};

    if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.role !== 'staff') {
      query.author = req.user.email;
    }

    const submissions = await Submission.find(query)
      .sort({ createdAt: -1 })
      .populate('competitionId', 'name');

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get detailed information of a specific submission
 * Admin: any submission
 * Users: only their own submissions
 */
exports.getSubmissionDetail = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('competitionId', 'name');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    if (req.user.role !== 'admin' && submission.author !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update submission score
 * Admin access only
 */
exports.updateSubmission = async (req, res) => {
  try {
    const { score } = req.body;

    if (score < 0 || score > 10) {
      return res.status(400).json({
        success: false,
        message: 'Score must be between 0 and 10'
      });
    }

    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      {
        score,
        scoredBy: req.user.email,
        scoredAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (score) {
      await Competition.findByIdAndUpdate(
        submission.competitionId,
        {
          $set: {
            winners: [],
            isProcessed: false
          }
        }
      );
      await runCronManually();
    }

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete a submission
 * Admin: any submission
 * Users: only their own submissions
 */
exports.deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    if (req.user.role !== 'admin' && submission.author !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (submission.image) {
      const imagePath = path.join(__dirname, '../../', submission.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Competition.findByIdAndUpdate(submission.competitionId, {
      $inc: { totalSubmissions: -1 }
    });

    await submission.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all submissions for a specific competition
 * Public access
 */
exports.getSubmissionsByCompetition = async (req, res) => {
  try {
    const { competitionId } = req.params;

    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      });
    }

    const submissions = await Submission.find({ competitionId })
      .sort({ createdAt: -1 })
      .populate('competitionId', 'name');

    res.status(200).json({
      success: true,
      count: submissions.length,
      competition: {
        id: competition._id,
        name: competition.name,
        totalSubmissions: competition.totalSubmissions
      },
      data: submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};