const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
    },
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // 3 rows x 9 columns, 0 = empty cell
    rows: {
      type: [[Number]],
      required: true,
    },
    // Flat array of all 15 actual numbers for quick lookup
    numbers: [{ type: Number }],
  },
  { timestamps: true }
);

ticketSchema.index({ game: 1, player: 1 }, { unique: true });

module.exports = mongoose.model('Ticket', ticketSchema);
