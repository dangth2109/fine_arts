const Competition = require('../models/Competition');
const Submission = require('../models/Submission');
const fs = require('fs');
const path = require('path');

/**
 * Get all competitions with basic information
 * Public access
 */
exports.getAllCompetitions = async (req, res) => {
  try {
    const competitions = await Competition.find()
      .select('name description background start end totalSubmissions isHide awards')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: competitions.length,
      data: competitions
      // data: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get detailed information of a specific competition
 * Public access
 */
exports.getCompetition = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id)
      .select('name description background start end totalSubmissions winners awards isHide');

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      });
    }

    res.status(200).json({
      success: true,
      data: competition
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'Competition not found'
    });
  }
};

/**
 * Create a new competition
 * Admin access only
 */
exports.createCompetition = async (req, res) => {
  try {
    const { name, description, start, end, awards } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Background image is required'
      });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || !/^\d{4}-\d{2}-\d{2}$/.test(start)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Invalid start date format. Use YYYY-MM-DD'
      });
    }

    if (isNaN(endDate.getTime()) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Invalid end date format. Use YYYY-MM-DD'
      });
    }

    if (endDate <= startDate) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    const competition = new Competition({
      name,
      description,
      background: `/images/competitions/${req.file.filename}`,
      start: startDate,
      end: endDate,
      awards: awards,
      totalSubmissions: 0
    });

    await competition.save();

    res.status(201).json({
      success: true,
      data: competition
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
 * Update competition details
 * Admin access only
 */
exports.updateCompetition = async (req, res) => {
  try {
    const { name, description, start, end, isHide, awards } = req.body;
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (isHide) updateData.isHide = isHide;
    if (awards) updateData.awards = awards;

    if (req.file) {
      if (competition.background && competition.background.startsWith('/images/')) {
        const oldPath = path.join(__dirname, '../../uploads', competition.background);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      updateData.background = `/images/competitions/${req.file.filename}`;
    }

    if (start) {
      const startDate = new Date(start);
      if (isNaN(startDate.getTime()) || !/^\d{4}-\d{2}-\d{2}$/.test(start)) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'Invalid start date format. Use YYYY-MM-DD'
        });
      }
      updateData.start = startDate;
    }

    if (end) {
      const currentDate = new Date();
      const endDate = new Date(end);
      if (isNaN(endDate.getTime()) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'Invalid end date format. Use YYYY-MM-DD'
        });
      }
      if (currentDate < endDate) {
        updateData.winners = [];
        updateData.isProcessed = false;
      }
      updateData.end = endDate;
    }

    if (updateData.start && updateData.end && updateData.end <= updateData.start) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    const updatedCompetition = await Competition.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedCompetition
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
 * Delete a competition and its associated files
 * Admin access only
 */
exports.deleteCompetition = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      });
    }

    const submissions = await Submission.find({ competitionId: req.params.id });

    for (const submission of submissions) {
      if (submission.image && submission.image.startsWith('/images/')) {
        const imagePath = path.join(__dirname, '../../uploads', submission.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      await submission.deleteOne();
    }

    if (competition.background && competition.background.startsWith('/images/')) {
      const backgroundPath = path.join(__dirname, '../../uploads', competition.background);
      if (fs.existsSync(backgroundPath)) {
        fs.unlinkSync(backgroundPath);
      }
    }

    await competition.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Competition and all associated submissions deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Process winners for a specific competition
 * Admin access only
 */
exports.processWinners = async (req, res) => {
  try {
    const { competitionId } = req.body;
    
    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      });
    }

    if (competition.isProcessed) {
      return res.status(400).json({
        success: false,
        message: 'Winners have already been processed for this competition'
      });
    }

    const highestScore = await Submission.findOne({ competitionId })
      .sort({ score: -1 })
      .select('score')
      .lean();

    if (highestScore && highestScore.score > 0) {
      const winners = await Submission.find({
        competitionId,
        score: highestScore.score
      })
      .select('author score image _id')
      .lean();

      await Competition.findByIdAndUpdate(competitionId, {
        winners: winners.map(w => ({
          email: w.author,
          score: w.score,
          submissionId: w._id,
          image: w.image
        })),
        isProcessed: true
      });

      res.status(200).json({
        success: true,
        message: 'Winners processed successfully',
        data: winners
      });
    } else {
      await Competition.findByIdAndUpdate(competitionId, {
        isProcessed: true
      });

      res.status(200).json({
        success: true,
        message: 'No winners found',
        data: []
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};