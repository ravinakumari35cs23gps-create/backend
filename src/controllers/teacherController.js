const Teacher = require('../models/Teacher');
const User = require('../models/User');
const Subject = require('../models/Subject');
const ApiResponse = require('../utils/apiResponse');
const { NotFoundError, ValidationError } = require('../utils/errors');

/**
 * Create new teacher (Admin only)
 */
const createTeacher = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      employeeId,
      department,
      subjects,
      qualification,
      specialization,
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    // Check if employeeId exists
    const existingTeacher = await Teacher.findOne({ employeeId });
    if (existingTeacher) {
      throw new ValidationError('Employee ID already exists');
    }

    // Create user
    const user = await User.create({
      name: { first: firstName, last: lastName },
      email,
      passwordHash: password,
      role: 'teacher',
      phone,
    });

    // Create teacher profile
    const teacher = await Teacher.create({
      userId: user._id,
      employeeId,
      department,
      subjects: subjects || [],
      qualification,
      specialization,
    });

    const populated = await Teacher.findById(teacher._id)
      .populate('userId', 'name email phone')
      .populate('subjects', 'name code');

    res.status(201).json(
      ApiResponse.success(populated, 'Teacher created successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all teachers
 */
const getTeachers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      department,
      sort = '-createdAt',
    } = req.query;

    const query = {};
    if (department) query.department = department;

    // Search in user name or employeeId
    if (search) {
      const users = await User.find({
        $or: [
          { 'name.first': { $regex: search, $options: 'i' } },
          { 'name.last': { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
        role: 'teacher',
      }).select('_id');

      const userIds = users.map((u) => u._id);
      query.$or = [
        { userId: { $in: userIds } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const teachers = await Teacher.find(query)
      .populate('userId', 'name email phone isActive')
      .populate('subjects', 'name code')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Teacher.countDocuments(query);

    res.json(ApiResponse.paginated(teachers, page, limit, total));
  } catch (error) {
    next(error);
  }
};

/**
 * Get teacher by ID
 */
const getTeacherById = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('userId', 'name email phone isActive meta')
      .populate('subjects', 'name code maxMarks');

    if (!teacher) {
      throw new NotFoundError('Teacher');
    }

    res.json(ApiResponse.success(teacher));
  } catch (error) {
    next(error);
  }
};

/**
 * Update teacher
 */
const updateTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      throw new NotFoundError('Teacher');
    }

    const { department, subjects, qualification, specialization } = req.body;

    if (department) teacher.department = department;
    if (subjects) teacher.subjects = subjects;
    if (qualification) teacher.qualification = qualification;
    if (specialization) teacher.specialization = specialization;

    await teacher.save();

    const updated = await Teacher.findById(teacher._id)
      .populate('userId', 'name email phone')
      .populate('subjects', 'name code');

    res.json(ApiResponse.success(updated, 'Teacher updated successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Delete teacher (soft delete)
 */
const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      throw new NotFoundError('Teacher');
    }

    // Deactivate user
    await User.findByIdAndUpdate(teacher.userId, { isActive: false });

    res.json(ApiResponse.success(null, 'Teacher deactivated successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
};
