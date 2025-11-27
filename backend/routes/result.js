const express = require('express');
const router = express.Router();
const Result = require('../models/Result');

// Add / Update result
router.put('/:rollNo', async (req, res) => {
  try {
    const { rollNo } = req.params;
    const subjects = req.body;

    // basic validation
    if (!rollNo) {
      return res.status(400).json({ success: false, message: 'Roll number is required' });
    }
    if (!subjects || Object.keys(subjects).length === 0) {
      return res.status(400).json({ success: false, message: 'No marks provided' });
    }

    const marksArray = Object.values(subjects).map(n => Number(n) || 0);
    const total = marksArray.reduce((a, b) => a + b, 0);
    const percentage = total / marksArray.length;

    let grade = 'Fail';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';

    const result = await Result.findOneAndUpdate(
      { rollNo },
      { rollNo, subjects, total, percentage, grade },
      { upsert: true, new: true }
    );

    return res.json({ success: true, result });
  } catch (err) {
    console.error('Error in PUT /results/:rollNo', err);
    return res.status(500).json({ success: false, message: 'Server error while saving marks' });
  }
});

// Get result for a roll number
router.get('/:rollNo', async (req, res) => {
  try {
    const { rollNo } = req.params;
    const result = await Result.findOne({ rollNo });

    if (!result) {
      return res.json({ success: true, result: null });
    }

    return res.json({ success: true, result });
  } catch (err) {
    console.error('Error in GET /results/:rollNo', err);
    return res.status(500).json({ success: false, message: 'Server error while fetching result' });
  }
});

module.exports = router;
