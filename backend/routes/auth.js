const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const mockDb = require('../models/mockDb');
const { authenticateToken } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'darkwatch_ultra_secure_jwt_token_secret_key_1337';

// Generate Token Helpers
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
};

// @route   POST api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  const assignedRole = role || 'SOC Analyst';

  try {
    if (req.isUsingMockDb) {
      const exists = mockDb.users.find(u => u.email === email || u.username === username);
      if (exists) return res.status(400).json({ message: 'User already exists' });

      const newUser = {
        id: 'usr_' + Date.now(),
        username,
        email,
        passwordHash: bcrypt.hashSync(password, 10),
        role: assignedRole,
        isVerified: true,
        createdAt: new Date()
      };
      mockDb.users.push(newUser);

      const token = generateToken({ id: newUser.id, username: newUser.username, role: newUser.role });
      return res.status(201).json({
        token,
        user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role }
      });
    }

    // Mongoose execution
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({ username, email, password, role: assignedRole, isVerified: true });
    await user.save();

    const token = generateToken({ id: user._id, username: user.username, role: user.role });
    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during registration', error: err.message });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user and get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    if (req.isUsingMockDb) {
      const user = mockDb.users.find(u => u.email === email || u.username === email);
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });

      const isMatch = bcrypt.compareSync(password, user.passwordHash);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      const token = generateToken({ id: user.id, username: user.username, role: user.role });
      return res.json({
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role }
      });
    }

    // Mongoose execution
    const user = await User.findOne({ $or: [{ email }, { username: email }] });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken({ id: user._id, username: user.username, role: user.role });
    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
});

// @route   GET api/auth/profile
// @desc    Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    if (req.isUsingMockDb) {
      const user = mockDb.users.find(u => u.id === req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching profile', error: err.message });
  }
});

module.exports = router;
