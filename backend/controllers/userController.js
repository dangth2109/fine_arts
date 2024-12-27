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

// Update user
exports.updateUser = async (req, res) => {
  try {
    console.log('1. Starting update process');
    console.log('Request body after middleware:', req.body);
    console.log('Request file after middleware:', req.file);

    // Debug log
    console.log('1.5 Checking request data validity');
    if (!req.params.id) {
      console.log('No ID provided');
      return res.status(400).json({
        success: false,
        message: 'No user ID provided'
      });
    }

    // Tạo object updateData
    console.log('1.7 Creating update data object');
    const updateData = {};
    
    if (req.body.email) {
      console.log('Adding email to update data');
      updateData.email = req.body.email;
    }
    
    if (req.body.role) {
      console.log('Adding role to update data');
      updateData.role = req.body.role;
    }
    
    if (req.file) {
      console.log('Adding avatar to update data');
      updateData.avatar = `/images/user/${req.file.filename}`;
      console.log('Avatar path:', updateData.avatar);
    }

    console.log('2. Update data to be sent:', updateData);

    // Thực hiện update
    console.log('2.5 Attempting to update user:', req.params.id);
    const result = await User.findOneAndUpdate(
      { _id: req.params.id },
      updateData,
      { 
        new: true,
        runValidators: true
      }
    ).select('-password');

    console.log('3. Update result:', result);

    if (!result) {
      console.log('No user found with ID:', req.params.id);
      if (req.file) {
        console.log('Deleting uploaded file due to user not found');
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('4. Successfully updated user');
    res.status(200).json({
      success: true,
      data: result,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Update error:', error);
    if (req.file) {
      console.log('Deleting uploaded file due to error');
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete user
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
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-password');

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

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }
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