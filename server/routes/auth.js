const express = require('express');
const router = express.Router();
const {
  registerStudent,
  loginUser,
  getMe,
  getDepartments
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/student/register', registerStudent);
router.post('/login', loginUser);

// Protected routes
router.get('/me', protect, getMe);

module.exports = { authRouter: router, getDepartments };
