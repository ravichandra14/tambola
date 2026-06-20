const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    roomCode: { type: String, required: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    calledNumbers: [{ type: Number }],
    currentNumber: { type: Number, default: null },
    remainingNumbers: [{ type: Number }],
    status: {
      type: String,
      enum: ['active', 'paused', 'ended'],
      default: 'active',
    },
    pointConfig: {
      earlyFive: { type: Number, default: 10 },
      topLine: { type: Number, default: 20 },
      middleLine: { type: Number, default: 20 },
      bottomLine: { type: Number, default: 20 },
      fullHouse: { type: Number, default: 50 },
    },
    claimedPrizes: {
      earlyFive: { type: Boolean, default: false },
      topLine: { type: Boolean, default: false },
      middleLine: { type: Boolean, default: false },
      bottomLine: { type: Boolean, default: false },
      fullHouse: { type: Boolean, default: false },
    },
    playerCount: { type: Number, default: 0 },
    autoInterval: { type: Number, default: 5 },
    numberCallingMode: { type: String, enum: ['manual', 'auto'], default: 'manual' },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Game', gameSchema);
