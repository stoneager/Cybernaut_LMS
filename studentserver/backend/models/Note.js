const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  meetlink: String,
  quizlink: String,
  assignmentlink: String,
  assignmentFilePath: String,
  batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
  module: { type: String, required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  day: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
