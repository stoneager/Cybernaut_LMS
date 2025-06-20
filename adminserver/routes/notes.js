const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

// GET notes by batch and module
router.get('/:batch/:module', async (req, res) => {
  const { batch, module } = req.params;
  const notes = await Note.find({ batch, module });
  res.json(notes);
});

// POST new note
router.post('/', async (req, res) => {
  const { title, meetlink, quizlink, assignmentlink, batch, module, admin_username } = req.body;
  const note = new Note({ title, meetlink, quizlink, assignmentlink, batch, module, admin_username });
  await note.save();
  res.json({ message: 'Note added', note });
});

// PUT to edit note
router.put('/:id', async (req, res) => {
  const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!note) return res.status(404).json({ message: 'Note not found' });
  res.json(note);
});

module.exports = router;
