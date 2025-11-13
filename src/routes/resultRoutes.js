const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const { authenticate, authorize } = require('../middleware/auth');
const { can } = require('../middleware/permissions');
const { auditLog } = require('../middleware/auditLog');

/**
 * @route   POST /api/v1/results/enter-marks
 * @desc    Enter marks for a student
 * @access  Private (Admin, Teacher)
 */
router.post(
  '/enter-marks',
  authenticate,
  authorize('admin', 'teacher'),
  can('enter:marks'),
  auditLog('ENTER_MARKS', 'Result'),
  resultController.enterMarks
);

/**
 * @route   GET /api/v1/results
 * @desc    Get all results with filters
 * @access  Private (All authenticated users)
 */
router.get('/', authenticate, resultController.getResults);

/**
 * @route   GET /api/v1/results/:id
 * @desc    Get result by ID
 * @access  Private (All authenticated users)
 */
router.get('/:id', authenticate, resultController.getResultById);

/**
 * @route   PUT /api/v1/results/:id
 * @desc    Update result
 * @access  Private (Admin, Teacher)
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'teacher'),
  can('enter:marks'),
  auditLog('UPDATE_RESULT', 'Result'),
  resultController.updateResult
);

/**
 * @route   PUT /api/v1/results/:id/verify
 * @desc    Verify result
 * @access  Private (Admin)
 */
router.put(
  '/:id/approve',
  authenticate,
  authorize('admin'),
  can('approve:results'),
  auditLog('APPROVE_RESULT', 'Result'),
  resultController.approveResult
);

/**
 * @route   DELETE /api/v1/results/:id
 * @desc    Delete result
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  auditLog('DELETE_RESULT', 'Result'),
  resultController.deleteResult
);

module.exports = router;
