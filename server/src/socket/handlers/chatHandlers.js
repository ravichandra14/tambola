const Room = require('../../models/Room');
const ChatMessage = require('../../models/ChatMessage');

const registerChatHandlers = (io, socket) => {
  // Send chat message
  socket.on('send_chat', async ({ roomCode, message }) => {
    try {
      if (!socket.user || !message || !roomCode) return;
      if (message.trim().length === 0 || message.length > 500) return;

      const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
      if (!room) return;

      const chat = await ChatMessage.create({
        room: room._id,
        sender: socket.user._id,
        senderName: socket.user.username,
        message: message.trim(),
        type: 'user',
      });

      io.to(roomCode).emit('chat_message', {
        _id: chat._id,
        sender: { _id: socket.user._id, username: socket.user.username, avatar: socket.user.avatar },
        message: chat.message,
        timestamp: chat.createdAt,
        type: 'user',
      });
    } catch (err) {
      console.error('Chat error:', err.message);
    }
  });
};

module.exports = { registerChatHandlers };
