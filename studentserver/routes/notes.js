const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
// GET notes for student's course_type and admin domain
router.get('/:course_type/:module', async (req, res) => {
  const notes = await Note.find({ course_type: req.params.course_type, module: req.params.module });
  res.json(notes);
});
module.exports = router;
