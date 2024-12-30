const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');

/**
 * Multer configuration for user avatars
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/images/user');
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
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
}).single('avatar');

/**
 * Upload middleware with error handling and field parsing
 */
const uploadMiddleware = (req, res, next) => {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (req.body.email) req.body.email = req.body.email.toString();
    if (req.body.role) req.body.role = req.body.role.toString();

    next();
  });
};

const {
  register,
  login,
  getMe,
  getAllUsers,
  updateUser,
  deleteUser,
  updateCurrentUser
  
} = require('../controllers/userController');

// Public routes
router.post('/register', uploadMiddleware, register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, uploadMiddleware, updateCurrentUser);
router.get('/', protect, authorize('admin', 'manager', 'staff'), getAllUsers);
router.put('/:id', protect, authorize('admin', 'manager'), uploadMiddleware, updateUser);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteUser);

module.exports = router;