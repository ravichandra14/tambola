const Room = require('../models/Room');
const { generateRoomCode } = require('../utils/roomCodeGenerator');

// @desc  Create a new room
// @route POST /api/rooms/create
const createRoom = async (req, res, next) => {
  try {
    // Close any existing active rooms by this host
    await Room.updateMany(
      { host: req.user._id, status: { $in: ['waiting', 'active', 'paused'] } },
      { status: 'ended' }
    );

    const { pointConfig, numberCallingMode, autoInterval } = req.body;

    let roomCode;
    let exists = true;
    while (exists) {
      roomCode = generateRoomCode();
      exists = await Room.findOne({ roomCode });
    }

    const room = await Room.create({
      roomCode,
      host: req.user._id,
      pointConfig: pointConfig || undefined,
      numberCallingMode: numberCallingMode || 'manual',
      autoInterval: autoInterval || 5,
    });

    await room.populate('host', 'username email avatar');

    res.status(201).json({ success: true, room });
  } catch (error) {
    next(error);
  }
};

// @desc  Get room by code
// @route GET /api/rooms/:code
const getRoomByCode = async (req, res, next) => {
  try {
    const room = await Room.findOne({ roomCode: req.params.code.toUpperCase() })
      .populate('host', 'username email avatar')
      .populate('players.user', 'username email avatar');

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.json({ success: true, room });
  } catch (error) {
    next(error);
  }
};

// @desc  Join a room
// @route POST /api/rooms/:code/join
const joinRoom = async (req, res, next) => {
  try {
    const room = await Room.findOne({ roomCode: req.params.code.toUpperCase() }).populate(
      'host',
      'username email avatar'
    );

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.status === 'ended') {
      return res.status(400).json({ success: false, message: 'This game has ended' });
    }

    if (room.status === 'active') {
      return res.status(400).json({ success: false, message: 'Game already in progress' });
    }

    await Room.updateOne(
      { _id: room._id, 'players.user': { $ne: req.user._id } },
      { $push: { players: { user: req.user._id } } }
    );

    await room.populate('players.user', 'username email avatar');

    res.json({ success: true, room });
  } catch (error) {
    next(error);
  }
};

// @desc  Update room settings (host only)
// @route PUT /api/rooms/:id
const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    if (room.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (room.status !== 'waiting') {
      return res.status(400).json({ success: false, message: 'Cannot update room after game started' });
    }

    const { pointConfig, numberCallingMode, autoInterval } = req.body;
    if (pointConfig) room.pointConfig = { ...room.pointConfig.toObject(), ...pointConfig };
    if (numberCallingMode) room.numberCallingMode = numberCallingMode;
    if (autoInterval) room.autoInterval = autoInterval;

    await room.save();
    res.json({ success: true, room });
  } catch (error) {
    next(error);
  }
};

// @desc  Remove player from room (host only)
// @route DELETE /api/rooms/:id/remove-player/:playerId
const removePlayer = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    if (room.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    room.players = room.players.filter((p) => p.user.toString() !== req.params.playerId);
    await room.save();

    res.json({ success: true, message: 'Player removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRoom, getRoomByCode, joinRoom, updateRoom, removePlayer };
