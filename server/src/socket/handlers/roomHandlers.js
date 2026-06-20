const Room = require('../../models/Room');
const Game = require('../../models/Game');
const Ticket = require('../../models/Ticket');
const Leaderboard = require('../../models/Leaderboard');
const ChatMessage = require('../../models/ChatMessage');

const registerRoomHandlers = (io, socket) => {
  // Join room
  socket.on('join_room', async ({ roomCode, isHost }) => {
    try {
      if (!socket.user) return;

      const room = await Room.findOne({ roomCode: roomCode.toUpperCase() })
        .populate('host', 'username avatar email')
        .populate('players.user', 'username avatar email');

      if (!room) {
        return socket.emit('error', { message: 'Room not found' });
      }

      socket.join(roomCode);
      socket.roomCode = roomCode;

      // Update socket IDs
      if (isHost) {
        room.hostSocketId = socket.id;
        await room.save();
      } else {
        const playerEntry = room.players.find((p) => p.user._id.toString() === socket.user._id.toString());
        if (playerEntry) {
          playerEntry.socketId = socket.id;
          await room.save();
        }
      }

      // If game is active, send ticket to player
      let ticket = null;
      let game = null;
      if (room.currentGame && !isHost) {
        game = await Game.findById(room.currentGame);
        if (game) {
          ticket = await Ticket.findOne({ game: game._id, player: socket.user._id });
        }
      }

      // Load chat history (last 50)
      const chatHistory = await ChatMessage.find({ room: room._id })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('sender', 'username avatar')
        .lean();

      socket.emit('room_joined', {
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
        ticket,
        game,
        chatHistory: chatHistory.reverse(),
      });

      // Notify room of new player
      if (!isHost) {
        io.to(roomCode).emit('player_joined', {
          player: { _id: socket.user._id, username: socket.user.username, avatar: socket.user.avatar },
          players: room.players,
        });
      }
    } catch (err) {
      console.error('join_room error:', err.message);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Leave room
  socket.on('leave_room', async ({ roomCode }) => {
    try {
      socket.leave(roomCode);
      if (socket.user) {
        io.to(roomCode).emit('player_left', {
          playerId: socket.user._id,
          username: socket.user.username,
        });
      }
    } catch (err) {
      console.error('leave_room error:', err.message);
    }
  });

  // Remove player (host action)
  socket.on('remove_player', async ({ roomCode, playerId }) => {
    try {
      const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
      if (!room || room.host.toString() !== socket.user._id.toString()) return;

      const playerEntry = room.players.find((p) => p.user.toString() === playerId);
      room.players = room.players.filter((p) => p.user.toString() !== playerId);
      await room.save();

      // Disconnect the removed player's socket
      if (playerEntry && playerEntry.socketId) {
        io.to(playerEntry.socketId).emit('player_removed', { message: 'You have been removed from the room' });
        const removedSocket = io.sockets.sockets.get(playerEntry.socketId);
        if (removedSocket) removedSocket.leave(roomCode);
      }

      io.to(roomCode).emit('player_left', { playerId, removed: true });
    } catch (err) {
      console.error('remove_player error:', err.message);
    }
  });

  // Disconnect
  socket.on('disconnecting', async () => {
    try {
      if (socket.roomCode && socket.user) {
        io.to(socket.roomCode).emit('player_left', {
          playerId: socket.user._id,
          username: socket.user.username,
        });
      }
    } catch (err) {
      console.error('disconnecting error:', err.message);
    }
  });
};

module.exports = { registerRoomHandlers };
