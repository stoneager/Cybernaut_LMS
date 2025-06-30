const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const Student = require('../models/Student');
const Report = require('../models/Report');

// ✅ GET notes by batch and module
router.get('/:batchId/:module', async (req, res) => {
  const { batchId, module } = req.params;

  try {
    const notes = await Note.find({ batch: batchId, module }).populate('admin', 'name email');
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notes', details: err.message });
  }
});

// ✅ POST new note AND create default reports
router.post('/', async (req, res) => {
  const {
    title,
    meetlink,
    quizlink,
    assignmentlink,
    assignmentS3Url,
    batch,
    module,
    admin,
    day
  } = req.body;

  try {
    const note = new Note({
      title,
      meetlink,
      quizlink,
      assignmentlink,
      assignmentS3Url,
      batch,
      module,
      admin,
      day
    });

    await note.save();

    const students = await Student.find({ batch });

    const reports = students.map(student => ({
      student: student._id,
      module,
      day,
      marksObtained: [-2, -2, -2]
    }));

    await Report.insertMany(reports);

    res.json({ message: 'Note added and reports initialized', note });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        error: `Day ${day} already exists for this batch.`,
        details: err.message
      });
    }

    res.status(400).json({
      error: 'Failed to add note or create reports',
      details: err.message
    });
  }
});


// ✅ PUT to edit note
router.put('/:id', async (req, res) => {
  const {
    title,
    meetlink,
    quizlink,
    assignmentlink,
    assignmentS3Url,
    batch,
    module,
    admin,
    day
  } = req.body;

  try {
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      {
        title,
        meetlink,
        quizlink,
        assignmentlink,
        assignmentS3Url,
        batch,
        module,
        admin,
        day
      },
      { new: true }
    );

    if (!updatedNote) return res.status(404).json({ message: 'Note not found' });
    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update note', details: err.message });
  }
});

module.exports = router;