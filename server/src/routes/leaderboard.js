const express = require('express');
const { protect } = require('../middleware/auth');
const { getGlobalLeaderboard } = require('../controllers/leaderboardController');

const router = express.Router();
router.get('/', protect, getGlobalLeaderboard);

module.exports = router;
