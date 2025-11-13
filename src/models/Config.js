const mongoose = require('mongoose');

const configSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: ['system', 'grading', 'exam', 'notification', 'academic'],
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
configSchema.index({ key: 1 }, { unique: true });
configSchema.index({ category: 1 });

// Default configurations
const defaultConfigs = [
  {
    key: 'GRADE_MAPPING',
    category: 'grading',
    description: 'Grade to percentage mapping',
    value: {
      'A+': { min: 90, max: 100, gradePoint: 10 },
      'A': { min: 80, max: 89, gradePoint: 9 },
      'B+': { min: 70, max: 79, gradePoint: 8 },
      'B': { min: 60, max: 69, gradePoint: 7 },
      'C': { min: 50, max: 59, gradePoint: 6 },
      'D': { min: 40, max: 49, gradePoint: 5 },
      'F': { min: 0, max: 39, gradePoint: 0 },
    },
  },
  {
    key: 'EXAM_TYPES',
    category: 'exam',
    description: 'Available exam types',
    value: ['mid', 'final', 'practical', 'assignment'],
  },
  {
    key: 'PASSING_PERCENTAGE',
    category: 'grading',
    description: 'Minimum passing percentage',
    value: 40,
  },
  {
    key: 'ATTENDANCE_THRESHOLD',
    category: 'academic',
    description: 'Minimum attendance percentage required',
    value: 75,
  },
];

// Static method to initialize default configs
configSchema.statics.initializeDefaults = async function () {
  for (const config of defaultConfigs) {
    await this.findOneAndUpdate(
      { key: config.key },
      config,
      { upsert: true, new: true }
    );
  }
};

// Static method to get config value
configSchema.statics.getValue = async function (key) {
  const config = await this.findOne({ key: key.toUpperCase(), isActive: true });
  return config ? config.value : null;
};

const Config = mongoose.model('Config', configSchema);

module.exports = Config;
