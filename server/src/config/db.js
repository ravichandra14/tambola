const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
  const connection = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log('MongoDB connected: ' + connection.connection.host);
  return connection;
};

module.exports = connectDB;
