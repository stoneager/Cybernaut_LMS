const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  quizType: {
    type: String,
    enum: ['Quiz', 'Coding', 'Assignment'],
    required: true
  },
  day: {
    type: Number,
    required: true
  },
  marksObtained: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Report", reportSchema);
