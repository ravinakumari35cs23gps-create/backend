const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
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
    marksObtained: {
      type: Number,
      required: true,
      min: 0,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
    },
    examType: {
      type: String,
      enum: ['mid', 'final', 'practical', 'assignment'],
      required: true,
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'B+', 'B', 'C', 'D', 'F', 'I'],
    },
    gradePoint: {
      type: Number,
      min: 0,
      max: 10,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    isPassed: {
      type: Boolean,
      default: false,
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
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
resultSchema.index({ student: 1, semester: 1, subject: 1 }, { unique: true });
resultSchema.index({ subject: 1, semester: 1, marksObtained: -1 });
resultSchema.index({ student: 1, examType: 1 });
resultSchema.index({ createdBy: 1 });

// Calculate grade and percentage before saving
resultSchema.pre('save', async function (next) {
  // Get subject to get maxMarks and passMarks
  const Subject = mongoose.model('Subject');
  const subject = await Subject.findById(this.subject);
  
  if (subject) {
    // Calculate percentage
    this.percentage = ((this.marksObtained / subject.maxMarks) * 100).toFixed(2);
    
    // Assign grade and grade point
    if (this.percentage >= 90) {
      this.grade = 'A+';
      this.gradePoint = 10;
    } else if (this.percentage >= 80) {
      this.grade = 'A';
      this.gradePoint = 9;
    } else if (this.percentage >= 70) {
      this.grade = 'B+';
      this.gradePoint = 8;
    } else if (this.percentage >= 60) {
      this.grade = 'B';
      this.gradePoint = 7;
    } else if (this.percentage >= 50) {
      this.grade = 'C';
      this.gradePoint = 6;
    } else if (this.percentage >= 40) {
      this.grade = 'D';
      this.gradePoint = 5;
    } else {
      this.grade = 'F';
      this.gradePoint = 0;
    }
    
    // Check if passed
    this.isPassed = this.marksObtained >= subject.passMarks;
  }
  
  next();
});

const Result = mongoose.model('Result', resultSchema);

module.exports = Result;
