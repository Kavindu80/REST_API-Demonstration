import React, { useState, useEffect } from 'react';
import { Users, Search, Code, GitBranch, Clock } from 'lucide-react';

const ContributorsDashboard = () => {
  const [contributors, setContributors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContributors();
  }, []);

  const fetchContributors = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/admin/all-contributors');
      if (!response.ok) throw new Error('Failed to fetch contributors');
      const data = await response.json();
      setContributors(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load contributors data');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Group and sort commits by contributor and project
  const groupedContributors = contributors.reduce((acc, contributor) => {
    const name = contributor.author.split('<')[0].trim();
    if (!acc[name]) {
      acc[name] = {
        name,
        avatar: name[0].toUpperCase(),
        projects: {}
      };
    }
    
    contributor.commits.forEach(commit => {
      if (!acc[name].projects[commit.projectName]) {
        acc[name].projects[commit.projectName] = [];
      }
      acc[name].projects[commit.projectName].push(commit);
    });
    
    // Sort commits by date for each project
    Object.values(acc[name].projects).forEach(commits => {
      commits.sort((a, b) => new Date(b.date) - new Date(a.date));
    });
    
    return acc;
  }, {});

  const filteredContributors = Object.values(groupedContributors)
    .filter(contributor => contributor.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(contributor => ({
      ...contributor,
      // Sort projects by most recent commit
      projects: Object.fromEntries(
        Object.entries(contributor.projects)
          .sort(([, aCommits], [, bCommits]) => 
            new Date(bCommits[0].date) - new Date(aCommits[0].date)
          )
      )
    }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading contributors data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-xl shadow-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Centered Stats Section */}
        <div className="relative text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-10 rounded-3xl"></div>
          <div className="relative p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-center items-center">
              <div className="bg-white rounded-2xl shadow-xl p-6 flex items-center space-x-4 transform hover:scale-105 transition-transform duration-300">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500 font-medium">Total Contributors</p>
                  <p className="text-3xl font-bold text-gray-900">{Object.keys(groupedContributors).length}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl p-6 flex items-center space-x-4 transform hover:scale-105 transition-transform duration-300">
                <div className="bg-indigo-100 p-3 rounded-xl">
                  <Code className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500 font-medium">Total Commits</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {contributors.reduce((sum, c) => sum + c.commits.length, 0)}
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl p-6 flex items-center space-x-4 transform hover:scale-105 transition-transform duration-300">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <GitBranch className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500 font-medium">Active Projects</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {new Set(contributors.flatMap(c => c.commits.map(commit => commit.projectName))).size}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-4 border border-gray-200 rounded-xl bg-white shadow-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-300"
            placeholder="Search contributors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
  
        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Contributor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Project</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Recent Three Commits</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Latest Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredContributors.flatMap((contributor) => 
                  Object.entries(contributor.projects).map(([projectName, commits], projectIndex) => (
                    <tr 
                      key={`${contributor.name}-${projectName}`} 
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      {projectIndex === 0 ? (
                        <td className="px-6 py-4" rowSpan={Object.keys(contributor.projects).length}>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold">{contributor.avatar}</span>
                            </div>
                            <div className="font-medium text-gray-900">{contributor.name}</div>
                          </div>
                        </td>
                      ) : null}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <span className="px-4 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-sm font-medium shadow-sm">
                            {projectName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-3">
                          {commits.slice(0, 3).map((commit, index) => (
                            <div 
                              key={commit.hash}
                              className={`p-2 rounded-lg ${
                                index === 0 
                                  ? 'bg-blue-50 border-l-4 border-blue-500'
                                  : index === 1
                                    ? 'bg-indigo-50 border-l-4 border-indigo-500'
                                    : 'bg-purple-50 border-l-4 border-purple-500'
                              }`}
                            >
                              <p className="text-sm font-medium text-gray-900">{commit.message}</p>
                              <div className="flex items-center mt-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatDate(commit.date)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {formatDate(commits[0].date)}
                          </div>
                          <div className="text-gray-500 mt-1">
                            Latest commit
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributorsDashboard;