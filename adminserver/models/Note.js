const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: String,
  meetlink: String,
  quizlink: String,
  assignmentlink: String,
  batch: String,           // ✅ Corrected field
  module: String,          // domain (e.g. C, Java)
  admin_username: String
});

module.exports = mongoose.model('Note', noteSchema);
