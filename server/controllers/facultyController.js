const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');

/**
 * Helper to compute status for a quiz
 * @param {Object} quiz - quiz document or object
 * @param {Date} now - current server time
 */
const getQuizStatus = (quiz, now = new Date()) => {
  const startTime = new Date(quiz.startTime);
  const endTime = new Date(quiz.endTime);

  if (now < startTime) {
    return 'upcoming';
  } else if (now >= startTime && now < endTime) {
    return 'live';
  } else {
    return 'closed';
  }
};

/**
 * Finalize overdue attempts (deadline + 15s has passed)
 * Graded using the quiz questions, sets status to 'auto-submitted' and submittedAt to deadline.
 * Scoped to filter (e.g. { quiz: quizId } or { student: studentId })
 */
const finalizeOverdueAttempts = async (filter = {}) => {
  const graceWindow = 15 * 1000;
  const cutoff = new Date(Date.now() - graceWindow);

  const query = {
    ...filter,
    status: 'in-progress',
    deadline: { $lt: cutoff }
  };

  const overdueAttempts = await Attempt.find(query).populate('quiz');

  for (const attempt of overdueAttempts) {
    if (!attempt.quiz) continue;

    const quiz = attempt.quiz;
    const questions = quiz.questions || [];
    const totalQuestions = questions.length;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unanswered = 0;

    const answerMap = new Map();
    (attempt.answers || []).forEach((ans) => {
      answerMap.set(ans.questionIndex, ans.selectedAnswer);
    });

    questions.forEach((q, index) => {
      const selected = answerMap.get(index);
      if (selected === undefined || selected === null) {
        unanswered++;
      } else if (selected === q.correctAnswer) {
        correctAnswers++;
      } else {
        wrongAnswers++;
      }
    });

    const score = correctAnswers;
    const percentage = totalQuestions > 0 ? Number(((score / totalQuestions) * 100).toFixed(2)) : 0;

    attempt.totalQuestions = totalQuestions;
    attempt.correctAnswers = correctAnswers;
    attempt.wrongAnswers = wrongAnswers;
    attempt.unanswered = unanswered;
    attempt.score = score;
    attempt.percentage = percentage;
    attempt.status = 'auto-submitted';
    attempt.submittedAt = attempt.deadline;

    await attempt.save();
  }
};

// @desc    Faculty Dashboard
// @route   GET /api/faculty/dashboard
// @access  Private (Faculty)
const getDashboard = async (req, res, next) => {
  try {
    const facultyId = req.user._id;
    const now = new Date();

    const quizzes = await Quiz.find({ createdBy: facultyId });
    const totalQuizzes = quizzes.length;

    let upcoming = 0;
    let live = 0;
    let closed = 0;

    const quizIds = [];
    quizzes.forEach((q) => {
      quizIds.push(q._id);
      const st = getQuizStatus(q, now);
      if (st === 'upcoming') upcoming++;
      else if (st === 'live') live++;
      else if (st === 'closed') closed++;
    });

    const totalAttempts = await Attempt.countDocuments({
      quiz: { $in: quizIds },
      status: { $in: ['submitted', 'auto-submitted'] }
    });

    const recentQuizzes = await Quiz.find({ createdBy: facultyId })
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentFormatted = await Promise.all(
      recentQuizzes.map(async (quiz) => {
        const attemptCount = await Attempt.countDocuments({ quiz: quiz._id });
        return {
          ...quiz.toObject(),
          status: getQuizStatus(quiz, now),
          attemptCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        totalQuizzes,
        upcoming,
        live,
        closed,
        totalAttempts,
        recentQuizzes: recentFormatted
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all quizzes created by faculty
// @route   GET /api/faculty/quizzes
// @access  Private (Faculty)
const getQuizzes = async (req, res, next) => {
  try {
    const facultyId = req.user._id;
    const now = new Date();

    const quizzes = await Quiz.find({ createdBy: facultyId })
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    const formatted = await Promise.all(
      quizzes.map(async (quiz) => {
        const attemptCount = await Attempt.countDocuments({ quiz: quiz._id });
        return {
          ...quiz.toObject(),
          status: getQuizStatus(quiz, now),
          attemptCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single quiz by ID (includes correct answers for editing)
// @route   GET /api/faculty/quizzes/:id
// @access  Private (Faculty)
const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    }).populate('department', 'name code');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const attemptCount = await Attempt.countDocuments({ quiz: quiz._id });

    res.status(200).json({
      success: true,
      data: {
        ...quiz.toObject(),
        status: getQuizStatus(quiz, new Date()),
        attemptCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create quiz
// @route   POST /api/faculty/quizzes
// @access  Private (Faculty)
const createQuiz = async (req, res, next) => {
  try {
    const { title, subject, department, year, timeLimit, startTime, endTime, questions } = req.body;

    if (!title || !subject || !department || !year || !timeLimit || !startTime || !endTime || !questions) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    if (timeLimit <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Time limit must be greater than zero'
      });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one question is required'
      });
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText || !q.questionText.trim()) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} text is required`
        });
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} must have exactly 4 options`
        });
      }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j] || typeof q.options[j] !== 'string' || !q.options[j].trim()) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1} option ${j + 1} cannot be empty`
          });
        }
      }
      if (q.correctAnswer === undefined || q.correctAnswer === null || q.correctAnswer < 0 || q.correctAnswer > 3) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} correctAnswer must be between 0 and 3`
        });
      }
    }

    const quiz = await Quiz.create({
      title: title.trim(),
      subject: subject.trim(),
      department,
      year: Number(year),
      timeLimit: Number(timeLimit),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      questions,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update quiz
// @route   PUT /api/faculty/quizzes/:id
// @access  Private (Faculty)
const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // PUT and DELETE are blocked if the quiz has any attempt
    const attemptCount = await Attempt.countDocuments({ quiz: quiz._id });
    if (attemptCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Locked: students have already attempted this quiz'
      });
    }

    const { title, subject, department, year, timeLimit, startTime, endTime, questions } = req.body;

    if (title) quiz.title = title.trim();
    if (subject) quiz.subject = subject.trim();
    if (department) quiz.department = department;
    if (year) quiz.year = Number(year);
    if (timeLimit) {
      if (Number(timeLimit) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Time limit must be greater than zero'
        });
      }
      quiz.timeLimit = Number(timeLimit);
    }
    if (startTime) quiz.startTime = new Date(startTime);
    if (endTime) quiz.endTime = new Date(endTime);

    if (new Date(quiz.endTime) <= new Date(quiz.startTime)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    if (questions) {
      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one question is required'
        });
      }
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.questionText || !q.questionText.trim()) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1} text is required`
          });
        }
        if (!Array.isArray(q.options) || q.options.length !== 4) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1} must have exactly 4 options`
          });
        }
        for (let j = 0; j < 4; j++) {
          if (!q.options[j] || typeof q.options[j] !== 'string' || !q.options[j].trim()) {
            return res.status(400).json({
              success: false,
              message: `Question ${i + 1} option ${j + 1} cannot be empty`
            });
          }
        }
        if (q.correctAnswer === undefined || q.correctAnswer === null || q.correctAnswer < 0 || q.correctAnswer > 3) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1} correctAnswer must be between 0 and 3`
          });
        }
      }
      quiz.questions = questions;
    }

    await quiz.save();

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete quiz
// @route   DELETE /api/faculty/quizzes/:id
// @access  Private (Faculty)
const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // PUT and DELETE are blocked if the quiz has any attempt
    const attemptCount = await Attempt.countDocuments({ quiz: quiz._id });
    if (attemptCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Locked: students have already attempted this quiz'
      });
    }

    await Quiz.findByIdAndDelete(quiz._id);

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get results for a quiz
// @route   GET /api/faculty/quizzes/:id/results
// @access  Private (Faculty)
const getQuizResults = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Finalize overdue attempts first
    await finalizeOverdueAttempts({ quiz: quiz._id });

    const { search } = req.query;

    const attempts = await Attempt.find({
      quiz: quiz._id,
      status: { $in: ['submitted', 'auto-submitted'] }
    })
      .populate('student', 'name email rollNumber')
      .sort({ score: -1, submittedAt: 1 });

    let filteredAttempts = attempts;
    if (search) {
      const lowerSearch = search.toLowerCase();
      filteredAttempts = attempts.filter((att) => {
        const student = att.student;
        if (!student) return false;
        return (
          (student.name && student.name.toLowerCase().includes(lowerSearch)) ||
          (student.rollNumber && student.rollNumber.toLowerCase().includes(lowerSearch))
        );
      });
    }

    const results = filteredAttempts.map((att) => ({
      _id: att._id,
      student: att.student,
      correctAnswers: att.correctAnswers,
      wrongAnswers: att.wrongAnswers,
      unanswered: att.unanswered,
      score: att.score,
      percentage: att.percentage,
      status: att.status,
      startedAt: att.startedAt,
      submittedAt: att.submittedAt
    }));

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leaderboard (top 5 sorted by score descending, then earliest submittedAt)
// @route   GET /api/faculty/quizzes/:id/leaderboard
// @access  Private (Faculty)
const getLeaderboard = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Finalize overdue attempts first
    await finalizeOverdueAttempts({ quiz: quiz._id });

    const topAttempts = await Attempt.find({
      quiz: quiz._id,
      status: { $in: ['submitted', 'auto-submitted'] }
    })
      .populate('student', 'name rollNumber')
      .sort({ score: -1, submittedAt: 1 })
      .limit(5);

    const leaderboard = topAttempts.map((att, idx) => ({
      rank: idx + 1,
      name: att.student ? att.student.name : 'Unknown',
      rollNumber: att.student ? att.student.rollNumber : 'Unknown',
      score: att.score,
      percentage: att.percentage,
      submittedAt: att.submittedAt
    }));

    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export quiz results as CSV
// @route   GET /api/faculty/quizzes/:id/export
// @access  Private (Faculty)
const exportQuizResults = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Finalize overdue attempts first
    await finalizeOverdueAttempts({ quiz: quiz._id });

    const attempts = await Attempt.find({
      quiz: quiz._id,
      status: { $in: ['submitted', 'auto-submitted'] }
    })
      .populate('student', 'name rollNumber email')
      .sort({ score: -1, submittedAt: 1 });

    // Escape CSV values helper
    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      let str = String(val);
      if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
        str = '"' + str.replace(/"/g, '""') + '"';
      } else {
        str = `"${str}"`;
      }
      return str;
    };

    const headers = [
      'Student Name',
      'Roll Number',
      'Email',
      'Correct',
      'Wrong',
      'Unanswered',
      'Score',
      'Percentage',
      'Submitted At'
    ];

    const rows = [headers.join(',')];

    for (const att of attempts) {
      const student = att.student || {};
      const row = [
        escapeCsv(student.name || ''),
        escapeCsv(student.rollNumber || ''),
        escapeCsv(student.email || ''),
        escapeCsv(att.correctAnswers),
        escapeCsv(att.wrongAnswers),
        escapeCsv(att.unanswered),
        escapeCsv(att.score),
        escapeCsv(`${att.percentage}%`),
        escapeCsv(att.submittedAt ? new Date(att.submittedAt).toISOString() : '')
      ];
      rows.push(row.join(','));
    }

    const csvContent = rows.join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="quiz_${quiz._id}_results.csv"`
    );
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizResults,
  getLeaderboard,
  exportQuizResults,
  finalizeOverdueAttempts,
  getQuizStatus
};
