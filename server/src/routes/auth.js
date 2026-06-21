const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { createRateLimiter } = require('../middleware/rateLimit');

const authLimiter = createRateLimiter({ windowMs: 60_000, max: 10 });

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/profile/password', protect, changePassword);

module.exports = router;
