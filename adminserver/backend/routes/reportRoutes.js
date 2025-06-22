const express = require('express');
const mongoose = require('mongoose');
const Report = require('../models/Report');
const Student = require('../models/Student');

const router = express.Router();

// ✅ Create a new report entry
router.post('/add', async (req, res) => {
  try {
    const { studentId, quizType, day, marksObtained } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const newReport = new Report({
      student: studentId,
      quizType,
      day,
      marksObtained
    });

    await newReport.save();
    res.status(201).json({ message: 'Report saved successfully', report: newReport });
  } catch (err) {
    console.error('Error saving report:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Fetch all reports
router.get('/all', async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('student', 'name')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/batch/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;

    const objectId = new mongoose.Types.ObjectId(batchId);

    const students = await Student.find({ batch: objectId }).select('_id');
    const studentIds = students.map(s => s._id);

    if (studentIds.length === 0) {
      return res.json([]);
    }

    const reports = await Report.find({ student: { $in: studentIds } })
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
