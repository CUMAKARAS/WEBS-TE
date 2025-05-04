const mongoose = require('mongoose');

// Kullanıcı şeması
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  googleId: {
    type: String,
    sparse: true
  },
  profilePicture: {
    type: String,
    default: '/images/default-avatar.png'
  },
  bio: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
});

// MongoDB modeli
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User; 