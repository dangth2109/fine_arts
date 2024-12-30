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

    // Check for existing submission
    const existingSubmission = await Submission.findOne({
      competitionId,
      author
    });

    // If exists, delete old submission and its image
    if (existingSubmission) {
      if (existingSubmission.image) {
        const imagePath = path.join(__dirname, '../../uploads', existingSubmission.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      await existingSubmission.deleteOne();

    }

    // Create new submission
    const submission = new Submission({
      competitionId,
      author,
      image: req.file ? `/images/submissions/${req.file.filename}` : null
    });

    await submission.save();

    // No need to increment totalSubmissions if we're replacing an existing one
    if (!existingSubmission) {
      await Competition.findByIdAndUpdate(competitionId, {
        $inc: { totalSubmissions: 1 }
      });
    }

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
 * Admin, Manager: all submissions
 * Student: only their own submissions
 */
exports.getAllSubmissions = async (req, res) => {
  try {
    const { competition, author, score, scoredBy, scoredAt } = req.query;
    const filter = {};

    // Chỉ cho phép user thường xem submission của họ
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.role !== 'staff') {
      filter.author = req.user.email;
    }

    // Filter by competition name (search like)
    if (competition) {
      const competitions = await Competition.find({
        name: { $regex: competition, $options: 'i' }
      }).select('_id');
      filter.competitionId = { $in: competitions.map(c => c._id) };
    }

    // Filter by author email (search like)
    if (author) {
      filter.author = { $regex: author, $options: 'i' };
    }

    // Filter by score
    if (score) {
      filter.score = score;
    }

    // Filter by scorer
    if (scoredBy) {
      filter.scoredBy = { $regex: scoredBy, $options: 'i' };
    }

    // Filter by scored date
    if (scoredAt) {
      const date = new Date(scoredAt);
      filter.scoredAt = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      };
    }

    const submissions = await Submission.find(filter)
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
 * Admin, Manager: any submission
 * Student: only their own submissions
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
 * Admin, Manager, Staff access
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
 * Admin, Manager: any submission
 * Student: only their own submissions
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

    if (req.user.role !== 'admin' && req.user.role !== 'manager' && submission.author !== req.user.email) {
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
      $set: {
        winners: [],
        isProcessed: false,
        $inc: { totalSubmissions: -1 }
      }
    });

    await submission.deleteOne();
    await runCronManually();

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