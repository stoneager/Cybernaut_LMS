const express = require('express');
const mongoose = require('mongoose');
const LessonPlan = require('../models/LessonPlan');

const router = express.Router();

router.get("/:batchId", async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const objectId = new mongoose.Types.ObjectId(batchId);
    
    const plans = await LessonPlan.find().sort({ day: -1 });
    
    res.json(plans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
