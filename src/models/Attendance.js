const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'leave', 'late'],
      required: true,
      default: 'present',
    },
    remarks: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
attendanceSchema.index({ student: 1, subject: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ subject: 1, date: 1 });
attendanceSchema.index({ student: 1, date: -1 });

// Virtual for formatted date
attendanceSchema.virtual('formattedDate').get(function () {
  return this.date.toISOString().split('T')[0];
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
