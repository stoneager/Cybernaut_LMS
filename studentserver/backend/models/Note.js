const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: String,
  meetlink: String,
  quizlink: String,
  assignmentlink: String, // optional: keep this if you're using external links
  assignmentFilePath: String, // ✅ new field for uploaded assignment PDF
  batch: String,
  module: String,
  admin_username: String
});

module.exports = mongoose.model('Note', noteSchema);
