const Game = require('../models/Game');

const callNextNumber = async (gameId) => Game.findOneAndUpdate(
  { _id: gameId, status: 'active', 'remainingNumbers.0': { $exists: true } },
  [{
    $set: {
      currentNumber: { $arrayElemAt: ['$remainingNumbers', 0] },
      calledNumbers: { $concatArrays: ['$calledNumbers', [{ $arrayElemAt: ['$remainingNumbers', 0] }]] },
      remainingNumbers: { $slice: ['$remainingNumbers', 1, { $size: '$remainingNumbers' }] },
    },
  }],
  { new: true }
);

module.exports = { callNextNumber };
