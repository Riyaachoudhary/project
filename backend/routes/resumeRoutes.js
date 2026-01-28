// routes/resumeRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');
const { analyzeResume } = require('../utils/analyze');

const router = express.Router();

// ensure uploads folder exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// multer storage to disk
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadsDir); },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + file.originalname.replace(/\s+/g,'_');
    cb(null, unique);
  }
});
const upload = multer({ storage });

// POST /api/resumes/upload
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Resume file required' });

    const jobDescription = req.body.jobDescription || '';
    const name = req.body.name || req.body.fullName || req.body.username || req.file.originalname;

    // run analysis
    const result = await analyzeResume(req.file.path, jobDescription);

    // save to DB
    const rec = new Resume({
      name,
      email: req.body.email || '',
      filename: req.file.filename,
      jobDescription,
      score: result.score,
      skillsFound: result.skillsFound,
      missingSkills: result.missingSkills,
      suggestions: result.suggestions
    });
    await rec.save();

    res.json({
      success: true,
      id: rec._id,
      score: result.score,
      skillsFound: result.skillsFound,
      missingSkills: result.missingSkills,
      suggestions: result.suggestions
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// GET list of saved resumes
router.get('/all', async (req, res) => {
  const items = await Resume.find().sort({ createdAt: -1 }).limit(100);
  res.json(items);
});

module.exports = router;
