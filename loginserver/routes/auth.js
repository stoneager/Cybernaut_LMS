const express = require('express');
const jwt = require('jsonwebtoken');
const Credential = require('../models/Credential');
const verifyAccessToken = require('../middleware/auth');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

const router = express.Router();

const generateAccessToken = (user) =>
  jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

const generateRefreshToken = (user) =>
  jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await Credential.findOne({ username });

  if (!user) return res.status(400).json({ error: 'User not found' });
  if (user.password !== password) return res.status(403).json({ error: 'Invalid credentials' });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refresh_token = refreshToken;
  await user.save();

  res.json({ accessToken, refreshToken, role: user.role });
});

// Get logged-in user details
router.get('/student/me', verifyAccessToken, async (req, res) => {
  const student = await Student.findOne({ username: req.user.username });
  if (!student) return res.sendStatus(404);
  res.json(student);
});

router.get('/admin/me', verifyAccessToken, async (req, res) => {
  const admin = await Admin.findOne({ username: req.user.username });
  if (!admin) return res.sendStatus(404);
  res.json(admin);
});

router.post('/change-password', async (req, res) => {
  const { username, newPassword } = req.body;

  const user = await Credential.findOne({ username });
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.password = newPassword;
  await user.save();

  res.json({ message: 'Password changed successfully' });
});

module.exports = router;
