const express = require('express');
const router = express.Router();
const {
  startGame,
  getGame,
  getMyTicket,
  pauseGame,
  resumeGame,
  endGame,
  callNumber,
} = require('../controllers/gameController');
const { protect } = require('../middleware/auth');

router.post('/start', protect, startGame);
router.get('/:id', protect, getGame);
router.get('/:id/my-ticket', protect, getMyTicket);
router.patch('/:id/pause', protect, pauseGame);
router.patch('/:id/resume', protect, resumeGame);
router.patch('/:id/end', protect, endGame);
router.post('/:id/call-number', protect, callNumber);

module.exports = router;
