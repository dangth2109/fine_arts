const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadMiddleware } = require('../middleware/upload');
const {
  getAllExhibitions,
  getExhibition,
  createExhibition,
  updateExhibition,
  deleteExhibition
} = require('../controllers/exhibitionController');

// Public routes
router.get('/', getAllExhibitions);
router.get('/:id', getExhibition);

// Admin only routes
router.post('/', protect, authorize('admin'), uploadMiddleware, createExhibition);
router.put('/:id', protect, authorize('admin'), uploadMiddleware, updateExhibition);
router.delete('/:id', protect, authorize('admin'), deleteExhibition);

module.exports = router;