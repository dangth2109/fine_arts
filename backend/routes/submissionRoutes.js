const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');
const {
  createSubmission,
  getAllSubmissions,
  getSubmissionDetail,
  updateSubmission,
  deleteSubmission,
  getSubmissionsByCompetition
} = require('../controllers/submissionController');


/**
 * Multer configuration for submission images
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/images/submissions');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const competitionId = req.body.competitionId;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${competitionId}_${timestamp}${ext}`);
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
});

// Protected routes
router.post('/', protect, upload.single('image'), createSubmission);
router.get('/', protect, getAllSubmissions);
router.get('/:id', protect, getSubmissionDetail);
router.put('/:id', protect, authorize('admin', 'manager', 'staff'), updateSubmission);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteSubmission);
router.get('/competition/:competitionId', getSubmissionsByCompetition);

module.exports = router;