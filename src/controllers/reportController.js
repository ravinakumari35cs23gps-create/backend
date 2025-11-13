const Result = require('../models/Result');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const ApiResponse = require('../utils/apiResponse');
const { NotFoundError } = require('../utils/errors');

/**
 * Get student report summary
 */
const getStudentReport = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { semester } = req.query;

    const student = await Student.findById(studentId).populate('userId classId');
    if (!student) {
      throw new NotFoundError('Student');
    }

    const query = { student: studentId };
    if (semester) query.semester = parseInt(semester);

    const results = await Result.find(query)
      .populate('subject', 'name code maxMarks passMarks credits')
      .sort('subject');

    // Calculate aggregates
    const totalSubjects = results.length;
    const totalMarks = results.reduce((sum, r) => sum + r.marksObtained, 0);
    const maxPossible = results.reduce(
      (sum, r) => sum + (r.subject?.maxMarks || 100),
      0
    );
    const percentage = maxPossible > 0 ? ((totalMarks / maxPossible) * 100).toFixed(2) : 0;
    const passed = results.every((r) => r.isPassed);

    // Calculate CGPA (assuming 10-point scale)
    const totalGradePoints = results.reduce((sum, r) => sum + (r.gradePoint || 0), 0);
    const cgpa = totalSubjects > 0 ? (totalGradePoints / totalSubjects).toFixed(2) : 0;

    const report = {
      student: {
        id: student._id,
        name: student.userId?.fullName,
        rollNo: student.rollNo,
        department: student.department,
        batch: student.batch,
        class: student.classId,
      },
      semester: semester || 'All',
      summary: {
        totalSubjects,
        totalMarks,
        maxPossible,
        percentage,
        cgpa,
        passed,
      },
      results,
    };

    res.json(ApiResponse.success(report));
  } catch (error) {
    next(error);
  }
};

/**
 * Get class performance report
 */
const getClassReport = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { semester } = req.query;

    const classDoc = await Class.findById(classId).populate('students');
    if (!classDoc) {
      throw new NotFoundError('Class');
    }

    const matchQuery = {
      student: { $in: classDoc.students },
    };
    if (semester) matchQuery.semester = parseInt(semester);

    // Aggregate class performance
    const performance = await Result.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$student',
          avgMarks: { $avg: '$marksObtained' },
          avgGradePoint: { $avg: '$gradePoint' },
          totalSubjects: { $sum: 1 },
          passed: { $min: '$isPassed' },
        },
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },
      {
        $lookup: {
          from: 'users',
          localField: 'student.userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $sort: { avgMarks: -1 } },
    ]);

    // Calculate class statistics
    const totalStudents = performance.length;
    const passedStudents = performance.filter((s) => s.passed).length;
    const avgClassPerformance =
      totalStudents > 0
        ? (performance.reduce((sum, s) => sum + s.avgMarks, 0) / totalStudents).toFixed(2)
        : 0;

    res.json(
      ApiResponse.success({
        class: {
          id: classDoc._id,
          name: classDoc.name,
          code: classDoc.code,
          year: classDoc.year,
          semester: classDoc.semester,
        },
        statistics: {
          totalStudents,
          passedStudents,
          failedStudents: totalStudents - passedStudents,
          passPercentage:
            totalStudents > 0
              ? ((passedStudents / totalStudents) * 100).toFixed(2)
              : 0,
          avgClassPerformance,
        },
        performance,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Trigger export job (placeholder for background job)
 */
const exportReport = async (req, res, next) => {
  try {
    const { type, report, ...filters } = req.query;

    // In production, this would queue a background job
    // For now, return a job ID
    const jobId = `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // TODO: Queue export job using BullMQ
    // await exportQueue.add('generate-report', { type, report, filters, userId: req.user._id });

    res.json(
      ApiResponse.success(
        {
          jobId,
          status: 'queued',
          message: 'Export job queued. You will be notified when ready.',
        },
        'Export initiated'
      )
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentReport,
  getClassReport,
  exportReport,
};
