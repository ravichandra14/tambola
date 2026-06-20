const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    players: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        joinedAt: { type: Date, default: Date.now },
        socketId: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ['waiting', 'active', 'paused', 'ended'],
      default: 'waiting',
    },
    pointConfig: {
      earlyFive: { type: Number, default: 10 },
      topLine: { type: Number, default: 20 },
      middleLine: { type: Number, default: 20 },
      bottomLine: { type: Number, default: 20 },
      fullHouse: { type: Number, default: 50 },
    },
    numberCallingMode: {
      type: String,
      enum: ['manual', 'auto'],
      default: 'manual',
    },
    autoInterval: {
      type: Number,
      enum: [3, 5, 10, 15],
      default: 5,
    },
    currentGame: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      default: null,
    },
    hostSocketId: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);
