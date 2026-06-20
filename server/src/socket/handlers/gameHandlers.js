const Game = require('../../models/Game');
const Room = require('../../models/Room');

// Auto-call timer storage: gameId -> intervalId
const autoCallTimers = new Map();

const registerGameHandlers = (io, socket) => {
  // Manual call number via socket
  socket.on('call_number', async ({ roomCode, gameId }) => {
    try {
      const game = await Game.findById(gameId);
      if (!game || game.host.toString() !== socket.user._id.toString()) return;
      if (game.status !== 'active') return;
      if (game.remainingNumbers.length === 0) {
        return io.to(roomCode).emit('all_numbers_called', {});
      }

      const number = game.remainingNumbers.shift();
      game.calledNumbers.push(number);
      game.currentNumber = number;
      await game.save();

      io.to(roomCode).emit('number_called', {
        number,
        calledNumbers: game.calledNumbers,
        remaining: game.remainingNumbers.length,
      });
    } catch (err) {
      console.error('call_number error:', err.message);
    }
  });

  // Start auto-calling
  socket.on('start_auto_call', async ({ roomCode, gameId }) => {
    try {
      const game = await Game.findById(gameId);
      if (!game || game.host.toString() !== socket.user._id.toString()) return;

      // Clear existing timer if any
      if (autoCallTimers.has(gameId)) {
        clearInterval(autoCallTimers.get(gameId));
      }

      const intervalMs = (game.autoInterval || 5) * 1000;

      const timer = setInterval(async () => {
        try {
          const freshGame = await Game.findById(gameId);
          if (!freshGame || freshGame.status !== 'active' || freshGame.remainingNumbers.length === 0) {
            clearInterval(timer);
            autoCallTimers.delete(gameId);
            if (freshGame && freshGame.remainingNumbers.length === 0) {
              io.to(roomCode).emit('all_numbers_called', {});
            }
            return;
          }

          const number = freshGame.remainingNumbers.shift();
          freshGame.calledNumbers.push(number);
          freshGame.currentNumber = number;
          await freshGame.save();

          io.to(roomCode).emit('number_called', {
            number,
            calledNumbers: freshGame.calledNumbers,
            remaining: freshGame.remainingNumbers.length,
          });
        } catch (e) {
          console.error('Auto call error:', e.message);
          clearInterval(timer);
          autoCallTimers.delete(gameId);
        }
      }, intervalMs);

      autoCallTimers.set(gameId, timer);
      socket.emit('auto_call_started', { interval: game.autoInterval });
    } catch (err) {
      console.error('start_auto_call error:', err.message);
    }
  });

  // Stop auto-calling
  socket.on('stop_auto_call', ({ gameId }) => {
    if (autoCallTimers.has(gameId)) {
      clearInterval(autoCallTimers.get(gameId));
      autoCallTimers.delete(gameId);
      socket.emit('auto_call_stopped', {});
    }
  });
};

module.exports = { registerGameHandlers, autoCallTimers };
