const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');
const { finalizeOverdueAttempts, getQuizStatus } = require('./facultyController');

// @desc    Get student dashboard counts
// @route   GET /api/student/dashboard
// @access  Private (Student)
const getDashboard = async (req, res, next) => {
  try {
    const student = req.user;
    const now = new Date();

    const quizzes = await Quiz.find({
      department: student.department,
      year: student.year
    });

    const attempts = await Attempt.find({
      student: student._id
    });

    const attemptMap = new Map();
    attempts.forEach((att) => {
      attemptMap.set(att.quiz.toString(), att);
    });

    let available = 0;
    let upcoming = 0;
    let live = 0;
    let completed = 0;

    quizzes.forEach((q) => {
      const qId = q._id.toString();
      const att = attemptMap.get(qId);

      if (att && (att.status === 'submitted' || att.status === 'auto-submitted')) {
        completed++;
      } else {
        const status = getQuizStatus(q, now);
        if (status === 'upcoming') {
          upcoming++;
        } else if (status === 'live') {
          live++;
          available++;
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalAvailable: available,
        upcoming,
        live,
        completed
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student quizzes (matching department and year)
// @route   GET /api/student/quizzes
// @access  Private (Student)
const getQuizzes = async (req, res, next) => {
  try {
    const student = req.user;
    const now = new Date();

    const quizzes = await Quiz.find({
      department: student.department,
      year: student.year
    })
      .populate('department', 'name code')
      .sort({ startTime: 1 });

    const attempts = await Attempt.find({ student: student._id });
    const attemptMap = new Map();
    attempts.forEach((att) => {
      attemptMap.set(att.quiz.toString(), att);
    });

    const formatted = quizzes.map((q) => {
      const att = attemptMap.get(q._id.toString());
      let status;
      if (att && (att.status === 'submitted' || att.status === 'auto-submitted')) {
        status = 'completed';
      } else {
        status = getQuizStatus(q, now);
      }

      return {
        _id: q._id,
        title: q.title,
        subject: q.subject,
        department: q.department,
        year: q.year,
        timeLimit: q.timeLimit,
        startTime: q.startTime,
        endTime: q.endTime,
        questionCount: q.questions.length,
        status,
        attemptStatus: att ? att.status : null
      };
    });

    res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quiz instructions (NO questions)
// @route   GET /api/student/quizzes/:id
// @access  Private (Student)
const getQuizInstructions = async (req, res, next) => {
  try {
    const student = req.user;
    const now = new Date();

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      department: student.department,
      year: student.year
    }).populate('department', 'name code');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found or not eligible for your department/year'
      });
    }

    const att = await Attempt.findOne({ quiz: quiz._id, student: student._id });
    let status;
    if (att && (att.status === 'submitted' || att.status === 'auto-submitted')) {
      status = 'completed';
    } else {
      status = getQuizStatus(quiz, now);
    }

    res.status(200).json({
      success: true,
      data: {
        _id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        department: quiz.department,
        year: quiz.year,
        numberOfQuestions: quiz.questions.length,
        timeLimit: quiz.timeLimit,
        startTime: quiz.startTime,
        endTime: quiz.endTime,
        status,
        hasAttempt: !!att,
        attemptStatus: att ? att.status : null
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start a quiz
// @route   POST /api/student/quizzes/:id/start
// @access  Private (Student)
const startQuiz = async (req, res, next) => {
  try {
    const student = req.user;
    const now = new Date();

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // 1. Quiz must match the student's department and year
    if (
      quiz.department.toString() !== student.department.toString() ||
      quiz.year !== student.year
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not eligible for this quiz (department/year mismatch)'
      });
    }

    // Check existing attempt
    let attempt = await Attempt.findOne({
      quiz: quiz._id,
      student: student._id
    });

    if (attempt) {
      if (attempt.status === 'submitted' || attempt.status === 'auto-submitted') {
        return res.status(400).json({
          success: false,
          message: 'You have already attempted this quiz'
        });
      }

      // If in-progress, return questions (no correct answers), attempt id, original deadline, serverTime, saved answers
      const safeQuestions = quiz.questions.map((q, idx) => ({
        _id: q._id,
        questionIndex: idx,
        questionText: q.questionText,
        options: q.options
      }));

      return res.status(200).json({
        success: true,
        message: 'Resumed existing attempt',
        data: {
          attemptId: attempt._id,
          deadline: attempt.deadline,
          serverTime: new Date(),
          savedAnswers: attempt.answers || [],
          questions: safeQuestions
        }
      });
    }

    // 2. Current time must be within startTime and endTime
    if (now < new Date(quiz.startTime)) {
      return res.status(400).json({
        success: false,
        message: 'Quiz has not started yet'
      });
    }

    if (now >= new Date(quiz.endTime)) {
      return res.status(400).json({
        success: false,
        message: 'Quiz has already ended'
      });
    }

    // 4. Create an Attempt with deadline = min(startedAt + timeLimit minutes, quiz.endTime)
    const startedAt = now;
    const calculatedDeadline = new Date(
      Math.min(
        startedAt.getTime() + quiz.timeLimit * 60 * 1000,
        new Date(quiz.endTime).getTime()
      )
    );

    try {
      attempt = await Attempt.create({
        quiz: quiz._id,
        student: student._id,
        startedAt,
        deadline: calculatedDeadline,
        status: 'in-progress',
        answers: []
      });
    } catch (createErr) {
      // Gracefully handle duplicate key if race condition occurred
      if (createErr.code === 11000) {
        attempt = await Attempt.findOne({
          quiz: quiz._id,
          student: student._id
        });
        if (attempt.status !== 'in-progress') {
          return res.status(400).json({
            success: false,
            message: 'You have already attempted this quiz'
          });
        }
      } else {
        throw createErr;
      }
    }

    const safeQuestions = quiz.questions.map((q, idx) => ({
      _id: q._id,
      questionIndex: idx,
      questionText: q.questionText,
      options: q.options
    }));

    res.status(200).json({
      success: true,
      message: 'Quiz started successfully',
      data: {
        attemptId: attempt._id,
        deadline: attempt.deadline,
        serverTime: new Date(),
        savedAnswers: attempt.answers || [],
        questions: safeQuestions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current attempt (resume)
// @route   GET /api/student/quizzes/:id/attempt
// @access  Private (Student)
const getAttempt = async (req, res, next) => {
  try {
    const student = req.user;
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const attempt = await Attempt.findOne({
      quiz: quiz._id,
      student: student._id
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'No attempt found for this quiz'
      });
    }

    const safeQuestions = quiz.questions.map((q, idx) => ({
      _id: q._id,
      questionIndex: idx,
      questionText: q.questionText,
      options: q.options
    }));

    res.status(200).json({
      success: true,
      data: {
        attemptId: attempt._id,
        status: attempt.status,
        deadline: attempt.deadline,
        serverTime: new Date(),
        savedAnswers: attempt.answers || [],
        questions: safeQuestions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save answers into the in-progress attempt
// @route   PUT /api/student/quizzes/:id/answers
// @access  Private (Student)
const saveAnswers = async (req, res, next) => {
  try {
    const student = req.user;
    const now = new Date();

    const attempt = await Attempt.findOne({
      quiz: req.params.id,
      student: student._id
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    if (attempt.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update answers: quiz already submitted'
      });
    }

    // Reject if now > deadline + 15 seconds
    const graceLimit = new Date(new Date(attempt.deadline).getTime() + 15 * 1000);
    if (now > graceLimit) {
      return res.status(400).json({
        success: false,
        message: 'Time is over: deadline plus grace period has passed'
      });
    }

    const { answers } = req.body;
    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Answers must be an array'
      });
    }

    // Validate indexes
    const formattedAnswers = answers
      .filter((a) => typeof a.questionIndex === 'number')
      .map((a) => ({
        questionIndex: a.questionIndex,
        selectedAnswer: typeof a.selectedAnswer === 'number' ? a.selectedAnswer : null
      }));

    attempt.answers = formattedAnswers;
    await attempt.save();

    res.status(200).json({
      success: true,
      message: 'Answers saved successfully',
      data: {
        savedAnswers: attempt.answers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit quiz attempt
// @route   POST /api/student/quizzes/:id/submit
// @access  Private (Student)
const submitQuiz = async (req, res, next) => {
  try {
    const student = req.user;
    const now = new Date();

    const attempt = await Attempt.findOne({
      quiz: req.params.id,
      student: student._id
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    // 1. Find the student's attempt; it must be in-progress.
    if (attempt.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this quiz'
      });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // 3. Grace period check: reject only if now > deadline + 15 seconds
    const deadlineTime = new Date(attempt.deadline).getTime();
    const graceLimit = new Date(deadlineTime + 15 * 1000);

    if (now > graceLimit) {
      // Auto-submit finalize overdue
      attempt.status = 'auto-submitted';
      attempt.submittedAt = attempt.deadline;
      await attempt.save();

      return res.status(400).json({
        success: false,
        message: 'Time is over'
      });
    }

    // 2. Accept answers in the body (if missing, use saved answers)
    let answersToGrade = attempt.answers || [];
    if (req.body && Array.isArray(req.body.answers)) {
      answersToGrade = req.body.answers;
      attempt.answers = answersToGrade;
    }

    let finalStatus = 'submitted';
    if (now.getTime() > deadlineTime || req.body.auto === true) {
      finalStatus = 'auto-submitted';
    }

    // 4. Grade: 1 mark per correct answer, no negative marking.
    const questions = quiz.questions || [];
    const totalQuestions = questions.length;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unanswered = 0;

    const answerMap = new Map();
    answersToGrade.forEach((ans) => {
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
    attempt.status = finalStatus;
    attempt.submittedAt = now;

    await attempt.save();

    // 5. Return summary. Never return correct answers or per-question review
    res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        unanswered,
        score,
        percentage
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's quiz results history
// @route   GET /api/student/results
// @access  Private (Student)
const getResults = async (req, res, next) => {
  try {
    const student = req.user;

    // Finalize this student's overdue attempts first
    await finalizeOverdueAttempts({ student: student._id });

    const attempts = await Attempt.find({
      student: student._id,
      status: { $in: ['submitted', 'auto-submitted'] }
    })
      .populate('quiz', 'title subject timeLimit startTime endTime')
      .sort({ submittedAt: -1 });

    const formatted = attempts.map((att) => ({
      _id: att._id,
      quiz: att.quiz,
      totalQuestions: att.totalQuestions,
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
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get one result summary (own attempts only)
// @route   GET /api/student/results/:id
// @access  Private (Student)
const getResultById = async (req, res, next) => {
  try {
    const student = req.user;

    const attempt = await Attempt.findOne({
      _id: req.params.id,
      student: student._id
    }).populate('quiz', 'title subject timeLimit startTime endTime');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    if (attempt.status === 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'This quiz attempt is still in progress'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: attempt._id,
        quiz: attempt.quiz,
        totalQuestions: attempt.totalQuestions,
        correctAnswers: attempt.correctAnswers,
        wrongAnswers: attempt.wrongAnswers,
        unanswered: attempt.unanswered,
        score: attempt.score,
        percentage: attempt.percentage,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getQuizzes,
  getQuizInstructions,
  startQuiz,
  getAttempt,
  saveAnswers,
  submitQuiz,
  getResults,
  getResultById
};
