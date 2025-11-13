/**
 * Permission-based Authorization Middleware
 * Checks if user has specific permissions based on role and resource
 */

const { AuthorizationError } = require('../utils/errors');

// Define permissions for each role
const permissions = {
  admin: [
    'manage:users',
    'manage:students',
    'manage:teachers',
    'manage:classes',
    'manage:subjects',
    'enter:marks',
    'approve:results',
    'view:all-results',
    'manage:attendance',
    'view:analytics',
    'manage:settings',
  ],
  teacher: [
    'view:assigned-students',
    'enter:marks',
    'view:assigned-results',
    'manage:attendance',
    'view:assigned-analytics',
  ],
  student: [
    'view:own-results',
    'view:own-attendance',
    'view:own-profile',
  ],
};

/**
 * Check if user has permission
 */
const hasPermission = (role, permission) => {
  return permissions[role]?.includes(permission) || false;
};

/**
 * Middleware to check if user can perform action
 */
const can = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AuthorizationError('Authentication required');
    }

    if (!hasPermission(req.user.role, permission)) {
      throw new AuthorizationError(
        `You do not have permission to ${permission.replace(':', ' ')}`
      );
    }

    next();
  };
};

/**
 * Check if teacher is assigned to subject
 */
const isAssignedTeacher = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return next();
    }

    if (req.user.role !== 'teacher') {
      throw new AuthorizationError('Only teachers can access this resource');
    }

    const Teacher = require('../models/Teacher');
    const teacher = await Teacher.findOne({ userId: req.user._id });

    if (!teacher) {
      throw new AuthorizationError('Teacher profile not found');
    }

    const subjectId = req.body.subjectId || req.params.subjectId;
    const isAssigned = teacher.subjects.some(
      (s) => s.toString() === subjectId
    );

    if (!isAssigned) {
      throw new AuthorizationError('Not assigned to this subject');
    }

    req.teacher = teacher;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if accessing own resource
 */
const isOwnResource = (resourceIdParam = 'id') => {
  return (req, res, next) => {
    const resourceId = req.params[resourceIdParam];
    const userId = req.user._id.toString();

    if (req.user.role === 'admin') {
      return next();
    }

    if (resourceId !== userId) {
      throw new AuthorizationError('You can only access your own resources');
    }

    next();
  };
};

module.exports = {
  can,
  hasPermission,
  isAssignedTeacher,
  isOwnResource,
  permissions,
};
