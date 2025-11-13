const Student = require('../models/Student');
const User = require('../models/User');
const Class = require('../models/Class');
const Result = require('../models/Result');
const Attendance = require('../models/Attendance');
const ApiResponse = require('../utils/apiResponse');
const { NotFoundError, ValidationError } = require('../utils/errors');

/**
 * Create new student (Admin only)
 */
const createStudent = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      rollNo,
      department,
      batch,
      semester,
      classId,
      additionalInfo,
    } = req.body;

    // Check if user with email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    // Check if rollNo exists
    const existingStudent = await Student.findOne({ rollNo });
    if (existingStudent) {
      throw new ValidationError('Roll number already exists');
    }

    // Create user first
    const user = await User.create({
      name: { first: firstName, last: lastName },
      email,
      passwordHash: password,
      role: 'student',
      phone,
    });

    // Create student profile
    const student = await Student.create({
      userId: user._id,
      rollNo,
      department,
      batch,
      semester,
      classId,
      additionalInfo,
    });

    // Add student to class if provided
    if (classId) {
      await Class.findByIdAndUpdate(classId, {
        $addToSet: { students: student._id },
      });
    }

    const populatedStudent = await Student.findById(student._id)
      .populate('userId', 'name email phone')
      .populate('classId');

    res.status(201).json(
      ApiResponse.success(populatedStudent, 'Student created successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all students with filters and pagination
 */
const getStudents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      department,
      batch,
      semester,
      classId,
      sort = '-createdAt',
    } = req.query;

    // Build query
    const query = {};

    if (department) query.department = department;
    if (batch) query.batch = batch;
    if (semester) query.semester = parseInt(semester);
    if (classId) query.classId = classId;

    // Search in user name or rollNo
    if (search) {
      const users = await User.find({
        $or: [
          { 'name.first': { $regex: search, $options: 'i' } },
          { 'name.last': { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
        role: 'student',
      }).select('_id');

      const userIds = users.map((u) => u._id);
      query.$or = [
        { userId: { $in: userIds } },
        { rollNo: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const students = await Student.find(query)
      .populate('userId', 'name email phone isActive')
      .populate('classId', 'name code year semester')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Student.countDocuments(query);

    res.json(ApiResponse.paginated(students, page, limit, total));
  } catch (error) {
    next(error);
  }
};

/**
 * Get student by ID with results and attendance summary
 */
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'name email phone isActive meta')
      .populate('classId', 'name code year semester');

    if (!student) {
      throw new NotFoundError('Student');
    }

    // Get results summary
    const results = await Result.find({ student: student._id })
      .populate('subject', 'name code')
      .sort('-createdAt')
      .limit(10);

    // Get attendance summary
    const attendanceSummary = await Attendance.aggregate([
      { $match: { student: student._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalClasses = attendanceSummary.reduce((sum, a) => sum + a.count, 0);
    const presentClasses =
      attendanceSummary.find((a) => a._id === 'present')?.count || 0;
    const attendancePercentage =
      totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(2) : 0;

    res.json(
      ApiResponse.success({
        student,
        recentResults: results,
        attendanceSummary: {
          total: totalClasses,
          present: presentClasses,
          percentage: attendancePercentage,
          breakdown: attendanceSummary,
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update student
 */
const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      throw new NotFoundError('Student');
    }

    const { department, batch, semester, classId, additionalInfo } = req.body;

    if (department) student.department = department;
    if (batch) student.batch = batch;
    if (semester) student.semester = semester;
    if (additionalInfo) student.additionalInfo = { ...student.additionalInfo, ...additionalInfo };

    // Handle class change
    if (classId && classId !== student.classId?.toString()) {
      // Remove from old class
      if (student.classId) {
        await Class.findByIdAndUpdate(student.classId, {
          $pull: { students: student._id },
        });
      }
      // Add to new class
      await Class.findByIdAndUpdate(classId, {
        $addToSet: { students: student._id },
      });
      student.classId = classId;
    }

    await student.save();

    const updated = await Student.findById(student._id)
      .populate('userId', 'name email phone')
      .populate('classId');

    res.json(ApiResponse.success(updated, 'Student updated successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Delete student (soft delete)
 */
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      throw new NotFoundError('Student');
    }

    // Deactivate user
    await User.findByIdAndUpdate(student.userId, { isActive: false });

    // Remove from class
    if (student.classId) {
      await Class.findByIdAndUpdate(student.classId, {
        $pull: { students: student._id },
      });
    }

    res.json(ApiResponse.success(null, 'Student deactivated successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
