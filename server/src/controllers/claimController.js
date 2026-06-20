const Claim = require('../models/Claim');
const Game = require('../models/Game');
const Ticket = require('../models/Ticket');
const Leaderboard = require('../models/Leaderboard');
const { validateClaim } = require('../utils/claimValidator');
const { getIO } = require('../config/socket');

// @desc  Submit a claim
// @route POST /api/claims/submit
const submitClaim = async (req, res, next) => {
  try {
    const { gameId, claimType } = req.body;

    const game = await Game.findById(gameId);
    if (!game) return res.status(404).json({ success: false, message: 'Game not found' });
    if (game.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Game is not active' });
    }

    // Check if prize already claimed
    if (game.claimedPrizes[claimType]) {
      return res.status(400).json({ success: false, message: `${claimType} has already been won` });
    }

    // Check for duplicate claim by same player for same type
    const existingClaim = await Claim.findOne({
      game: gameId,
      player: req.user._id,
      claimType,
      status: { $in: ['pending', 'approved'] },
    });
    if (existingClaim) {
      return res.status(400).json({ success: false, message: 'You already have a pending/approved claim for this' });
    }

    const ticket = await Ticket.findOne({ game: gameId, player: req.user._id });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    // Server-side validation
    const isValid = validateClaim(claimType, ticket, game.calledNumbers);

    if (!isValid) {
      // Auto-reject invalid claims
      await Claim.create({
        game: gameId,
        player: req.user._id,
        ticket: ticket._id,
        claimType,
        status: 'rejected',
        calledNumbersSnapshot: [...game.calledNumbers],
        resolvedAt: new Date(),
      });
      return res.status(400).json({ success: false, message: 'Invalid claim — numbers do not match' });
    }

    const claim = await Claim.create({
      game: gameId,
      player: req.user._id,
      ticket: ticket._id,
      claimType,
      status: 'pending',
      calledNumbersSnapshot: [...game.calledNumbers],
    });

    await claim.populate('player', 'username avatar');

    // Emit to host
    getIO().to(game.roomCode).emit('claim_submitted', {
      claim: {
        _id: claim._id,
        claimType: claim.claimType,
        status: claim.status,
        player: claim.player,
        submittedAt: claim.submittedAt,
      },
    });

    res.status(201).json({ success: true, claim });
  } catch (error) {
    next(error);
  }
};

// @desc  Approve a claim (host only)
// @route PATCH /api/claims/:id/approve
const approveClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('player', 'username avatar')
      .populate('ticket');

    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found' });

    const game = await Game.findById(claim.game);
    if (game.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only host can approve claims' });
    }

    if (claim.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Claim already resolved' });
    }

    // Double-check server validation
    const isValid = validateClaim(claim.claimType, claim.ticket, claim.calledNumbersSnapshot);
    if (!isValid) {
      claim.status = 'rejected';
      claim.resolvedAt = new Date();
      claim.resolvedBy = req.user._id;
      await claim.save();
      return res.status(400).json({ success: false, message: 'Claim failed validation' });
    }

    // Mark prize as claimed
    if (game.claimedPrizes[claim.claimType]) {
      claim.status = 'rejected';
      claim.resolvedAt = new Date();
      await claim.save();
      return res.status(400).json({ success: false, message: 'Prize already awarded to another player' });
    }

    game.claimedPrizes[claim.claimType] = true;
    await game.save();

    const points = game.pointConfig[claim.claimType] || 0;
    claim.status = 'approved';
    claim.pointsAwarded = points;
    claim.resolvedAt = new Date();
    claim.resolvedBy = req.user._id;
    await claim.save();

    // Update leaderboard
    const leaderboard = await Leaderboard.findOne({ game: claim.game });
    if (leaderboard) {
      const entry = leaderboard.entries.find((e) => e.player.toString() === claim.player._id.toString());
      if (entry) {
        entry.score += points;
        entry.claimsWon.push(claim.claimType);
      }
      // Recalculate ranks
      leaderboard.entries.sort((a, b) => b.score - a.score);
      leaderboard.entries.forEach((e, i) => (e.rank = i + 1));
      await leaderboard.save();
    }

    getIO().to(game.roomCode).emit('claim_approved', {
      claim: { _id: claim._id, claimType: claim.claimType, player: claim.player, pointsAwarded: points },
      leaderboard: leaderboard?.entries || [],
    });

    getIO().to(game.roomCode).emit('winner_announced', {
      winner: claim.player,
      claimType: claim.claimType,
      points,
    });

    res.json({ success: true, claim, leaderboard: leaderboard?.entries });
  } catch (error) {
    next(error);
  }
};

// @desc  Reject a claim (host only)
// @route PATCH /api/claims/:id/reject
const rejectClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id).populate('player', 'username avatar');
    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found' });

    const game = await Game.findById(claim.game);
    if (game.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only host can reject claims' });
    }

    if (claim.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Claim already resolved' });
    }

    claim.status = 'rejected';
    claim.resolvedAt = new Date();
    claim.resolvedBy = req.user._id;
    await claim.save();

    getIO().to(game.roomCode).emit('claim_rejected', {
      claim: { _id: claim._id, claimType: claim.claimType, player: claim.player },
    });

    res.json({ success: true, claim });
  } catch (error) {
    next(error);
  }
};

// @desc  Get pending claims for a game
// @route GET /api/claims/game/:gameId
const getGameClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ game: req.params.gameId, status: 'pending' })
      .populate('player', 'username avatar')
      .sort({ submittedAt: 1 });
    res.json({ success: true, claims });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitClaim, approveClaim, rejectClaim, getGameClaims };
