const { v4: uuidv4 } = require('uuid');

const generateRoomCode = () => {
  // Generate a 6-character alphanumeric code (uppercase)
  return uuidv4().replace(/-/g, '').substring(0, 6).toUpperCase();
};

module.exports = { generateRoomCode };
