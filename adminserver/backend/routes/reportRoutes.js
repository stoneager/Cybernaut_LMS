const express = require('express');
const mongoose = require('mongoose');
const Report = require('../models/Report');
const Student = require('../models/Student');
const Batch = require('../models/Batch');
const router = express.Router();
const Verify = require('../middleware/auth');
const quizTypes = ['Quiz', 'Coding', 'Assignment']; // fixed index map
const Admin = require('../models/Admin');
// ✅ Create or Update report entry
router.post('/add', async (req, res) => {
  try {
    const { studentId, quizType, day, marksObtained, module } = req.body;

    if (!module) return res.status(400).json({ message: 'Module is required' });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const index = quizTypes.indexOf(quizType);
    if (index === -1) return res.status(400).json({ message: 'Invalid quiz type' });

    let report = await Report.findOne({ student: studentId, day, module });

    if (!report) {
      const marksArray = [0, 0, 0];
      marksArray[index] = marksObtained;

      report = new Report({ student: studentId, day, module, marksObtained: marksArray });
    } else {
      report.marksObtained[index] = marksObtained;
    }

    await report.save();
    res.status(201).json({ message: 'Report saved successfully', report });
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



router.get('/batch/:batchId', Verify, async (req, res) => {
  try {
    const { batchId } = req.params;
    const adminUserId = req.user.id; // User ID from JWT

    const batch = await Batch.findById(batchId).lean(); // No need to populate anything

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Debug print all admin entries
    console.log("🔍 Batch Admins:");
    batch.admins.forEach((a, i) => {
      console.log(`Admin[${i}]: userId=${a.admin}, module=${a.module}`);
    });

    // Filter by admin's user ID directly
    const modulesHandled = batch.admins
      .filter(a => a.admin.toString() === adminUserId.toString())
      .map(a => a.module);

    console.log("✅ Modules handled by this admin:", modulesHandled);

    if (modulesHandled.length === 0) return res.json([]);

    const studentIds = await Student.find({ batch: batchId }).distinct('_id');
    if (studentIds.length === 0) return res.json([]);

    const reports = await Report.find({
      student: { $in: studentIds },
      module: { $in: modulesHandled }
    })
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name' }
      })
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    console.error('❌ Error fetching reports:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
