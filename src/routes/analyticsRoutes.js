const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/v1/analytics/class/:classId/top-performers
 * @desc    Get top performers in a class
 * @access  Private (Admin, Teacher)
 */
router.get(
  '/class/:classId/top-performers',
  authenticate,
  authorize('admin', 'teacher'),
  analyticsController.getTopPerformers
);

/**
 * @route   GET /api/v1/analytics/subject/:subjectId/distribution
 * @desc    Get marks distribution for a subject
 * @access  Private (Admin, Teacher)
 */
router.get(
  '/subject/:subjectId/distribution',
  authenticate,
  authorize('admin', 'teacher'),
  analyticsController.getSubjectDistribution
);

/**
 * @route   GET /api/v1/analytics/trends
 * @desc    Get performance trends over time
 * @access  Private (Admin, Teacher)
 */
router.get(
  '/trends',
  authenticate,
  authorize('admin', 'teacher'),
  analyticsController.getPerformanceTrends
);

module.exports = router;
