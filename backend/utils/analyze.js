// utils/analyze.js
const fs = require('fs');
const pdf = require('pdf-parse');
const natural = require('natural');

const tokenizer = new natural.WordTokenizer();
// small helper to fuzzy-match skill tokens (so React.js, ReactJS match "react")
function textIncludesSkill(textTokens, skill) {
  const skillTokens = skill.toLowerCase().split(/\s+/);
  // exact multi-word match
  const joined = textTokens.join(' ');
  if (joined.includes(skill.toLowerCase())) return true;
  // fuzzy: check each token using Jaro-Winkler
  for (let sk of skillTokens) {
    for (let w of textTokens) {
      if (natural.JaroWinklerDistance(w, sk) > 0.9) return true;
    }
  }
  return false;
}

async function extractTextFromPdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text || '';
}

async function analyzeResume(filePath, jobDescription) {
  // Extract text (pdf). If the uploaded file isn't PDF, try reading as text fallback.
  let resumeText = '';
  try {
    resumeText = (await extractTextFromPdf(filePath)).toLowerCase();
  } catch (err) {
    // fallback - read raw
    try { resumeText = fs.readFileSync(filePath, 'utf8').toLowerCase(); } catch(e) { resumeText = ''; }
  }

  // Tokenize resume words
  const resumeTokens = tokenizer.tokenize(resumeText).map(t => t.toLowerCase());

  // Build list of skills to check from jobDescription: split by commas or common separators
  const rawSkills = jobDescription
    .split(/,|\/|;|\band\b|\bwith\b/i)
    .map(s => s.trim())
    .filter(Boolean);

  // If jobDescription is short or not comma-separated, also try keywords by splitting spaces (last resort)
  let jdSkills = rawSkills.length > 0 ? rawSkills : jobDescription.split(/\s+/).slice(0, 30);

  // Normalize skills: remove extra words
  jdSkills = jdSkills.map(s => s.replace(/[^\w\s\-+.]/g, '').trim()).filter(Boolean);

  // Match skills
  const found = [];
  const missing = [];
  for (const skill of jdSkills) {
    const ok = textIncludesSkill(resumeTokens, skill.toLowerCase());
    if (ok) found.push(skill);
    else missing.push(skill);
  }

  // Score: based on matches (if no jdSkills provided, fallback to keyword density)
  let score = 0;
  if (jdSkills.length > 0) {
    score = Math.round((found.length / jdSkills.length) * 100);
  } else {
    // fallback simple heuristic
    score = Math.min(95, Math.round((resumeTokens.length / 200) * 50 + 50));
  }

  // Suggestions: simple templates, could be expanded
  const suggestions = [];
  if (missing.length > 0) {
    suggestions.push(`Add or highlight these skills: ${missing.slice(0,8).join(', ')}`);
  }
  suggestions.push('Add measurable achievements (e.g., “Reduced load time by 30%”).');
  suggestions.push('Include technologies and tools under a separate Skills section.');
  suggestions.push('Keep consistent formatting and clear section headings.');

  return {
    score,
    skillsFound: found.map(s => s.trim()),
    missingSkills: missing.map(s => s.trim()),
    suggestions
  };
}

module.exports = { analyzeResume };
