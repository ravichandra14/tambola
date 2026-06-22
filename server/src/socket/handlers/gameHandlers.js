const Game = require('../../models/Game');
const { callNextNumber } = require('../../utils/gameCalls');

const autoCallTimers = new Map();

const emitNumber = (io, game) => {
  io.to(game.roomCode).emit('number_called', {
    number: game.currentNumber,
    calledNumbers: game.calledNumbers,
    remaining: game.remainingNumbers.length,
  });
};

const stopAutoCall = async (gameId) => {
  const key = gameId.toString();
  if (autoCallTimers.has(key)) clearInterval(autoCallTimers.get(key));
  autoCallTimers.delete(key);
  await Game.updateOne(
    { _id: gameId },
    { $set: { autoCallEnabled: false, nextAutoCallAt: null } }
  );
};

const startAutoCall = async (io, game) => {
  const key = game._id.toString();
  if (autoCallTimers.has(key)) clearInterval(autoCallTimers.get(key));

  const intervalMs = (game.autoInterval || 5) * 1000;
  await Game.updateOne(
    { _id: game._id, status: 'active' },
    { $set: { autoCallEnabled: true, nextAutoCallAt: new Date(Date.now() + intervalMs) } }
  );

  const timer = setInterval(async () => {
    try {
      const called = await callNextNumber(game._id);
      if (!called) {
        clearInterval(autoCallTimers.get(game._id.toString()));
        autoCallTimers.delete(game._id.toString());
        await Game.updateOne(
          { _id: game._id },
          { $set: { autoCallEnabled: false, nextAutoCallAt: null } }
        ).catch(() => {});
        io.to(game.roomCode).emit('all_numbers_called', {});
        return;
      }
      called.nextAutoCallAt = new Date(Date.now() + intervalMs);
      called.autoCallEnabled = true;
      await called.save();
      emitNumber(io, called);
      if (called.remainingNumbers.length === 0) {
        clearInterval(autoCallTimers.get(game._id.toString()));
        autoCallTimers.delete(game._id.toString());
        await Game.updateOne(
          { _id: game._id },
          { $set: { autoCallEnabled: false, nextAutoCallAt: null } }
        ).catch(() => {});
        io.to(game.roomCode).emit('all_numbers_called', {});
      }
    } catch (error) {
      console.error('Auto call error:', error.message);
      try {
        await stopAutoCall(game._id);
      } catch (stopErr) {
        console.error('stopAutoCall error:', stopErr.message);
      }
    }
  }, intervalMs);

  autoCallTimers.set(key, timer);
};

const restoreAutoCallTimers = async (io) => {
  const games = await Game.find({ status: 'active', autoCallEnabled: true });
  for (const game of games) await startAutoCall(io, game);
};

const registerGameHandlers = (io, socket) => {
  socket.on('call_number', async ({ gameId } = {}, acknowledge = () => {}) => {
    try {
      const existing = await Game.findById(gameId).select('host');
      if (!existing || existing.host.toString() !== socket.user._id.toString()) {
        return acknowledge({ success: false, error: 'Only the host can call numbers' });
      }
      const game = await callNextNumber(gameId);
      if (!game) return acknowledge({ success: false, error: 'Game is inactive or all numbers were called' });
      emitNumber(io, game);
      acknowledge({ success: true, data: { number: game.currentNumber } });
    } catch (error) {
      acknowledge({ success: false, error: error.message });
    }
  });

  socket.on('start_auto_call', async ({ gameId, interval } = {}, acknowledge = () => {}) => {
    try {
      const game = await Game.findById(gameId);
      if (!game || game.host.toString() !== socket.user._id.toString()) {
        return acknowledge({ success: false, error: 'Only the host can start auto-call' });
      }
      if (game.status !== 'active') return acknowledge({ success: false, error: 'Game is not active' });
      if (interval !== undefined) {
        if (![3, 5, 10, 15].includes(Number(interval))) return acknowledge({ success: false, error: 'Invalid interval' });
        game.autoInterval = Number(interval);
        await game.save();
      }
      await startAutoCall(io, game);
      acknowledge({ success: true, data: { interval: game.autoInterval } });
    } catch (error) {
      acknowledge({ success: false, error: error.message });
    }
  });

  socket.on('stop_auto_call', async ({ gameId } = {}, acknowledge = () => {}) => {
    try {
      const game = await Game.findById(gameId).select('host');
      if (!game || game.host.toString() !== socket.user._id.toString()) {
        return acknowledge({ success: false, error: 'Only the host can stop auto-call' });
      }
      await stopAutoCall(gameId);
      acknowledge({ success: true });
    } catch (error) {
      acknowledge({ success: false, error: error.message });
    }
  });
};

module.exports = {
  registerGameHandlers,
  autoCallTimers,
  startAutoCall,
  stopAutoCall,
  restoreAutoCallTimers,
};
