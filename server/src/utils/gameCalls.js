const Game = require('../models/Game');

const callNextNumber = async (gameId) => {
  // Step 1: fetch the current game to read the next number in queue
  const game = await Game.findOne(
    { _id: gameId, status: 'active', 'remainingNumbers.0': { $exists: true } }
  ).select('remainingNumbers currentNumber').lean();

  if (!game) return null;

  const nextNumber = game.remainingNumbers[0];
  const newRemaining = game.remainingNumbers.slice(1);

  // Step 2: atomically apply the update using standard operators
  // The condition pins on remainingNumbers[0] to guard against concurrent calls
  return Game.findOneAndUpdate(
    { _id: gameId, status: 'active', 'remainingNumbers.0': nextNumber },
    {
      $set: { currentNumber: nextNumber, remainingNumbers: newRemaining },
      $push: { calledNumbers: nextNumber },
    },
    { new: true }
  );
};

module.exports = { callNextNumber };
