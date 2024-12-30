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

// Admin, Manager only routes
router.post('/', protect, authorize('admin', 'manager'), uploadMiddleware, createExhibition);
router.put('/:id', protect, authorize('admin', 'manager'), uploadMiddleware, updateExhibition);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteExhibition);

module.exports = router;