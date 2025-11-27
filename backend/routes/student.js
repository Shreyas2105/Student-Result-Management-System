const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// Add student
router.post('/', async (req, res) => {
  try {
    const { rollNo, name, className, year } = req.body;

    if (!rollNo || !name) {
      return res.status(400).json({ success: false, message: 'Roll number and name are required' });
    }

    const existing = await Student.findOne({ rollNo });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Student with this roll number already exists' });
    }

    const student = await Student.create({ rollNo, name, className, year });
    return res.json({ success: true, student });
  } catch (err) {
    console.error('Error in POST /students:', err);
    return res.status(500).json({ success: false, message: 'Server error while adding student' });
  }
});

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ rollNo: 1 });
    return res.json({ success: true, students });
  } catch (err) {
    console.error('Error in GET /students:', err);
    return res.status(500).json({ success: false, message: 'Server error while fetching students' });
  }
});

router.delete('/:rollNo', async (req, res) => {
  try {
    const { rollNo } = req.params;

    const deleted = await Student.findOneAndDelete({ rollNo });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.json({ success: true, message: "Student deleted" });

  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.patch('/:rollNo', async (req, res) => {
  try {
    const { rollNo } = req.params;
    const updates = req.body;

    const updated = await Student.findOneAndUpdate(
      { rollNo },
      updates,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.json({ success: true, updated });

  } catch (err) {
    console.error("Edit error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;
