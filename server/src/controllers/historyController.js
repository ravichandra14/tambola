const Game = require('../models/Game');
const Leaderboard = require('../models/Leaderboard');
const Claim = require('../models/Claim');

// @desc  Get host's game history
// @route GET /api/history
const getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Game.countDocuments({ host: req.user._id, status: 'ended' });
    const games = await Game.find({ host: req.user._id, status: 'ended' })
      .sort({ endedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('roomCode calledNumbers playerCount pointConfig startedAt endedAt status');

    res.json({
      success: true,
      games,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single game history
// @route GET /api/history/:gameId
const getGameHistory = async (req, res, next) => {
  try {
    const game = await Game.findById(req.params.gameId).populate('host', 'username');
    if (!game) return res.status(404).json({ success: false, message: 'Game not found' });

    const leaderboard = await Leaderboard.findOne({ game: game._id }).populate(
      'entries.player',
      'username avatar'
    );

    const claims = await Claim.find({ game: game._id, status: 'approved' }).populate(
      'player',
      'username avatar'
    );

    res.json({ success: true, game, leaderboard: leaderboard?.entries || [], claims });
  } catch (error) {
    next(error);
  }
};

module.exports = { getHistory, getGameHistory };
