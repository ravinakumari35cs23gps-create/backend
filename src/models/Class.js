const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      default: () => new Date().getFullYear(),
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    maxStrength: {
      type: Number,
      default: 60,
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
classSchema.index({ year: 1, semester: 1 });
classSchema.index({ classTeacher: 1 });

// Virtual for current strength
classSchema.virtual('currentStrength').get(function () {
  return this.students ? this.students.length : 0;
});

const Class = mongoose.model('Class', classSchema);

module.exports = Class;
