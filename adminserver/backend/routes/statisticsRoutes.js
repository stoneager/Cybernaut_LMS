const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Report = require("../models/Report");

const quizTypes = ['Quiz', 'Coding', 'Assignment'];

router.get("/marks", async (req, res) => {
  try {
    const { batchId, module, type = 'Assignment' } = req.query;

    if (!batchId || !quizTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid or missing parameters" });
    }

    const typeIndex = quizTypes.indexOf(type);
    const students = await Student.find({ batch: batchId }).select("_id");
    const studentIds = students.map((s) => s._id);

    const matchStage = {
      student: { $in: studentIds },
      [`marksObtained.${typeIndex}`]: { $ne: -1 }
    };
    if (module) matchStage.module = module;

    const reports = await Report.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$day",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 10 },
      { $sort: { _id: 1 } }
    ]);

    const formatted = reports.map((r) => ({ day: r._id, count: r.count }));
    res.json(formatted);
  } catch (err) {
    console.error("Error in /statistics/marks:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
