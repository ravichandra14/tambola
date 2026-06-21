const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

const escapeRegExp = (value) => [...value]
  .map((char) => '^.*+?()[]{}'.includes(char) || [36, 92].includes(char.charCodeAt(0))
    ? String.fromCharCode(92) + char
    : char)
  .join('');

const userPayload = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  avatar: user.avatar,
  gamesPlayed: user.gamesPlayed,
  gamesHosted: user.gamesHosted,
  totalScore: user.totalScore,
  claimsWon: user.claimsWon,
});

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    const normalizedUsername = username.trim();
    const lowerEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({
      $or: [
        { email: lowerEmail },
        { username: { $regex: new RegExp('^' + escapeRegExp(normalizedUsername) + '$', 'i') } },
      ],
    });

    if (existingUser) {
      const field = existingUser.email === lowerEmail ? 'Email' : 'Username';
      return res.status(400).json({ success: false, message: field + ' is already taken' });
    }

    const user = await User.create({ username: normalizedUsername, email: lowerEmail, password });
    res.status(201).json({ success: true, token: generateToken(user._id), user: userPayload(user) });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide email/username and password' });
    }

    const input = email.trim();
    const user = await User.findOne({
      $or: [
        { email: input.toLowerCase() },
        { username: { $regex: new RegExp('^' + escapeRegExp(input) + '$', 'i') } },
      ],
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({ success: true, token: generateToken(user._id), user: userPayload(user) });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res) => res.json({ success: true, user: req.user });

const updateProfile = async (req, res, next) => {
  try {
    const { username, avatar } = req.body;
    const update = {};

    if (username !== undefined) {
      if (typeof username !== 'string' || !username.trim()) {
        return res.status(400).json({ success: false, message: 'Username is invalid' });
      }
      const normalizedUsername = username.trim();
      const existingUser = await User.findOne({
        _id: { $ne: req.user._id },
        username: { $regex: new RegExp('^' + escapeRegExp(normalizedUsername) + '$', 'i') },
      });
      if (existingUser) return res.status(400).json({ success: false, message: 'Username is already taken' });
      update.username = normalizedUsername;
    }
    if (avatar !== undefined) update.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

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
