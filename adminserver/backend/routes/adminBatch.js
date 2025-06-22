const express = require('express');
const router = express.Router();
const verifyAccessToken = require('../middleware/auth');
const Batch = require('../models/Batch');
const Course = require('../models/Course');

router.get('/my-batches',verifyAccessToken, async (req, res) => {
  try {
    const adminId = req.user.id;

    const batches = await Batch.find({ "admins.admin": adminId })
      .populate('course')
      .populate('admins.admin');

    res.json(batches);
  } catch (err) {
    console.error("Error fetching batches:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:batchId',verifyAccessToken, async (req, res) => {
  try {
    const { batchId } = req.params;

    const batch = await Batch.findById(batchId).populate('course');
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    res.json(batch);
  } catch (err) {
    console.error('Error fetching batch details:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
