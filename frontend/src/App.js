import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [workspace, setWorkspace] = useState("");
  const [repoSlug, setRepoSlug] = useState("");
  const [commits, setCommits] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCommits = async () => {
    if (!workspace || !repoSlug) {
      setError("Please enter both Workspace and Repository Slug.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:4000/api/commits?workspace=${workspace}&repoSlug=${repoSlug}`
      );
      setCommits(response.data.commits);
    } catch (err) {
      setError("Failed to fetch commits. Please check the inputs or server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Bitbucket Dashboard</h1>
      </header>
      <div className="form">
        <input
          type="text"
          placeholder="Workspace"
          value={workspace}
          onChange={(e) => setWorkspace(e.target.value)}
        />
        <input
          type="text"
          placeholder="Repository Name"
          value={repoSlug}
          onChange={(e) => setRepoSlug(e.target.value)}
        />
        <button onClick={fetchCommits}>View Commits</button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <div className="commits">
        {commits.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Hash</th>
                <th>Message</th>
                <th>Author</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {commits.map((commit, index) => (
                <tr key={index}>
                  <td>{commit.hash}</td>
                  <td>{commit.message}</td>
                  <td>{commit.author}</td>
                  <td>{new Date(commit.date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {commits.length === 0 && !loading && <p>No commits to display.</p>}
      </div>
    </div>
  );
}

export default App;
