const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    rollNo: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    batch: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
    },
    additionalInfo: {
      dob: Date,
      address: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String,
      },
      guardian: {
        name: String,
        phone: String,
        email: String,
        relation: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// userId and rollNo already have unique: true in schema, no need to define index again
studentSchema.index({ department: 1, batch: 1 });
studentSchema.index({ classId: 1 });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
