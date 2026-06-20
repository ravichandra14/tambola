const express = require('express');
const router = express.Router();
const { getHistory, getGameHistory } = require('../controllers/historyController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getHistory);
router.get('/:gameId', protect, getGameHistory);

module.exports = router;
