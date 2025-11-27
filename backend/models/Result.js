const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  rollNo: { type: String, required: true },
  subjects: {
    math: Number,
    science: Number,
    english: Number,
    social: Number,
    hindi: Number,
    computer: Number
  },
  total: Number,
  percentage: Number,
  grade: String
});

module.exports = mongoose.model('Result', resultSchema);
