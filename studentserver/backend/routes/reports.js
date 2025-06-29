// routes/reports.js
const express = require('express');
const router = express.Router();
const Report = require('../models/Report');

// GET /api/reports/:studentId - Fetch reports for a student
router.get('/:studentId', async (req, res) => {
  try {
    const reports = await Report.find({ student: req.params.studentId });
    res.json(reports);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;