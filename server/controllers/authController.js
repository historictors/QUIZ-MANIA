const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Department = require('../models/Department');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });
};

// @desc    Register a new student
// @route   POST /api/auth/student/register
// @access  Public
const registerStudent = async (req, res, next) => {
  try {
    const { name, email, password, rollNumber, department, year } = req.body;

    if (!name || !email || !password || !rollNumber || !department || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const deptExists = await Department.findById(department);
    if (!deptExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department'
      });
    }

    const student = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: 'student',
      rollNumber: rollNumber.trim(),
      department,
      year: Number(year)
    });

    const token = generateToken(student._id, student.role);

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: {
        token,
        user: {
          _id: student._id,
          name: student.name,
          email: student.email,
          role: student.role,
          rollNumber: student.rollNumber,
          department: student.department,
          year: student.year
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Single login for all roles
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          rollNumber: user.rollNumber,
          department: user.department,
          year: user.year
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('department', 'name code');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all departments (public for registration & quiz forms)
// @route   GET /api/departments
// @access  Public
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: departments
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerStudent,
  loginUser,
  getMe,
  getDepartments
};
