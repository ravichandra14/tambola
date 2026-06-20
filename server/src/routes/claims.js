const express = require('express');
const router = express.Router();
const { submitClaim, approveClaim, rejectClaim, getGameClaims } = require('../controllers/claimController');
const { protect } = require('../middleware/auth');

router.post('/submit', protect, submitClaim);
router.patch('/:id/approve', protect, approveClaim);
router.patch('/:id/reject', protect, rejectClaim);
router.get('/game/:gameId', protect, getGameClaims);

module.exports = router;
