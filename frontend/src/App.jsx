// // import { useState } from 'react'
// // import reactLogo from './assets/react.svg'
// // import viteLogo from '/vite.svg'
// // import './App.css'

// // function App() {
// //   const [count, setCount] = useState(0)

// //   return (
// //     <>
// //       <div>
// //         <a href="https://vite.dev" target="_blank">
// //           <img src={viteLogo} className="logo" alt="Vite logo" />
// //         </a>
// //         <a href="https://react.dev" target="_blank">
// //           <img src={reactLogo} className="logo react" alt="React logo" />
// //         </a>
// //       </div>
// //       <h1>Vite + React</h1>
// //       <div className="card">
// //         <button onClick={() => setCount((count) => count + 1)}>
// //           count is {count}
// //         </button>
// //         <p>
// //           Edit <code>src/App.jsx</code> and save to test HMR
// //         </p>
// //       </div>
// //       <p className="read-the-docs">
// //         Click on the Vite and React logos to learn more
// //       </p>
// //     </>
// //   )
// // }

// // export default App

import { useState } from "react";
import axios from "axios";
import "./App.css";
import profilePic from "./assets/profile.jpg";
import bgImage from "./assets/bg.jpg";

export default function App() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // handle click on drag-drop label to open file dialog
  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  // drag & drop
  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };
  const onDragOver = (e) => e.preventDefault();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please upload a resume (PDF or TXT).");
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("resume", file);
      fd.append("jobDescription", jd);
      fd.append("name", "Student"); // optional fields
      fd.append("email", "");

      const res = await axios.post("http://localhost:5000/api/resumes/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Server error while analyzing. See console.");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!result) return;
    const text = `AI Resume Analyzer Report\n\nScore: ${result.score}\nSkills Found: ${result.skillsFound.join(', ')}\nMissing: ${result.missingSkills.join(', ')}\nSuggestions:\n- ${result.suggestions.join('\n- ')}\n\n`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'resume-report.txt'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="page" style={{ backgroundImage: `url(${bgImage})` }}>
      <header className="topbar">
        <img src={profilePic} className="top-profile" alt="profile" />
      </header>

      <main className="center">
        <h1 className="brand-title">AI Resume Analyzer</h1>

        <form className="card" onSubmit={handleSubmit}>
          <textarea
            placeholder="Paste Job Description here..."
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            rows={4}
            className="jd-input"
          />

          <label
            className={`drag ${file ? 'has-file' : ''}`}
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            <input type="file" onChange={onFileChange} accept=".pdf,.txt" />
            <div className="drag-text">
              {file ? <strong>{file.name}</strong> : "Drag & drop resume here"}
            </div>
          </label>

          <div className="actions">
            <button type="submit" className="analyze-btn" disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze Resume'}
            </button>
            <button type="button" className="download-btn" onClick={downloadReport} disabled={!result}>
              Download Report
            </button>
          </div>
        </form>

        {loading && <div className="spinner">Analyzing — please wait...</div>}

        {result && (
          <section className="results">
            <div className="result-card score">
              <h3>Match Score</h3>
              <div className="score-number">{result.score}%</div>
            </div>

            <div className="result-card">
              <h3>Skills Found</h3>
              <div className="badges">
                {result.skillsFound.length ? result.skillsFound.map((s,i)=>(<span key={i} className="badge found">{s}</span>)) : <em>None</em>}
              </div>
            </div>

            <div className="result-card">
              <h3>Missing Skills</h3>
              <div className="badges">
                {result.missingSkills.length ? result.missingSkills.map((s,i)=>(<span key={i} className="badge missing">{s}</span>)) : <em>None</em>}
              </div>
            </div>

            <div className="result-card">
              <h3>Suggestions</h3>
              <ul>
                {result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}
              </ul>
            </div>
          </section>
        )}
      </main>

      
    </div>
  );
}



