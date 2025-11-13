const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticate, authorize } = require('../middleware/auth');
const { can } = require('../middleware/permissions');
const { auditLog } = require('../middleware/auditLog');

/**
 * @route   POST /api/v1/attendance
 * @desc    Mark attendance for students
 * @access  Private (Admin, Teacher)
 */
router.post(
  '/',
  authenticate,
  authorize('admin', 'teacher'),
  can('manage:attendance'),
  auditLog('MARK_ATTENDANCE', 'Attendance'),
  attendanceController.markAttendance
);

/**
 * @route   GET /api/v1/attendance
 * @desc    Get attendance records with filters
 * @access  Private (All authenticated)
 */
router.get(
  '/',
  authenticate,
  attendanceController.getAttendance
);

/**
 * @route   GET /api/v1/attendance/summary/:studentId
 * @desc    Get attendance summary for a student
 * @access  Private (All authenticated)
 */
router.get(
  '/summary/:studentId',
  authenticate,
  attendanceController.getAttendanceSummary
);

module.exports = router;
