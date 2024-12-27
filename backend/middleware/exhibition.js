const Exhibition = require('../models/Exhibition');

/**
 * Check if exhibition exists and is still active
 */
exports.checkExhibitionStatus = async (req, res, next) => {
  try {
    const exhibition = await Exhibition.findById(req.params.id);
    
    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: 'Exhibition not found'
      });
    }

    const now = new Date();
    if (now > new Date(exhibition.end)) {
      return res.status(400).json({
        success: false,
        message: 'Exhibition has ended'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};