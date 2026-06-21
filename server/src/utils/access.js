const Room = require('../models/Room');

const isSameId = (a, b) => a && b && a.toString() === b.toString();

const getRoomAccess = async (roomOrId, userId) => {
  const room = typeof roomOrId === 'object' && roomOrId.roomCode
    ? roomOrId
    : await Room.findById(roomOrId);
  if (!room) return { room: null, role: null };
  if (isSameId(room.host?._id || room.host, userId)) return { room, role: 'host' };
  const member = room.players.some((entry) => isSameId(entry.user?._id || entry.user, userId));
  return { room, role: member ? 'player' : null };
};

const publicGame = (game, role) => {
  const value = game?.toObject ? game.toObject() : { ...game };
  if (role !== 'host') delete value.remainingNumbers;
  return value;
};

module.exports = { getRoomAccess, isSameId, publicGame };
