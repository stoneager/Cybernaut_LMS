const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust the path as needed

const verifyAccessToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  console.log("Decoded ID Auth:", decoded.id);

  const user = await User.findById(decoded.id);

  if (!user) {
    console.log("⚠️ User not found with this ID");
    return res.status(401).json({ error: "User not found" });
  }

  console.log("User:", user);
  console.log("Sent token:", token);
  console.log("Stored token:", user?.activeToken);

  if (user.activeToken !== token) {
    console.log("⚠️ Token mismatch!");
    return res.status(401).json({ error: "Session expired or invalidated" });
  }

  req.user = {
    id: user._id,
    email: user.email,
    role: user.role
  };

  next();
} catch (err) {
  console.log("❌ JWT verification error:", err);
  return res.status(403).json({ error: 'Invalid or expired token' });
}

};

module.exports = verifyAccessToken;
