const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const ApiResponse = require('../utils/apiResponse');
const { NotFoundError, ValidationError } = require('../utils/errors');

/**
 * Mark attendance (bulk for a class/subject/date)
 */
const markAttendance = async (req, res, next) => {
  try {
    const { subjectId, date, entries } = req.body;

    // Verify subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject');
    }

    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    const results = [];
    const errors = [];

    for (const entry of entries) {
      try {
        // Check if student exists
        const student = await Student.findById(entry.studentId);
        if (!student) {
          errors.push({ studentId: entry.studentId, error: 'Student not found' });
          continue;
        }

        // Check if attendance already marked for this date
        const existing = await Attendance.findOne({
          student: entry.studentId,
          subject: subjectId,
          date: attendanceDate,
        });

        let attendance;
        if (existing) {
          // Update existing
          existing.status = entry.status;
          existing.remarks = entry.remarks;
          attendance = await existing.save();
        } else {
          // Create new
          attendance = await Attendance.create({
            student: entry.studentId,
            subject: subjectId,
            date: attendanceDate,
            status: entry.status,
            remarks: entry.remarks,
            createdBy: req.user._id,
          });
        }

        results.push(attendance);
      } catch (error) {
        errors.push({ studentId: entry.studentId, error: error.message });
      }
    }

    res.status(201).json(
      ApiResponse.success(
        {
          marked: results.length,
          failed: errors.length,
          results,
          errors: errors.length > 0 ? errors : undefined,
        },
        'Attendance marked successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get attendance records with filters
 */
const getAttendance = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      studentId,
      subjectId,
      from,
      to,
      status,
      sort = '-date',
    } = req.query;

    const query = {};

    if (studentId) query.student = studentId;
    if (subjectId) query.subject = subjectId;
    if (status) query.status = status;

    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    // If user is student, only show their attendance
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (student) {
        query.student = student._id;
      }
    }

    const skip = (page - 1) * limit;
    const attendance = await Attendance.find(query)
      .populate({
        path: 'student',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('subject', 'name code')
      .populate('createdBy', 'name email')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Attendance.countDocuments(query);

    res.json(ApiResponse.paginated(attendance, page, limit, total));
  } catch (error) {
    next(error);
  }
};

/**
 * Get attendance summary for a student
 */
const getAttendanceSummary = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { subjectId, from, to } = req.query;

    const student = await Student.findById(studentId);
    if (!student) {
      throw new NotFoundError('Student');
    }

    const matchQuery = { student: studentId };
    if (subjectId) matchQuery.subject = subjectId;
    if (from || to) {
      matchQuery.date = {};
      if (from) matchQuery.date.$gte = new Date(from);
      if (to) matchQuery.date.$lte = new Date(to);
    }

    const summary = await Attendance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get subject-wise breakdown if requested
    let subjectWise = null;
    if (!subjectId) {
      subjectWise = await Attendance.aggregate([
        { $match: { student: studentId } },
        {
          $group: {
            _id: { subject: '$subject', status: '$status' },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: '$_id.subject',
            breakdown: {
              $push: {
                status: '$_id.status',
                count: '$count',
              },
            },
            total: { $sum: '$count' },
          },
        },
        {
          $lookup: {
            from: 'subjects',
            localField: '_id',
            foreignField: '_id',
            as: 'subject',
          },
        },
        { $unwind: '$subject' },
      ]);
    }

    const totalClasses = summary.reduce((sum, s) => sum + s.count, 0);
    const presentClasses = summary.find((s) => s._id === 'present')?.count || 0;
    const percentage =
      totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(2) : 0;

    res.json(
      ApiResponse.success({
        student: {
          id: student._id,
          rollNo: student.rollNo,
        },
        summary: {
          total: totalClasses,
          present: presentClasses,
          percentage,
          breakdown: summary,
        },
        subjectWise,
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markAttendance,
  getAttendance,
  getAttendanceSummary,
};
