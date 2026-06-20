const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// @desc  Register new user
// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    const lowerEmail = email.toLowerCase();
    const existingUser = await User.findOne({
      $or: [
        { email: lowerEmail },
        { username: { $regex: new RegExp(`^${username}$`, 'i') } }
      ]
    });

    if (existingUser) {
      const field = existingUser.email === lowerEmail ? 'Email' : 'Username';
      return res.status(400).json({ success: false, message: `${field} is already taken` });
    }

    const user = await User.create({ username, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        gamesPlayed: user.gamesPlayed,
        gamesHosted: user.gamesHosted,
        totalScore: user.totalScore,
        claimsWon: user.claimsWon,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Login user
// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email/username and password' });
    }

    const lowerInput = email.toLowerCase();
    // Allow login with either email or username
    const user = await User.findOne({
      $or: [
        { email: lowerInput },
        { username: { $regex: new RegExp(`^${email}$`, 'i') } }
      ]
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        gamesPlayed: user.gamesPlayed,
        gamesHosted: user.gamesHosted,
        totalScore: user.totalScore,
        claimsWon: user.claimsWon,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get current user
// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @desc  Update profile
// @route PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { username, avatar } = req.body;
    const update = {};
    if (username) {
      // Check if username is already taken by someone else
      const existingUser = await User.findOne({ 
        _id: { $ne: req.user._id },
        username: { $regex: new RegExp(`^${username}$`, 'i') } 
      });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Username is already taken' });
      }
      update.username = username;
    }
    if (avatar !== undefined) update.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, update, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc  Change password
// @route PUT /api/auth/profile/password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
