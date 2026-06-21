const Room = require('../../models/Room');
const Game = require('../../models/Game');
const Ticket = require('../../models/Ticket');
const Leaderboard = require('../../models/Leaderboard');
const Claim = require('../../models/Claim');
const ChatMessage = require('../../models/ChatMessage');
const { getRoomAccess, publicGame } = require('../../utils/access');

const buildSnapshot = async (room, role, userId) => {
  await room.populate('host', 'username avatar');
  await room.populate('players.user', 'username avatar');

  let game = null;
  let ticket = null;
  let leaderboard = [];
  let claims = [];

  if (room.currentGame) {
    const gameDocument = await Game.findById(room.currentGame);
    if (gameDocument) {
      game = publicGame(gameDocument, role);
      if (role === 'player') ticket = await Ticket.findOne({ game: gameDocument._id, player: userId });
      const board = await Leaderboard.findOne({ game: gameDocument._id });
      leaderboard = board?.entries || [];
      if (role === 'host') {
        claims = await Claim.find({ game: gameDocument._id, status: 'pending' })
          .populate('player', 'username avatar')
          .sort({ submittedAt: 1 });
      }
    }
  }

  const chatHistory = await ChatMessage.find({ room: room._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('sender', 'username avatar')
    .lean();

  return {
    room: {
      _id: room._id,
      roomCode: room.roomCode,
      status: room.status,
      host: room.host,
      players: room.players,
      pointConfig: room.pointConfig,
      numberCallingMode: room.numberCallingMode,
      autoInterval: room.autoInterval,
      currentGame: room.currentGame,
    },
    role,
    game,
    ticket,
    leaderboard,
    claims,
    chatHistory: chatHistory.reverse(),
  };
};

const registerRoomHandlers = (io, socket) => {
  socket.on('join_room', async ({ roomCode } = {}, acknowledge = () => {}) => {
    try {
      if (!roomCode || typeof roomCode !== 'string') {
        return acknowledge({ success: false, error: 'Room code is required' });
      }
      const room = await Room.findOne({ roomCode: roomCode.trim().toUpperCase() });
      if (!room) return acknowledge({ success: false, error: 'Room not found' });

      const access = await getRoomAccess(room, socket.user._id);
      if (!access.role) return acknowledge({ success: false, error: 'You are not a member of this room' });

      const canonicalCode = room.roomCode;
      socket.join(canonicalCode);
      socket.roomCode = canonicalCode;
      socket.roomRole = access.role;

      if (access.role === 'host') {
        room.hostSocketId = socket.id;
      } else {
        const player = room.players.find((entry) => entry.user.toString() === socket.user._id.toString());
        player.socketId = socket.id;
        player.connected = true;
        player.lastSeenAt = new Date();
      }
      await room.save();

      const snapshot = await buildSnapshot(room, access.role, socket.user._id);
      socket.emit('room_joined', snapshot);
      io.to(canonicalCode).emit('presence_changed', {
        playerId: socket.user._id,
        connected: true,
        players: snapshot.room.players,
      });
      acknowledge({ success: true, data: snapshot });
    } catch (error) {
      console.error('join_room error:', error.message);
      acknowledge({ success: false, error: 'Failed to join room' });
    }
  });

  socket.on('leave_room', async ({ roomCode } = {}, acknowledge = () => {}) => {
    try {
      const room = await Room.findOne({ roomCode: roomCode?.toUpperCase() });
      if (!room) return acknowledge({ success: false, error: 'Room not found' });
      const access = await getRoomAccess(room, socket.user._id);
      if (!access.role) return acknowledge({ success: false, error: 'Not a room member' });

      if (access.role === 'player' && room.status === 'waiting') {
        room.players = room.players.filter((entry) => entry.user.toString() !== socket.user._id.toString());
        await room.save();
      }
      socket.leave(room.roomCode);
      socket.roomCode = null;
      io.to(room.roomCode).emit('player_left', { playerId: socket.user._id });
      acknowledge({ success: true });
    } catch (error) {
      acknowledge({ success: false, error: error.message });
    }
  });

  socket.on('remove_player', async ({ roomCode, playerId } = {}, acknowledge = () => {}) => {
    try {
      const room = await Room.findOne({ roomCode: roomCode?.toUpperCase() });
      if (!room || room.host.toString() !== socket.user._id.toString()) {
        return acknowledge({ success: false, error: 'Only the host can remove players' });
      }

      const playerEntry = room.players.find((entry) => entry.user.toString() === playerId);
      room.players = room.players.filter((entry) => entry.user.toString() !== playerId);
      await room.save();

      if (playerEntry?.socketId) {
        io.to(playerEntry.socketId).emit('player_removed', { message: 'You have been removed from the room' });
        io.sockets.sockets.get(playerEntry.socketId)?.leave(room.roomCode);
      }

      io.to(room.roomCode).emit('player_left', { playerId, removed: true });
      acknowledge({ success: true });
    } catch (error) {
      acknowledge({ success: false, error: error.message });
    }
  });

  socket.on('disconnecting', async () => {
    try {
      if (!socket.roomCode) return;
      const room = await Room.findOne({ roomCode: socket.roomCode });
      if (!room) return;

      if (room.host.toString() === socket.user._id.toString()) {
        if (room.hostSocketId === socket.id) room.hostSocketId = null;
      } else {
        const player = room.players.find((entry) => entry.user.toString() === socket.user._id.toString());
        if (player && player.socketId === socket.id) {
          player.connected = false;
          player.socketId = null;
          player.lastSeenAt = new Date();
        }
      }
      await room.save();
      io.to(room.roomCode).emit('presence_changed', {
        playerId: socket.user._id,
        connected: false,
        lastSeenAt: new Date(),
      });
    } catch (error) {
      console.error('disconnecting error:', error.message);
    }
  });
};

module.exports = { registerRoomHandlers, buildSnapshot };
