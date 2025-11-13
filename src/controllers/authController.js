const User = require('../models/User');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt');
const ApiResponse = require('../utils/apiResponse');
const { ValidationError, AuthenticationError, ConflictError } = require('../utils/errors');

/**
 * Register new user
 */
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Create user
    const user = await User.create({
      name: {
        first: firstName,
        last: lastName,
      },
      email,
      passwordHash: password,
      role: role || 'student',
      phone,
    });

    // Generate tokens with version
    const tokens = generateTokenPair(user._id, user.role, user.tokenVersion);

    // Save refresh token
    user.refreshToken = tokens.refreshToken;
    user.meta.loginCount = 1;
    user.meta.lastLoginAt = new Date();
    await user.save();

    // Return response
    res.status(201).json(
      ApiResponse.success(
        {
          user: user.getPublicProfile(),
          ...tokens,
        },
        'Registration successful'
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Find user with password and tokenVersion fields
    const user = await User.findOne({ email }).select('+passwordHash +tokenVersion');

    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Generate tokens with current token version
    const tokens = generateTokenPair(user._id, user.role, user.tokenVersion);

    // Update refresh token and login metadata
    user.refreshToken = tokens.refreshToken;
    user.meta.lastLoginAt = new Date();
    user.meta.loginCount = (user.meta.loginCount || 0) + 1;
    await user.save();

    // Return response
    res.json(
      ApiResponse.success(
        {
          user: user.getPublicProfile(),
          ...tokens,
        },
        'Login successful'
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user with refresh token and token version
    const user = await User.findById(decoded.userId).select('+refreshToken +tokenVersion');

    if (!user || user.refreshToken !== refreshToken) {
      throw new AuthenticationError('Invalid refresh token');
    }

    // Check if token version matches (revocation check)
    if (decoded.tokenVersion !== user.tokenVersion) {
      throw new AuthenticationError('Token has been revoked');
    }

    // Generate new tokens with current version
    const tokens = generateTokenPair(user._id, user.role, user.tokenVersion);

    // Update refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json(
      ApiResponse.success(tokens, 'Token refreshed successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 */
const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+tokenVersion');
    
    if (user) {
      // Increment token version to invalidate all existing tokens
      await user.incrementTokenVersion();
      user.refreshToken = null;
      await user.save();
    }

    res.json(ApiResponse.success(null, 'Logout successful'));
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    res.json(ApiResponse.success(user.getPublicProfile(), 'Profile retrieved'));
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json(ApiResponse.success(user.getPublicProfile(), 'Profile updated'));
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ValidationError('Current and new password are required');
    }

    const user = await User.findById(req.user._id).select('+passwordHash +tokenVersion');

    // Verify current password
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Update password
    user.passwordHash = newPassword;
    
    // Invalidate all existing tokens by incrementing version
    await user.incrementTokenVersion();
    user.refreshToken = null;
    
    await user.save();

    res.json(ApiResponse.success(null, 'Password changed successfully. Please login again.'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword,
};
