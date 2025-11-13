const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    resourceType: {
      type: String,
      required: true,
      trim: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    before: {
      type: mongoose.Schema.Types.Mixed,
    },
    after: {
      type: mongoose.Schema.Types.Mixed,
    },
    changes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    ip: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
auditSchema.index({ actor: 1, createdAt: -1 });
auditSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });
auditSchema.index({ action: 1, createdAt: -1 });
auditSchema.index({ createdAt: -1 });

// TTL index - auto-delete logs older than 90 days
auditSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

// Static method to log action
auditSchema.statics.log = async function (data) {
  try {
    await this.create(data);
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
};

const Audit = mongoose.model('Audit', auditSchema);

module.exports = Audit;
