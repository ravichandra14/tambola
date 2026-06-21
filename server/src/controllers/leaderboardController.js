const User = require('../models/User');

const getGlobalLeaderboard = async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 25));
    const total = await User.countDocuments();
    const entries = await User.find()
      .select('username avatar totalScore gamesPlayed claimsWon')
      .sort({ totalScore: -1, claimsWon: -1, username: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      entries: entries.map((entry, index) => ({ ...entry, rank: (page - 1) * limit + index + 1 })),
      pagination: { page, pages: Math.ceil(total / limit), total },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getGlobalLeaderboard };
