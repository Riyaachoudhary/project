import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [resumes, setResumes] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/resumes/resumes")
      .then(res => setResumes(res.data));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Uploaded Resumes</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-blue-100">
            <th>Name</th><th>Email</th><th>Score</th><th>Skills</th>
          </tr>
        </thead>
        <tbody>
          {resumes.map((r, i) => (
            <tr key={i} className="border-t">
              <td>{r.name}</td>
              <td>{r.email}</td>
              <td>{r.score}%</td>
              <td>{r.skills.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
