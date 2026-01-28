// models/Resume.js
const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  filename: { type: String },
  jobDescription: { type: String },
  score: { type: Number },
  skillsFound: [String],
  missingSkills: [String],
  suggestions: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resume', ResumeSchema);
