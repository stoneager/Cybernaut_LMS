const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: String,
  username: { type: String, required: true, unique: true },
  salary: Number,
  batches: [String],
  domain: String
});

module.exports = mongoose.model("Admin", adminSchema);
