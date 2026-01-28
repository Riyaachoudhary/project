import { useState } from "react";
import axios from "axios";

export default function Upload() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("resume", file);

    const res = await axios.post("http://localhost:5000/api/resumes/upload", formData);
    setResult(res.data);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Upload Your Resume</h2>
      <form onSubmit={handleUpload} className="flex flex-col gap-3">
        <input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} />
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button className="bg-blue-600 text-white p-2 rounded">Upload</button>
      </form>

      {result && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h3>Score: {result.score}%</h3>
          <p>Matched Skills: {result.matchedSkills.join(", ")}</p>
        </div>
      )}
    </div>
  );
}
