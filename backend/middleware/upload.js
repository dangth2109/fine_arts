const multer = require('multer');
const path = require('path');

// Cấu hình storage cho multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/images/exhibitions'));
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Lọc file - chỉ cho phép upload ảnh
const fileFilter = (req, file, cb) => {
  // Kiểm tra mimetype
  if (file.mimetype.startsWith('image/')) {
    // Kiểm tra extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      return cb(null, true);
    }
  }
  cb(new Error('Only image files are allowed (jpeg, jpg, png)'), false);
};

// Tạo middleware upload
const uploadMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).single('background');

/**
 * Handle file upload with validation and error handling
 */
module.exports = {
  uploadMiddleware: (req, res, next) => {
    uploadMiddleware(req, res, function(err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      if (req.method === 'POST' && !req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please upload an image file'
        });
      }
      
      next();
    });
  }
};