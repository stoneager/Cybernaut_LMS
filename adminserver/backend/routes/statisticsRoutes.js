const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Report = require("../models/Report");

router.get("/assignments", async (req, res) => {
  try {
    const { batchId, module } = req.query;

    if (!batchId) {
      return res.status(400).json({ error: "batchId is required" });
    }

    const students = await Student.find({ batch: batchId }).select("_id");
    const studentIds = students.map((s) => s._id);

    const matchStage = {
      student: { $in: studentIds },
      "marksObtained.2": { $ne: -1 }
    };
    if (module) matchStage.moduleName = module;

    const reports = await Report.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$day",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }, // sort descending
      { $limit: 10 },
      { $sort: { _id: 1 } } // re-sort ascending for chart display
    ]);

    const formatted = reports.map((r) => ({ day: r._id, count: r.count }));
    res.json(formatted);
  } catch (err) {
    console.error("Error in /statistics/assignments:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
