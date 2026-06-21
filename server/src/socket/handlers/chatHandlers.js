const Room = require('../../models/Room');
const ChatMessage = require('../../models/ChatMessage');
const { getRoomAccess } = require('../../utils/access');

const registerChatHandlers = (io, socket) => {
  socket.on('send_chat', async ({ roomCode, message } = {}, acknowledge = () => {}) => {
    try {
      if (typeof message !== 'string' || !message.trim() || message.length > 500) {
        return acknowledge({ success: false, error: 'Message must contain 1-500 characters' });
      }
      const room = await Room.findOne({ roomCode: roomCode?.toUpperCase() });
      const access = room ? await getRoomAccess(room, socket.user._id) : { role: null };
      if (!room || !access.role || !socket.rooms.has(room.roomCode)) {
        return acknowledge({ success: false, error: 'You are not connected to this room' });
      }

      const chat = await ChatMessage.create({
        room: room._id,
        sender: socket.user._id,
        senderName: socket.user.username,
        message: message.trim(),
      });

      io.to(room.roomCode).emit('chat_message', {
        _id: chat._id,
        sender: { _id: socket.user._id, username: socket.user.username, avatar: socket.user.avatar },
        message: chat.message,
        timestamp: chat.createdAt,
        type: 'user',
      });
      acknowledge({ success: true });
    } catch (error) {
      acknowledge({ success: false, error: error.message });
    }
  });
};

module.exports = { registerChatHandlers };
