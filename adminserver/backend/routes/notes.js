const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

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

// ✅ POST new note
router.post('/', async (req, res) => {
  const { title, meetlink, quizlink, assignmentlink, assignmentFilePath, batch, module, admin, day } = req.body;

  try {
    const note = new Note({
      title,
      meetlink,
      quizlink,
      assignmentlink,
      assignmentFilePath,
      batch,
      module,
      admin,
      day
    });

    await note.save();
    res.json({ message: 'Note added', note });
  } catch (err) {
    res.status(400).json({ error: 'Failed to add note', details: err.message });
  }
});

// ✅ PUT to edit note
router.put('/:id', async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedNote) return res.status(404).json({ message: 'Note not found' });
    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update note', details: err.message });
  }
});

module.exports = router;
