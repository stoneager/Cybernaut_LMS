const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const Student = require('../models/Student');
const Report = require('../models/Report');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Verify = require('../middleware/auth');

router.get('/lecturer',Verify , async (req, res) => {
  try {
    const userId = req.user.id;

    // Get admin details
    const admin = await Admin.findOne({ user: userId }).populate('user');
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const user = admin.user;

    // Current month check
    const currentMonth = new Date().getMonth(); // 0 = Jan, so 5 = June, 6 = July...
    const isPaidThisMonth = admin.paidForMonth === currentMonth;
    const salaryStatus = isPaidThisMonth ? "Paid" : "Unpaid";

    // Batches handled
    const batches = await Batch.find({ "admins.admin": userId }).populate('course');
    const batchIds = batches.map(b => b._id);

    // Total students
    const studentCount = await Student.countDocuments({ batch: { $in: batchIds } });

    // Distinct courses
    const coursesHandled = new Set(batches.map(b => b.course?.courseName));

    // Reports
    const reports = await Report.find({}).populate({
      path: 'student',
      select: 'batch',
    });

    const studentReports = reports.filter(r =>
      r.student && r.student.batch && batchIds.map(id => id.toString()).includes(r.student.batch.toString())
    );


    res.json({
      stats: {
        name: user.name,
        email: user.email,
        courseCount: coursesHandled.size,
        batchCount: batches.length,
        totalStudents: studentCount,
        salaryAmount: admin.salary || 0,
        paidForMonth: admin.paidForMonth,
        currentMonth,
        salaryStatus
      },
      batches: batches.map(b => ({
        _id: b._id,
        batchName: b.batchName,
        courseName: b.course?.courseName || 'Unknown'
      }))
    });

  } catch (err) {
    console.error("Lecturer dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;