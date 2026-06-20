const mongoose = require('c:\\Users\\ravic\\OneDrive\\Desktop\\tambola\\server\\node_modules\\mongoose');
require('c:\\Users\\ravic\\OneDrive\\Desktop\\tambola\\server\\node_modules\\dotenv').config({ path: 'c:\\Users\\ravic\\OneDrive\\Desktop\\tambola\\server\\.env' });
require('dns').setServers(['8.8.8.8', '1.1.1.1']);

const User = require('c:\\Users\\ravic\\OneDrive\\Desktop\\tambola\\server\\src\\models\\User');
const bcrypt = require('c:\\Users\\ravic\\OneDrive\\Desktop\\tambola\\server\\node_modules\\bcryptjs');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    try {
      // Create a test user
      const r = Math.floor(Math.random() * 10000);
      const testEmail = `test${r}@test.com`;
      console.log('Registering user with email:', testEmail);
      
      const user = await User.create({
        username: `user${r}`,
        email: testEmail,
        password: 'password123'
      });
      
      console.log('User created. Hashed password in DB:', user.password);
      
      // Try to login
      const foundUser = await User.findOne({ email: testEmail }).select('+password');
      console.log('Found user for login. Hashed password:', foundUser.password);
      
      const isMatch = await foundUser.comparePassword('password123');
      console.log('Password match:', isMatch);
      
      // Manual test
      const manualMatch = await bcrypt.compare('password123', foundUser.password);
      console.log('Manual match:', manualMatch);
      
    } catch (err) {
      console.error(err);
    }
    process.exit(0);
  });
