const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/v1/reports/student/:studentId
 * @desc    Get student report summary
 * @access  Private (All authenticated)
 */
router.get(
  '/student/:studentId',
  authenticate,
  reportController.getStudentReport
);

/**
 * @route   GET /api/v1/reports/class/:classId
 * @desc    Get class performance report
 * @access  Private (Admin, Teacher)
 */
router.get(
  '/class/:classId',
  authenticate,
  authorize('admin', 'teacher'),
  reportController.getClassReport
);

/**
 * @route   GET /api/v1/reports/export
 * @desc    Trigger report export (PDF/CSV)
 * @access  Private (All authenticated)
 */
router.get(
  '/export',
  authenticate,
  reportController.exportReport
);

module.exports = router;
