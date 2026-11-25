const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);

router.route('/faculty')
  .get(getFaculty)
  .post(createFaculty);

router.route('/faculty/:id')
  .get(getFacultyById)
  .put(updateFaculty)
  .delete(deleteFaculty);

router.route('/departments')
  .get(getAdminDepartments)
  .post(createDepartment);

router.route('/departments/:id')
  .get(getDepartmentById)
  .put(updateDepartment)
  .delete(deleteDepartment);

router.get('/students', getStudents);

module.exports = router;
