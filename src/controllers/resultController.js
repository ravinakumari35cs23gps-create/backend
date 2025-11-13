const Result = require('../models/Result');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const ApiResponse = require('../utils/apiResponse');
const { NotFoundError, ValidationError, AuthorizationError } = require('../utils/errors');
const { logAudit } = require('../middleware/auditLog');

/**
 * Enter marks (bulk)
 */
const enterMarks = async (req, res, next) => {
  try {
    const { subjectId, semester, examType, entries, createdBy } = req.body;

    // Verify subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject');
    }

    // Check if teacher is authorized (if not admin)
    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ userId: req.user._id });
      const isAssigned = teacher.subjects.some(
        (s) => s.toString() === subjectId
      );
      if (!isAssigned) {
        throw new AuthorizationError('Not assigned to this subject');
      }
    }

    const results = [];
    const errors = [];

    // Process each entry
    for (const entry of entries) {
      try {
        // Check if student exists
        const student = await Student.findById(entry.studentId);
        if (!student) {
          errors.push({ studentId: entry.studentId, error: 'Student not found' });
          continue;
        }

        // Check if result already exists
        const existing = await Result.findOne({
          student: entry.studentId,
          subject: subjectId,
          semester,
          examType,
        });

        let result;
        if (existing) {
          // Update existing
          const before = existing.toObject();
          existing.marksObtained = entry.marksObtained;
          existing.createdBy = createdBy || req.user._id;
          result = await existing.save();

          // Audit log
          await logAudit({
            actor: req.user._id,
            action: 'UPDATE_MARKS',
            resourceType: 'Result',
            resourceId: result._id,
            before,
            after: result.toObject(),
            req,
          });
        } else {
          // Create new
          result = await Result.create({
            student: entry.studentId,
            subject: subjectId,
            marksObtained: entry.marksObtained,
            semester,
            examType,
            createdBy: createdBy || req.user._id,
          });

          // Audit log
          await logAudit({
            actor: req.user._id,
            action: 'CREATE_MARKS',
            resourceType: 'Result',
            resourceId: result._id,
            after: result.toObject(),
            req,
          });
        }

        results.push(result);
      } catch (error) {
        errors.push({ studentId: entry.studentId, error: error.message });
      }
    }

    res.status(201).json(
      ApiResponse.success(
        {
          created: results.length,
          failed: errors.length,
          results,
          errors: errors.length > 0 ? errors : undefined,
        },
        'Marks entry completed'
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get results with filters
 */
const getResults = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      studentId,
      subjectId,
      semester,
      examType,
      sort = '-createdAt',
    } = req.query;

    const query = {};

    if (studentId) query.student = studentId;
    if (subjectId) query.subject = subjectId;
    if (semester) query.semester = parseInt(semester);
    if (examType) query.examType = examType;

    // If user is student, only show their results
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (student) {
        query.student = student._id;
      }
    }

    const skip = (page - 1) * limit;
    const results = await Result.find(query)
      .populate({
        path: 'student',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('subject', 'name code maxMarks passMarks')
      .populate('createdBy', 'name email')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Result.countDocuments(query);

    res.json(ApiResponse.paginated(results, page, limit, total));
  } catch (error) {
    next(error);
  }
};

/**
 * Get result by ID
 */
const getResultById = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate({
        path: 'student',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('subject', 'name code maxMarks passMarks')
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email role');

    if (!result) {
      throw new NotFoundError('Result');
    }

    // Students can only view their own results
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (result.student._id.toString() !== student._id.toString()) {
        throw new AuthorizationError('Access denied');
      }
    }

    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

/**
 * Update result
 */
const updateResult = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id);

    if (!result) {
      throw new NotFoundError('Result');
    }

    const before = result.toObject();
    const { marksObtained, remarks } = req.body;

    if (marksObtained !== undefined) result.marksObtained = marksObtained;
    if (remarks) result.remarks = remarks;

    await result.save();

    // Audit log
    await logAudit({
      actor: req.user._id,
      action: 'UPDATE_RESULT',
      resourceType: 'Result',
      resourceId: result._id,
      before,
      after: result.toObject(),
      req,
    });

    res.json(ApiResponse.success(result, 'Result updated successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Approve result (Admin only)
 */
const approveResult = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id);

    if (!result) {
      throw new NotFoundError('Result');
    }

    result.isApproved = true;
    result.approvedBy = req.user._id;
    result.approvedAt = new Date();
    await result.save();

    // Audit log
    await logAudit({
      actor: req.user._id,
      action: 'APPROVE_RESULT',
      resourceType: 'Result',
      resourceId: result._id,
      req,
    });

    res.json(ApiResponse.success(result, 'Result approved successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Delete result
 */
const deleteResult = async (req, res, next) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);

    if (!result) {
      throw new NotFoundError('Result');
    }

    // Audit log
    await logAudit({
      actor: req.user._id,
      action: 'DELETE_RESULT',
      resourceType: 'Result',
      resourceId: result._id,
      before: result.toObject(),
      req,
    });

    res.json(ApiResponse.success(null, 'Result deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enterMarks,
  getResults,
  getResultById,
  updateResult,
  approveResult,
  deleteResult,
};
