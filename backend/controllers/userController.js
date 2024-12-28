const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Mã hóa password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user mới
    const user = new User({
      email,
      password: hashedPassword,
      role,
      avatar: req.file ? `/images/user/${req.file.filename}` : null
    });

    await user.save();

    // Tạo JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'dangth',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra user tồn tại
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Kiểm tra password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'dangth',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get current user info
exports.getMe = async (req, res) => {
  try {
    // req.user đã được set từ auth middleware
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false, 
      message: error.message
    });
  }
};

// Get all users (Admin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user by ID (Admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update user (Admin only)
exports.updateUser = async (req, res) => {
  try {
    console.log('Starting update process');
    const { email, role, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    
    // Lấy thông tin user hiện tại trước khi update
    const currentUser = await User.findById(req.params.id);
    if (!currentUser) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Tạo object updateData
    const updateData = {};
    if(email) updateData.email = email;
    if(role) updateData.role = role;
    if(password) updateData.password = await bcrypt.hash(password, salt);

    // Xử lý avatar nếu có file mới
    if (req.file) {
      console.log('Processing new avatar');
      // Xóa avatar cũ nếu tồn tại
      if (currentUser.avatar) {
        const oldAvatarPath = path.join(__dirname, '../../uploads', currentUser.avatar);
        console.log('Checking old avatar at:', oldAvatarPath);
        try {
          if (fs.existsSync(oldAvatarPath)) {
            fs.unlinkSync(oldAvatarPath);
            console.log('Old avatar deleted successfully');
          }
        } catch (err) {
          console.error('Error deleting old avatar:', err);
        }
      }
      // Set path mới cho avatar
      updateData.avatar = `/images/user/${req.file.filename}`;
      console.log('New avatar path:', updateData.avatar);
    }

    // Update user với tất cả thông tin mới
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    console.log('User updated successfully');

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Update error:', error);
    // Cleanup file mới nếu có lỗi
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    // Kiểm tra nếu user đang cố xóa chính mình
    if (req.user._id.toString() === req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Không thể xóa tài khoản của chính mình'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Xóa avatar nếu có
    if (user.avatar) {
      const avatarPath = path.join(__dirname, '../../uploads', user.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Xóa người dùng thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get current user info
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng'
      });
    }
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prepare update data
    const updateData = {};
    
    // Update email if provided
    if (req.body.email) {
      // Check if email is already taken by another user
      const emailExists = await User.findOne({ 
        email: req.body.email,
        _id: { $ne: user._id }
      });
      
      if (emailExists) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
      updateData.email = req.body.email;
    }

    // Update password if provided
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(req.body.password, salt);
    }

    // Update avatar if provided
    if (req.file) {
      // Delete old avatar if exists
      if (user.avatar && user.avatar.startsWith('/images/')) {
        const oldPath = path.join(__dirname, '../../uploads', user.avatar);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      updateData.avatar = `/images/user/${req.file.filename}`;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true }
    ).select('-password');

    // Generate new token
    const token = jwt.sign(
      { userId: updatedUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      success: true,
      data: {
        user: updatedUser,
        token
      }
    });

  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};