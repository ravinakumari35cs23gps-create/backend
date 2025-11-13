const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    maxMarks: {
      type: Number,
      required: true,
      default: 100,
    },
    passMarks: {
      type: Number,
      required: true,
      default: 40,
    },
    assignedTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    classIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
      },
    ],
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['theory', 'practical', 'both'],
      default: 'theory',
    },
    credits: {
      type: Number,
      default: 3,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// code already has unique: true in schema, no need to define index again
subjectSchema.index({ assignedTeacher: 1 });
subjectSchema.index({ classIds: 1 });

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
