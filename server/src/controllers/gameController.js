const Game = require('../models/Game');
const Room = require('../models/Room');
const Ticket = require('../models/Ticket');
const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');
const { generateTicket } = require('../utils/ticketGenerator');
const { getIO } = require('../config/socket');
const { getRoomAccess, publicGame } = require('../utils/access');
const { callNextNumber } = require('../utils/gameCalls');
const { stopAutoCall } = require('../socket/handlers/gameHandlers');

// @desc  Start game
// @route POST /api/games/start
const startGame = async (req, res, next) => {
  try {
    const { roomId } = req.body;
    const room = await Room.findById(roomId).populate('players.user', 'username email');

    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    if (room.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only host can start the game' });
    }
    if (room.status !== 'waiting') {
      return res.status(400).json({ success: false, message: 'Game already started' });
    }
    if (room.players.length === 0) {
      return res.status(400).json({ success: false, message: 'Need at least one player to start' });
    }

    // Build number pool 1-90 and shuffle
    const numbers = Array.from({ length: 90 }, (_, i) => i + 1);
    const shuffled = [...numbers];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }

    const game = await Game.create({
      room: room._id,
      roomCode: room.roomCode,
      host: req.user._id,
      remainingNumbers: shuffled,
      calledNumbers: [],
      status: 'active',
      pointConfig: room.pointConfig,
      playerCount: room.players.length,
      numberCallingMode: room.numberCallingMode,
      autoInterval: room.autoInterval,
    });

    // Generate unique ticket for each unique player
    const uniquePlayers = [];
    const seenPlayers = new Set();
    for (const p of room.players) {
      const pid = p.user._id.toString();
      if (!seenPlayers.has(pid)) {
        seenPlayers.add(pid);
        uniquePlayers.push(p);
      }
    }

    const tickets = [];
    for (const playerEntry of uniquePlayers) {
      const ticketData = generateTicket();
      const ticket = await Ticket.create({
        game: game._id,
        player: playerEntry.user._id,
        rows: ticketData.rows,
        numbers: ticketData.numbers,
      });
      tickets.push({ player: playerEntry.user._id, ticket });
    }

    // Initialize leaderboard
    const leaderboardEntries = uniquePlayers.map((p) => ({
      player: p.user._id,
      username: p.user.username,
      score: 0,
      claimsWon: [],
      rank: 0,
    }));
    const leaderboard = await Leaderboard.create({ game: game._id, entries: leaderboardEntries });

    // Update room status and link game
    room.status = 'active';
    room.currentGame = game._id;
    await room.save();

    // Update host stats
    await User.findByIdAndUpdate(req.user._id, { $inc: { gamesHosted: 1 } });

    // Emit to each player their unique ticket
    const io = getIO();
    for (const { player, ticket } of tickets) {
      // Find socket for this player
      const playerEntry = room.players.find((p) => p.user._id.toString() === player.toString());
      if (playerEntry && playerEntry.socketId) {
        io.to(playerEntry.socketId).emit('game_started', {
          game: { _id: game._id, roomCode: game.roomCode, status: game.status },
          ticket,
        });
      }
    }

    // Emit game_started to room (host + players)
    io.to(room.roomCode).emit('game_started', {
      game: { _id: game._id, roomCode: game.roomCode, status: game.status, pointConfig: game.pointConfig },
      leaderboard: leaderboard.entries,
    });

    res.status(201).json({ success: true, game, tickets: tickets.length });
  } catch (error) {
    next(error);
  }
};

// @desc  Get game by ID
// @route GET /api/games/:id
const getGame = async (req, res, next) => {
  try {
    const game = await Game.findById(req.params.id).populate('host', 'username');
    if (!game) return res.status(404).json({ success: false, message: 'Game not found' });
    const access = await getRoomAccess(game.room, req.user._id);
    if (!access.role) return res.status(403).json({ success: false, message: 'Not a game participant' });
    res.json({ success: true, game: publicGame(game, access.role) });
  } catch (error) {
    next(error);
  }
};

// @desc  Get ticket for a player in a game
// @route GET /api/games/:id/my-ticket
const getMyTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({ game: req.params.id, player: req.user._id });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

// @desc  Pause game
// @route PATCH /api/games/:id/pause
const pauseGame = async (req, res, next) => {
  try {
    const game = await Game.findOneAndUpdate(
      { _id: req.params.id, host: req.user._id, status: 'active' },
      { $set: { status: 'paused', autoCallEnabled: false, nextAutoCallAt: null } },
      { new: true }
    );
    if (!game) return res.status(409).json({ success: false, message: 'Game cannot be paused' });

    await stopAutoCall(game._id);
    await Room.updateOne({ _id: game.room }, { $set: { status: 'paused' } });
    getIO().to(game.roomCode).emit('game_paused', { gameId: game._id });
    res.json({ success: true, message: 'Game paused' });
  } catch (error) {
    next(error);
  }
};

// @desc  Resume game
// @route PATCH /api/games/:id/resume
const resumeGame = async (req, res, next) => {
  try {
    const game = await Game.findOneAndUpdate(
      { _id: req.params.id, host: req.user._id, status: 'paused' },
      { $set: { status: 'active' } },
      { new: true }
    );
    if (!game) return res.status(409).json({ success: false, message: 'Game cannot be resumed' });

    await Room.updateOne({ _id: game.room }, { $set: { status: 'active' } });
    getIO().to(game.roomCode).emit('game_resumed', { gameId: game._id });
    res.json({ success: true, message: 'Game resumed' });
  } catch (error) {
    next(error);
  }
};

// @desc  End game
// @route PATCH /api/games/:id/end
const endGame = async (req, res, next) => {
  try {
    const game = await Game.findOneAndUpdate(
      { _id: req.params.id, host: req.user._id, status: { $in: ['active', 'paused'] } },
      { $set: { status: 'ended', endedAt: new Date(), autoCallEnabled: false, nextAutoCallAt: null } },
      { new: true }
    );
    if (!game) {
      const existing = await Game.findById(req.params.id);
      if (!existing) return res.status(404).json({ success: false, message: 'Game not found' });
      if (existing.host.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Only host can end the game' });
      }
      return res.status(409).json({ success: false, message: 'Game already ended' });
    }

    await stopAutoCall(game._id);
    await Room.updateOne({ _id: game.room }, { $set: { status: 'ended' } });

    const leaderboard = await Leaderboard.findOne({ game: game._id });
    if (leaderboard) {
      leaderboard.entries.sort((a, b) => b.score - a.score);
      leaderboard.entries.forEach((entry, index) => { entry.rank = index + 1; });
      leaderboard.finalizedAt = new Date();
      await leaderboard.save();
      await Promise.all(leaderboard.entries.map((entry) => User.findByIdAndUpdate(entry.player, {
        $inc: { gamesPlayed: 1, totalScore: entry.score, claimsWon: entry.claimsWon.length },
      })));
    }

    getIO().to(game.roomCode).emit('game_ended', {
      gameId: game._id,
      finalScoreboard: leaderboard?.entries || [],
    });
    res.json({ success: true, message: 'Game ended', leaderboard: leaderboard?.entries || [] });
  } catch (error) {
    next(error);
  }
};

// @desc  Call next number (manual mode)
// @route POST /api/games/:id/call-number
const callNumber = async (req, res, next) => {
  try {
    const existing = await Game.findById(req.params.id).select('host status');
    if (!existing) return res.status(404).json({ success: false, message: 'Game not found' });
    if (existing.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only host can call numbers' });
    }
    const game = await callNextNumber(req.params.id);
    if (!game) return res.status(409).json({ success: false, message: 'Game is inactive or all numbers were called' });

    getIO().to(game.roomCode).emit('number_called', {
      number: game.currentNumber,
      calledNumbers: game.calledNumbers,
      remaining: game.remainingNumbers.length,
    });
    res.json({ success: true, number: game.currentNumber, calledNumbers: game.calledNumbers });
  } catch (error) {
    next(error);
  }
};

module.exports = { startGame, getGame, getMyTicket, pauseGame, resumeGame, endGame, callNumber };
