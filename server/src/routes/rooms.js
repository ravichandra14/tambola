const express = require('express');
const router = express.Router();
const { createRoom, getRoomByCode, joinRoom, updateRoom, removePlayer } = require('../controllers/roomController');
const { protect } = require('../middleware/auth');

router.post('/create', protect, createRoom);
router.get('/:code', protect, getRoomByCode);
router.post('/:code/join', protect, joinRoom);
router.put('/:id', protect, updateRoom);
router.delete('/:id/remove-player/:playerId', protect, removePlayer);

module.exports = router;
