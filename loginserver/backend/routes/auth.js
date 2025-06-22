const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const User = require('../models/User');
const verifyAccessToken = require('../middleware/auth');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

const router = express.Router();

// Token Generators
const generateAccessToken = (user) =>
  jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

const generateRefreshToken = (user) =>
  jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

// -----------------------------
// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ error: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  console.log("Connected");

  // ✅ Store accessToken for session verification
  user.activeToken = accessToken;
  await user.save();

  res.json({ accessToken, refreshToken, role: user.role });
});


// -----------------------------
// Get Student Profile
// -----------------------------
router.get('/student/me', verifyAccessToken, async (req, res) => {
  const student = await Student.findOne({ user: req.user.id }).populate('user');
  if (!student) return res.sendStatus(404);
  res.json(student);
});

// -----------------------------
// Get Admin Profile
// -----------------------------
router.get('/admin/me', verifyAccessToken, async (req, res) => {
  const admin = await Admin.findOne({ user: req.user.id }).populate('user');
  if (!admin) return res.sendStatus(404);
  res.json(admin);
});

// -----------------------------
// Get Super Admin Profile
// -----------------------------
router.get('/superadmin/me', verifyAccessToken, async (req, res) => {
  try {
    // Check if the logged-in user is the superadmin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(req.user.id);

    if (!user || user.role !== 'superadmin') {
      return res.status(404).json({ error: 'Super Admin not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// -----------------------------
// Change Password
// -----------------------------
router.post('/change-password', async (req, res) => {
  const { email, newPassword } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ error: 'User not found' });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: 'Password changed successfully' });
});

router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashed,
      role,
    });

    await newUser.save();
    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/logout", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(400).json({ error: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Clear the activeToken field
    await User.findByIdAndUpdate(decoded.id, { activeToken: null });

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

router.get("/verify", verifyAccessToken, (req, res) => {
  console.log("Verified");
  return res.status(200).json({ message: "Token valid" });
});



module.exports = router;
