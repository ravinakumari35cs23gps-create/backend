const Result = require('../models/Result');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const ApiResponse = require('../utils/apiResponse');
const { NotFoundError } = require('../utils/errors');

/**
 * Get top performers in a class
 */
const getTopPerformers = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { limit = 10, semester } = req.query;

    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      throw new NotFoundError('Class');
    }

    const matchQuery = {
      student: { $in: classDoc.students },
    };
    if (semester) matchQuery.semester = parseInt(semester);

    const topPerformers = await Result.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$student',
          avgMarks: { $avg: '$marksObtained' },
          avgGradePoint: { $avg: '$gradePoint' },
          totalSubjects: { $sum: 1 },
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
      { $limit: parseInt(limit) },
      {
        $project: {
          studentId: '$_id',
          name: { $concat: ['$user.name.first', ' ', '$user.name.last'] },
          rollNo: '$student.rollNo',
          avgMarks: { $round: ['$avgMarks', 2] },
          avgGradePoint: { $round: ['$avgGradePoint', 2] },
          totalSubjects: 1,
        },
      },
    ]);

    res.json(ApiResponse.success(topPerformers));
  } catch (error) {
    next(error);
  }
};

/**
 * Get marks distribution for a subject
 */
const getSubjectDistribution = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const { semester } = req.query;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject');
    }

    const matchQuery = { subject: subjectId };
    if (semester) matchQuery.semester = parseInt(semester);

    const distribution = await Result.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$grade',
          count: { $sum: 1 },
          avgMarks: { $avg: '$marksObtained' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const statistics = await Result.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          avgMarks: { $avg: '$marksObtained' },
          maxMarks: { $max: '$marksObtained' },
          minMarks: { $min: '$marksObtained' },
          passedCount: {
            $sum: { $cond: ['$isPassed', 1, 0] },
          },
        },
      },
    ]);

    res.json(
      ApiResponse.success({
        subject: {
          id: subject._id,
          name: subject.name,
          code: subject.code,
          maxMarks: subject.maxMarks,
        },
        distribution,
        statistics: statistics[0] || {},
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get performance trends over time
 */
const getPerformanceTrends = async (req, res, next) => {
  try {
    const { from, to, classId, subjectId } = req.query;

    const matchQuery = {};

    if (from || to) {
      matchQuery.createdAt = {};
      if (from) matchQuery.createdAt.$gte = new Date(from);
      if (to) matchQuery.createdAt.$lte = new Date(to);
    }

    if (classId) {
      const classDoc = await Class.findById(classId);
      if (classDoc) {
        matchQuery.student = { $in: classDoc.students };
      }
    }

    if (subjectId) matchQuery.subject = subjectId;

    const trends = await Result.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            semester: '$semester',
          },
          avgMarks: { $avg: '$marksObtained' },
          avgGradePoint: { $avg: '$gradePoint' },
          totalResults: { $sum: 1 },
          passRate: {
            $avg: { $cond: ['$isPassed', 100, 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.semester': 1 } },
      {
        $project: {
          period: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $toString: '$_id.month' },
              ' (Sem ',
              { $toString: '$_id.semester' },
              ')',
            ],
          },
          avgMarks: { $round: ['$avgMarks', 2] },
          avgGradePoint: { $round: ['$avgGradePoint', 2] },
          passRate: { $round: ['$passRate', 2] },
          totalResults: 1,
        },
      },
    ]);

    res.json(ApiResponse.success(trends));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTopPerformers,
  getSubjectDistribution,
  getPerformanceTrends,
};
