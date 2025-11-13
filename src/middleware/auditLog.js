/**
 * Audit Logging Middleware
 * Automatically logs important actions
 */

const Audit = require('../models/Audit');

/**
 * Middleware to log audit trail
 */
const auditLog = (action, resourceType) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;

    // Override send function to capture response
    res.send = function (data) {
      // Only log successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const resourceId =
          req.params.id ||
          req.body._id ||
          (typeof data === 'object' && data.data?._id) ||
          null;

        // Extract changes from request body
        const changes = {};
        if (req.method === 'PUT' || req.method === 'PATCH') {
          Object.keys(req.body).forEach((key) => {
            if (key !== 'password' && key !== 'passwordHash') {
              changes[key] = req.body[key];
            }
          });
        }

        // Log audit entry (async, don't wait)
        Audit.log({
          actor: req.user?._id,
          action: action || `${req.method}_${resourceType}`,
          resourceType,
          resourceId,
          after: req.method === 'POST' ? req.body : changes,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          status: 'success',
        }).catch((err) => console.error('Audit log error:', err));
      }

      // Call original send
      originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Manual audit logging helper
 */
const logAudit = async ({
  actor,
  action,
  resourceType,
  resourceId,
  before = null,
  after = null,
  req = null,
}) => {
  try {
    await Audit.log({
      actor,
      action,
      resourceType,
      resourceId,
      before,
      after,
      ip: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.get('user-agent'),
      status: 'success',
    });
  } catch (error) {
    console.error('Manual audit log error:', error);
  }
};

module.exports = {
  auditLog,
  logAudit,
};
