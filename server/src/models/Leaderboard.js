const mongoose = require('mongoose');

const leaderboardEntrySchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  score: { type: Number, default: 0 },
  claimsWon: [{ type: String }],
  rank: { type: Number, default: 0 },
});

const leaderboardSchema = new mongoose.Schema(
  {
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
      unique: true,
    },
    entries: [leaderboardEntrySchema],
    finalizedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
