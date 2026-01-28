import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between">
      <h1 className="font-bold text-xl">AI Resume Analyzer</h1>
      <div>
        <Link className="mx-2" to="/">Upload</Link>
        <Link className="mx-2" to="/dashboard">Dashboard</Link>
      </div>
    </nav>
  );
}
