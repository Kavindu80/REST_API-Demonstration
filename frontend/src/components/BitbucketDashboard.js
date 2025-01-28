import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BitbucketDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Prioritize token and workspace from localStorage or location.state
  const [workspace, setWorkspace] = useState(
    location.state?.workspace || localStorage.getItem('bitbucketWorkspace') || ''
  );
  const [token, setToken] = useState(
    location.state?.token || localStorage.getItem('bitbucketToken') || ''
  );
  const [repositories, setRepositories] = useState([]);
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRepo, setSelectedRepo] = useState(null);

  // Redirect if workspace or token is missing
  useEffect(() => {
    if (!workspace || !token) {
      navigate('/'); // Redirect to login/home page
    } else {
      // Save workspace and token to localStorage
      localStorage.setItem('bitbucketWorkspace', workspace);
      localStorage.setItem('bitbucketToken', token);
    }
  }, [workspace, token, navigate]);

  // Fetch repositories
  const fetchRepositories = useCallback(async () => {
    if (!workspace) {
      setError('Workspace is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:4000/api/projects?workspace=${workspace}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch repositories');
      }

      const data = await response.json();
      setRepositories(data.repositories);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [workspace, token]);

  // Fetch commits for a repository
  const fetchCommits = useCallback(
    async (repoSlug) => {
      if (!workspace || !repoSlug) {
        setError('Workspace and repository slug are required');
        return;
      }

      setSelectedRepo(repoSlug);
      setLoading(true);
      setError(null);
      setCommits([]);

      try {
        const response = await fetch(
          `http://localhost:4000/api/commits?workspace=${workspace}&repoSlug=${repoSlug}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch commits');
        }

        const data = await response.json();
        setCommits(data.commits);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [workspace, token]
  );

  // Logout functionality
  const handleLogout = () => {
    localStorage.removeItem('bitbucketWorkspace');
    localStorage.removeItem('bitbucketToken');
    navigate('/');
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">

          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 flex justify-between items-center">
            <h1 className="text-2xl md:text-4xl font-extrabold text-white">
              Bitbucket Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300"
            >
              Logout
            </button>
          </div>

          <div className="p-6 md:p-8 bg-gray-50">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <input
                type="text"
                value={workspace}
                onChange={(e) => setWorkspace(e.target.value)}
                placeholder="Enter Bitbucket Workspace"
                className="flex-grow px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
              <button
                onClick={fetchRepositories}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  'Fetch Projects'
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                <p className="font-bold">Error:</p>
                <p>{error}</p>
              </div>
            )}
          </div>

          {repositories.length > 0 && (
            <div className="p-6 md:p-8">
              <div className="overflow-x-auto">
                <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Project Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Updated</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {repositories.map((repo) => (
                      <tr key={repo.slug} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{repo.name}</div>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <div className="text-sm text-gray-500">{repo.description || 'No description'}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(repo.updated_on).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => fetchCommits(repo.slug)}
                            className={`px-4 py-2 rounded-md transition duration-300 ${selectedRepo === repo.slug && loading
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-green-500 text-white hover:bg-green-600'
                              }`}
                            disabled={selectedRepo === repo.slug && loading}
                          >
                            {selectedRepo === repo.slug && loading ? 'Loading...' : 'View Commits'}
                          </button>

                          <button
                            onClick={() => navigate(`/workspace/${workspace}/repo/${repo.slug}/contributions`)}
                            className="ml-2 px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition duration-300"
                          >
                            View Contributions
                          </button>


                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {commits.length > 0 && (
            <div className="p-6 md:p-8">
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-5 sm:px-6 flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-semibold text-gray-900">
                    Commits for {selectedRepo}
                  </h3>
                  <span className="text-sm text-gray-500">
                    Total Commits: {commits.length}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Commit Hash</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Message</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Author</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {commits.map((commit) => (
                        <tr key={commit.hash} className="hover:bg-gray-50 transition duration-150">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {commit.hash.substring(0, 8)}
                          </td>
                          <td className="px-4 py-4 hidden md:table-cell text-sm text-gray-500">
                            {commit.message}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {commit.author}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {new Date(commit.date).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BitbucketDashboard;
