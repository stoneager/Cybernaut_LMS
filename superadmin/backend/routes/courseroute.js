const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Batch = require('../models/Batch');
const Student = require('../models/Student');

router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();

    // For each course, calculate total students across its batches
    const coursesWithStudentCount = await Promise.all(
      courses.map(async (course) => {
        // Get batches for this course
        const batches = await Batch.find({ course: course._id }).select('_id');

        const batchIds = batches.map(b => b._id);

        // Count students in those batches
        const studentCount = await Student.countDocuments({ batch: { $in: batchIds } });

        return {
          ...course.toObject(),
          students: studentCount
        };
      })
    );

    res.json(coursesWithStudentCount);
  } catch (err) {
    console.error("Error retrieving courses:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get('/names', async (req, res) => {
  try {
    const courses = await Course.find({}, 'courseName'); // only fetch courseName field
    const courseNames = courses.map(course => course.courseName);
    res.json(courseNames);
  } catch (error) {
    console.error("Error fetching course names:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post('/', async (req, res) => {
  const { courseName, modules, image } = req.body;
  const course = new Course({ courseName, modules, image });
  await course.save();
  res.json(course);
});

module.exports = router;
