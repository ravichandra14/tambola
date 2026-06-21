const Room = require('../models/Room');
const Game = require('../models/Game');
const { stopAutoCall } = require('../socket/handlers/gameHandlers');
const { generateRoomCode } = require('../utils/roomCodeGenerator');
const { getRoomAccess } = require('../utils/access');

// @desc  Create a new room
// @route POST /api/rooms/create
const createRoom = async (req, res, next) => {
  try {
    // Close existing rooms and persisted callers owned by this host.
    const previousRooms = await Room.find({
      host: req.user._id,
      status: { $in: ['waiting', 'active', 'paused'] },
    }).select('currentGame');
    for (const previousRoom of previousRooms) {
      if (previousRoom.currentGame) {
        await stopAutoCall(previousRoom.currentGame);
        await Game.updateOne(
          { _id: previousRoom.currentGame, status: { $ne: 'ended' } },
          { $set: { status: 'ended', endedAt: new Date(), autoCallEnabled: false, nextAutoCallAt: null } }
        );
      }
    }
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
      .populate('host', 'username avatar')
      .populate('players.user', 'username avatar');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    const access = await getRoomAccess(room, req.user._id);
    if (!access.role) return res.status(403).json({ success: false, message: 'You are not a member of this room' });
    res.json({ success: true, room, role: access.role });
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

    const alreadyMember = room.players.some((entry) => entry.user.toString() === req.user._id.toString());
    if (['active', 'paused'].includes(room.status) && !alreadyMember) {
      return res.status(400).json({ success: false, message: 'Game already in progress' });
    }

    await Room.updateOne(
      { _id: room._id, 'players.user': { $ne: req.user._id } },
      { $push: { players: { user: req.user._id } } }
    );

    const updatedRoom = await Room.findById(room._id)
      .populate('host', 'username avatar')
      .populate('players.user', 'username avatar');

    res.json({ success: true, room: updatedRoom });
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


const getRoomState = async (req, res, next) => {
  try {
    const room = await Room.findOne({ roomCode: req.params.code.toUpperCase() });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    const access = await getRoomAccess(room, req.user._id);
    if (!access.role) return res.status(403).json({ success: false, message: 'You are not a room member' });
    const { buildSnapshot } = require('../socket/handlers/roomHandlers');
    const snapshot = await buildSnapshot(room, access.role, req.user._id);
    res.json({ success: true, ...snapshot });
  } catch (error) {
    next(error);
  }
};
module.exports = { createRoom, getRoomByCode, getRoomState, joinRoom, updateRoom, removePlayer };
