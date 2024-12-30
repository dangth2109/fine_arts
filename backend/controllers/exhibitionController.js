const Exhibition = require('../models/Exhibition');
const Submission = require('../models/Submission');
const fs = require('fs');
const path = require('path');

/**
 * Get all exhibitions with basic information
 * Public access
 */
exports.getAllExhibitions = async (req, res) => {
  try {
    const {name, location, status, isHide, start, end} = req.query;

    const filter = {};

    if (name) filter.name = { $regex: name, $options: 'i' };
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (status) {
      const now = new Date();
      if (status === 'ended') filter.end = { $lt: now };
      else if (status === 'in-progress') filter.$and = [
        { start: { $lte: now } },
        { end: { $gt: now } }
      ];
      else if (status === 'upcoming') filter.start = { $gt: now };
    }
    if (isHide) filter.isHide = isHide;
    if (start || end) {
      if (start) {
        filter.start = { $gte: new Date(start) };
      }
      if (end) {
        filter.end = { $lte: new Date(end) };
      }
    }

    const exhibitions = await Exhibition.find(filter)
      .select('name description location background start end artwork totalSubmissions isHide')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: exhibitions.length,
      data: exhibitions
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
 * Get detailed information of a specific exhibition
 * Public access
 */
exports.getExhibition = async (req, res) => {
  try {
    const exhibition = await Exhibition.findById(req.params.id)
      .select('name description location background start end artwork totalSubmissions isHide');
    
    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: 'Exhibition not found'
      });
    }

    res.status(200).json({
      success: true,
      data: exhibition
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'Exhibition not found'
    });
  }
};

/**
 * Create a new exhibition
 * Admin, Manager access
 */
exports.createExhibition = async (req, res) => {
  try {
    const { name, description, location, start, end } = req.body;

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

    const exhibition = new Exhibition({
      name,
      description,
      location,
      background: `/images/exhibitions/${req.file.filename}`,
      start: startDate,
      end: endDate,
      artwork: [],
      totalSubmissions: 0
    });

    await exhibition.save();

    res.status(201).json({
      success: true,
      data: exhibition
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
 * Update exhibition details
 * Admin, Manager access
 */
exports.updateExhibition = async (req, res) => {
  try {
    const { name, description, location, start, end, artwork, isHide } = req.body;
    const exhibition = await Exhibition.findById(req.params.id);

    if (!exhibition) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Exhibition not found'
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (location) updateData.location = location;
    if (isHide) updateData.isHide = isHide;

    if (req.file) {
      if (exhibition.background && exhibition.background.startsWith('/images/')) {
        const oldPath = path.join(__dirname, '../../uploads', exhibition.background);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      updateData.background = `/images/exhibitions/${req.file.filename}`;
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
      const endDate = new Date(end);
      if (isNaN(endDate.getTime()) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'Invalid end date format. Use YYYY-MM-DD'
        });
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

    if (updateData.start && updateData.start >= exhibition.end) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }

    if (updateData.end && updateData.end <= exhibition.start) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    if (artwork && Array.isArray(artwork)) {
      const submissions = await Submission.find({
        _id: { $in: artwork }
      }).select('image author');

      if (submissions.length !== artwork.length) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(404).json({
          success: false,
          message: 'Some submissions not found'
        });
      }

      updateData.artwork = submissions.map(sub => ({
        image: sub.image,
        author: sub.author,
        _id: sub._id
      }));
      updateData.totalSubmissions = submissions.length;
    }

    const updatedExhibition = await Exhibition.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedExhibition
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
 * Delete an exhibition and its associated files
 * Admin, Manager access
 */
exports.deleteExhibition = async (req, res) => {
  try {
    const exhibition = await Exhibition.findById(req.params.id);

    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: 'Exhibition not found'
      });
    }

    if (exhibition.background && exhibition.background.startsWith('/images/')) {
      const backgroundPath = path.join(__dirname, '../../uploads', exhibition.background);
      if (fs.existsSync(backgroundPath)) {
        fs.unlinkSync(backgroundPath);
      }
    }

    await exhibition.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Exhibition deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};