const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      first: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
      },
      last: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
      }
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student'],
      default: 'student',
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    tokenVersion: {
      type: Number,
      default: 0,
      select: false,
    },
    meta: {
      lastLoginAt: Date,
      loginCount: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
// email already has unique: true in schema, no need to define index again
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Method to increment token version (for revocation)
userSchema.methods.incrementTokenVersion = async function () {
  this.tokenVersion += 1;
  await this.save();
};

// Method to get public profile
userSchema.methods.getPublicProfile = function () {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.refreshToken;
  delete user.tokenVersion;
  return user;
};

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.name.first} ${this.name.last}`;
});

const User = mongoose.model('User', userSchema);

module.exports = User;
