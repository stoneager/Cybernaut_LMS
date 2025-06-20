const mongoose = require('mongoose');

const credentialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true }, // "admin" or "student"
  refresh_token: { type: String },
});

module.exports = mongoose.model('Credential', credentialSchema);
