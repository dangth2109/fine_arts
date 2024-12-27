const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'staff', 'manager', 'student'],
    default: 'user',
  },
  avatar: {
    type: String,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);