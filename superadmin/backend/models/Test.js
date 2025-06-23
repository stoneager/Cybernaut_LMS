const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  batch: ref,
  quiz: [{ type: Number, max: 10 }],
  assignment: [{ type: Number, max: 10 }],
  code: [{ type: Number, max: 10 }],
  note : ref,
}, { timestamps: true });

module.exports = mongoose.model('Test', testSchema);
