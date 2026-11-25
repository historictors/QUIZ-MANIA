const User = require('../models/User');
const Department = require('../models/Department');
const Quiz = require('../models/Quiz');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboard = async (req, res, next) => {
  try {
    const [facultyCount, studentCount, departmentCount, quizCount] = await Promise.all([
      User.countDocuments({ role: 'faculty' }),
      User.countDocuments({ role: 'student' }),
      Department.countDocuments(),
      Quiz.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: {
        faculty: facultyCount,
        students: studentCount,
        departments: departmentCount,
        quizzes: quizCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all faculty
// @route   GET /api/admin/faculty
// @access  Private (Admin)
const getFaculty = async (req, res, next) => {
  try {
    const { search, department } = req.query;
    const query = { role: 'faculty' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (department) {
      query.department = department;
    }

    const faculty = await User.find(query)
      .select('-password')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: faculty
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single faculty by ID
// @route   GET /api/admin/faculty/:id
// @access  Private (Admin)
const getFacultyById = async (req, res, next) => {
  try {
    const faculty = await User.findOne({ _id: req.params.id, role: 'faculty' })
      .select('-password')
      .populate('department', 'name code');

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    res.status(200).json({
      success: true,
      data: faculty
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create faculty
// @route   POST /api/admin/faculty
// @access  Private (Admin)
const createFaculty = async (req, res, next) => {
  try {
    const { name, email, password, department } = req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and department'
      });
    }

    const deptExists = await Department.findById(department);
    if (!deptExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department'
      });
    }

    const faculty = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      department,
      role: 'faculty',
      rollNumber: undefined
    });

    const populatedFaculty = await User.findById(faculty._id)
      .select('-password')
      .populate('department', 'name code');

    res.status(201).json({
      success: true,
      message: 'Faculty created successfully',
      data: populatedFaculty
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update faculty
// @route   PUT /api/admin/faculty/:id
// @access  Private (Admin)
const updateFaculty = async (req, res, next) => {
  try {
    const { name, email, password, department } = req.body;
    const faculty = await User.findOne({ _id: req.params.id, role: 'faculty' });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    if (name) faculty.name = name;
    if (email) faculty.email = email.toLowerCase().trim();
    if (department) {
      const deptExists = await Department.findById(department);
      if (!deptExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid department'
        });
      }
      faculty.department = department;
    }
    if (password && password.trim().length > 0) {
      faculty.password = password;
    }

    await faculty.save();

    const updated = await User.findById(faculty._id)
      .select('-password')
      .populate('department', 'name code');

    res.status(200).json({
      success: true,
      message: 'Faculty updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete faculty
// @route   DELETE /api/admin/faculty/:id
// @access  Private (Admin)
const deleteFaculty = async (req, res, next) => {
  try {
    const faculty = await User.findOne({ _id: req.params.id, role: 'faculty' });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    // Block deleting a faculty member who has created quizzes
    const quizCount = await Quiz.countDocuments({ createdBy: faculty._id });
    if (quizCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete: this faculty has created quizzes'
      });
    }

    await User.findByIdAndDelete(faculty._id);

    res.status(200).json({
      success: true,
      message: 'Faculty deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all departments
// @route   GET /api/admin/departments
// @access  Private (Admin)
const getAdminDepartments = async (req, res, next) => {
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

// @desc    Get single department
// @route   GET /api/admin/departments/:id
// @access  Private (Admin)
const getDepartmentById = async (req, res, next) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    res.status(200).json({
      success: true,
      data: dept
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create department
// @route   POST /api/admin/departments
// @access  Private (Admin)
const createDepartment = async (req, res, next) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide department name and code'
      });
    }

    const department = await Department.create({
      name: name.trim(),
      code: code.trim().toUpperCase()
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update department
// @route   PUT /api/admin/departments/:id
// @access  Private (Admin)
const updateDepartment = async (req, res, next) => {
  try {
    const { name, code } = req.body;
    const dept = await Department.findById(req.params.id);

    if (!dept) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    if (name) dept.name = name.trim();
    if (code) dept.code = code.trim().toUpperCase();

    await dept.save();

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: dept
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department
// @route   DELETE /api/admin/departments/:id
// @access  Private (Admin)
const deleteDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findById(req.params.id);

    if (!dept) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if in use by any user or quiz
    const [userCount, quizCount] = await Promise.all([
      User.countDocuments({ department: dept._id }),
      Quiz.countDocuments({ department: dept._id })
    ]);

    if (userCount > 0 || quizCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete: department is in use'
      });
    }

    await Department.findByIdAndDelete(dept._id);

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students (admin view only)
// @route   GET /api/admin/students
// @access  Private (Admin)
const getStudents = async (req, res, next) => {
  try {
    const { search, department } = req.query;
    const query = { role: 'student' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (department) {
      query.department = department;
    }

    const students = await User.find(query)
      .select('-password')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getAdminDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getStudents
};
