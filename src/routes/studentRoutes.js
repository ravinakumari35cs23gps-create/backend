const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');
const { can } = require('../middleware/permissions');
const { auditLog } = require('../middleware/auditLog');

/**
 * @route   GET /api/v1/students
 * @desc    Get all students
 * @access  Private (Admin, Teacher)
 */
router.get(
  '/',
  authenticate,
  authorize('admin', 'teacher'),
  studentController.getStudents
);

/**
 * @route   GET /api/v1/students/:id
 * @desc    Get student by ID
 * @access  Private (Admin, Teacher)
 */
router.get(
  '/:id',
  authenticate,
  authorize('admin', 'teacher'),
  studentController.getStudentById
);

/**
 * @route   POST /api/v1/students
 * @desc    Create new student
 * @access  Private (Admin)
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  can('manage:students'),
  auditLog('CREATE_STUDENT', 'Student'),
  studentController.createStudent
);

/**
 * @route   PUT /api/v1/students/:id
 * @desc    Update student
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  can('manage:students'),
  auditLog('UPDATE_STUDENT', 'Student'),
  studentController.updateStudent
);

/**
 * @route   DELETE /api/v1/students/:id
 * @desc    Delete student
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  can('manage:students'),
  auditLog('DELETE_STUDENT', 'Student'),
  studentController.deleteStudent
);

module.exports = router;
