const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  course_type: String,
  modules: [String]
});

module.exports = mongoose.model("Course", courseSchema);
