const express = require('express');
const router = express.Router();
const Verify = require('../middleware/auth');

const Admin = require('../models/Admin');
const Batch = require('../models/Batch');
const Student = require('../models/Student');
const User = require('../models/User');

// GET /api/students/my-students
router.get('/my-students', Verify, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get batches this admin (by user ID) is handling
    const batchDocs = await Batch.find({ "admins.admin": userId }).select('_id batchName');

    const batchIds = batchDocs.map(b => b._id);

    // 2. Build query based on optional filters
    const query = { batch: { $in: batchIds } };

    // Optional filter by batch ID
    if (req.query.batchId) {
      query.batch = req.query.batchId;
    }

    // 3. Find all matching students
    const students = await Student.find(query)
      .populate('user', 'name email')
      .populate('batch', 'batchName') // for displaying batch name
      .sort({ createdAt: -1 });

    // 4. Optional name search
    let filteredStudents = students;
    if (req.query.name) {
      const keyword = req.query.name.toLowerCase();
      filteredStudents = students.filter(s =>
        s.user.name.toLowerCase().includes(keyword)
      );
    }

    // ✅ Return batchOptions with _id and batchName
    const batchOptions = batchDocs.map(b => ({
      _id: b._id,
      batchName: b.batchName
    }));

    res.json({
      students: filteredStudents.map(s => ({
        _id: s._id,
        name: s.user.name,
        email: s.user.email,
        batchName: s.batch?.batchName || "Unknown",
        phone: s.phone,
        dob: s.dob,
        address: s.address
      })),
      batchOptions
    });

  } catch (err) {
    console.error("Lecturer students fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
