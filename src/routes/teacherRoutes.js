const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { authenticate, authorize } = require('../middleware/auth');
const { can } = require('../middleware/permissions');
const { auditLog } = require('../middleware/auditLog');

/**
 * @route   POST /api/v1/teachers
 * @desc    Create new teacher
 * @access  Private (Admin)
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  can('manage:teachers'),
  auditLog('CREATE_TEACHER', 'Teacher'),
  teacherController.createTeacher
);

/**
 * @route   GET /api/v1/teachers
 * @desc    Get all teachers
 * @access  Private (Admin, Teacher)
 */
router.get(
  '/',
  authenticate,
  authorize('admin', 'teacher'),
  teacherController.getTeachers
);

/**
 * @route   GET /api/v1/teachers/:id
 * @desc    Get teacher by ID
 * @access  Private (Admin, Teacher)
 */
router.get(
  '/:id',
  authenticate,
  authorize('admin', 'teacher'),
  teacherController.getTeacherById
);

/**
 * @route   PUT /api/v1/teachers/:id
 * @desc    Update teacher
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  can('manage:teachers'),
  auditLog('UPDATE_TEACHER', 'Teacher'),
  teacherController.updateTeacher
);

/**
 * @route   DELETE /api/v1/teachers/:id
 * @desc    Delete teacher
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  can('manage:teachers'),
  auditLog('DELETE_TEACHER', 'Teacher'),
  teacherController.deleteTeacher
);

module.exports = router;
