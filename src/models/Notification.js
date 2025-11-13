const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['email', 'sms', 'in-app', 'push'],
      required: true,
      default: 'in-app',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    data: {
      link: String,
      meta: mongoose.Schema.Types.Mixed,
      action: String,
      resourceType: String,
      resourceId: mongoose.Schema.Types.ObjectId,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    readAt: {
      type: Date,
    },
    sentAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'read'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ to: 1, createdAt: -1 });
notificationSchema.index({ to: 1, readAt: 1 });
notificationSchema.index({ status: 1, createdAt: 1 });
notificationSchema.index({ type: 1, status: 1 });

// TTL index - auto-delete read notifications after 30 days
notificationSchema.index({ readAt: 1 }, { expireAfterSeconds: 2592000, partialFilterExpression: { readAt: { $exists: true } } });

// Method to mark as read
notificationSchema.methods.markAsRead = async function () {
  this.readAt = new Date();
  this.status = 'read';
  await this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
