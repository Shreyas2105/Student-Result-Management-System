const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  rollNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  className: String,
  year: Number
});

module.exports = mongoose.model('Student', studentSchema);
