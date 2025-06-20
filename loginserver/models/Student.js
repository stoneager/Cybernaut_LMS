const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: String,
  username: { type: String, required: true, unique: true },
  pic: String,
  email: String,
  batch: String,
  certificate: String,
  course_type: String
});

module.exports = mongoose.model("Student", studentSchema);
