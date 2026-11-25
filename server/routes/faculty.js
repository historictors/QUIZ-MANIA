const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizResults,
  getLeaderboard,
  exportQuizResults
} = require('../controllers/facultyController');
const { protect, authorize } = require('../middleware/auth');

// All faculty routes require authentication and faculty role
router.use(protect, authorize('faculty'));

router.get('/dashboard', getDashboard);

router.route('/quizzes')
  .get(getQuizzes)
  .post(createQuiz);

router.route('/quizzes/:id')
  .get(getQuizById)
  .put(updateQuiz)
  .delete(deleteQuiz);

router.get('/quizzes/:id/results', getQuizResults);
router.get('/quizzes/:id/leaderboard', getLeaderboard);
router.get('/quizzes/:id/export', exportQuizResults);

module.exports = router;
