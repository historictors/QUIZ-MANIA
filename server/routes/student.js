const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getQuizzes,
  getQuizInstructions,
  startQuiz,
  getAttempt,
  saveAnswers,
  submitQuiz,
  getResults,
  getResultById
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

// All student routes require authentication and student role
router.use(protect, authorize('student'));

router.get('/dashboard', getDashboard);
router.get('/quizzes', getQuizzes);
router.get('/quizzes/:id', getQuizInstructions);
router.post('/quizzes/:id/start', startQuiz);
router.get('/quizzes/:id/attempt', getAttempt);
router.put('/quizzes/:id/answers', saveAnswers);
router.post('/quizzes/:id/submit', submitQuiz);
router.get('/results', getResults);
router.get('/results/:id', getResultById);

module.exports = router;
