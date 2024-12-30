const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');
const {
  createCompetition,
  getAllCompetitions,
  getCompetition,
  updateCompetition,
  deleteCompetition,
  processWinners
} = require('../controllers/competitionController');

/**
 * Multer configuration for competition background images
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/images/competitions');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png)'));
    }
  }
}).single('background');

/**
 * Upload middleware with error handling
 */
const uploadMiddleware = (req, res, next) => {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ 
        success: false,
        message: 'Upload error: ' + err.message 
      });
    } else if (err) {
      return res.status(400).json({ 
        success: false,
        message: err.message 
      });
    }
    next();
  });
};

// Public routes
router.get('/', getAllCompetitions);
router.get('/:id', getCompetition);

// Protected routes (admin only)
router.post('/', protect, authorize('admin', 'manager'), uploadMiddleware, createCompetition);
router.put('/:id', protect, authorize('admin', 'manager'), uploadMiddleware, updateCompetition);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteCompetition);
router.post('/process-winners', protect, authorize('admin', 'manager'), processWinners);

module.exports = router;