import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ContributorsDashboard from './ContributorsDashboard';
import ProjectDashboard from './ProjectDashboard';
import WorkspaceDashboard from './WorkspaceDashboard';

const AdminDashboard = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [projects, setProjects] = useState({});
  const [commits, setCommits] = useState({});
  const [allCommits, setAllCommits] = useState({});
  const [contributions, setContributions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeView, setActiveView] = useState(null);
  const [dashboardView, setDashboardView] = useState('groups');
  const [projectView, setprojectView] = useState('projects');
   // New state for switching between views
  const navigate = useNavigate();
  

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    setSelectedProject(null);
    setActiveView(null);
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/admin/groups');
      if (!response.ok) throw new Error('Failed to fetch groups');
      const data = await response.json();
      setGroups(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load groups');
      setLoading(false);
    }
  };

  // Keep all your existing functions
  const fetchProjects = async (groupNumber, workspaceName, token) => {
    try {
      const response = await fetch(`http://localhost:4000/api/admin/workspace-projects/${workspaceName}`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects((prev) => ({ ...prev, [groupNumber]: data }));
      setSelectedProject(null);
      setActiveView(null);
    } catch (err) {
      setError(`Failed to load projects for group ${groupNumber}`);
    }
  };

  const fetchLastCommits = async (workspaceName, repoSlug) => {
    try {
      const response = await fetch(`http://localhost:4000/api/admin/commits/${workspaceName}/${repoSlug}`);
      if (!response.ok) throw new Error('Failed to fetch commits');
      const data = await response.json();
      setCommits((prev) => ({ ...prev, [`${workspaceName}/${repoSlug}`]: data }));
    } catch (err) {
      setError('Failed to load commits');
    }
  };

  const fetchAllCommits = async (workspaceName, repoSlug) => {
    try {
      const response = await fetch(`http://localhost:4000/api/admin/all-commits/${workspaceName}/${repoSlug}`);
      if (!response.ok) throw new Error('Failed to fetch all commits');
      const data = await response.json();
      setAllCommits((prev) => ({ ...prev, [`${workspaceName}/${repoSlug}`]: data }));
    } catch (err) {
      setError('Failed to load all commits');
    }
  };

  const fetchContributions = async (workspaceName, repoSlug) => {
    try {
      const response = await fetch(`http://localhost:4000/api/admin/contributions/${workspaceName}/${repoSlug}`);
      if (!response.ok) throw new Error('Failed to fetch contributions');
      const data = await response.json();
      setContributions((prev) => ({ ...prev, [`${workspaceName}/${repoSlug}`]: data }));
    } catch (err) {
      setError('Failed to load contributions');
    }
  };

  const handleGroupSelect = (groupNumber) => {
    setSelectedGroup(selectedGroup === groupNumber ? null : groupNumber);
    setSelectedProject(null);
    setActiveView(null);
  };

  const handleProjectSelect = (projectKey, action, workspaceName, repoSlug) => {
    setSelectedProject(projectKey);
    setActiveView(action);
    if (action === 'commits') {
      fetchLastCommits(workspaceName, repoSlug);
    } else if (action === 'allCommits') {
      fetchAllCommits(workspaceName, repoSlug);
    } else if (action === 'contributions') {
      fetchContributions(workspaceName, repoSlug);
    }
  };
  // New component to render all commits
  const AllCommitsView = ({ commits }) => {
    if (!commits) return null;

    return (
      <div className="mt-6 p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl">
        <h4 className="text-2xl font-bold mb-6 text-gray-800 border-b border-gray-200 pb-4">
          Repository Timeline
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Hash</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Message</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Author</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {commits.map((commit) => (
                <tr key={commit.hash} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                      {commit.hash.substring(0, 7)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-800 font-medium line-clamp-2">{commit.message}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {commit.author.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-gray-700">{commit.author}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-600">
                      <div className="font-medium">{new Date(commit.date).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500">{new Date(commit.date).toLocaleTimeString()}</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  const ContributionStats = ({ data, repoKey }) => {
    if (!data) return null;
  
    const statCards = [
      { title: "Total Commits", value: data.totalCommits, color: "from-blue-500 to-blue-600" },
      { title: "Today's Commits", value: data.todayCommits, color: "from-green-500 to-green-600" },
      { title: "Last Week", value: data.lastWeekCommits, color: "from-purple-500 to-purple-600" },
      { title: "Last Month", value: data.lastMonthCommits, color: "from-red-500 to-red-600" }
    ];
  
    return (
      <div className="mt-8 p-8 bg-white rounded-xl shadow-xl">
        <h3 className="text-2xl font-bold mb-8 text-gray-800">Repository Analytics</h3>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat, index) => (
            <div key={index} className="relative overflow-hidden rounded-lg">
              <div className={`p-6 bg-gradient-to-r ${stat.color} text-white transform transition-transform duration-300 hover:scale-105`}>
                <p className="text-sm font-medium opacity-80">{stat.title}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
  
        {/* Charts Section */}
        <div className="space-y-12">
          <div className="bg-gray-50 p-6 rounded-xl">
            <h4 className="text-xl font-semibold mb-6 text-gray-800">Contributions by Author</h4>
            <div className="h-80">
              <BarChart
                width={800}
                height={300}
                data={Object.entries(data.authorStats).map(([author, stats]) => ({
                  author: author.split('<')[0].trim(),
                  commits: stats.totalCommits,
                  percentage: parseFloat(stats.percentage),
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="author" />
                <YAxis yAxisId="left" orientation="left" stroke="#6366f1" />
                <YAxis yAxisId="right" orientation="right" stroke="#22c55e" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="commits" fill="#6366f1" name="Total Commits" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="percentage" fill="#22c55e" name="Percentage %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </div>
          </div>
  
          <div className="bg-gray-50 p-6 rounded-xl">
            <h4 className="text-xl font-semibold mb-6 text-gray-800">Commit Activity Timeline</h4>
            <div className="h-80">
              <LineChart
                width={800}
                height={300}
                data={data.timelineData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#6366f1" 
                  name="Total Commits"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                {Object.keys(data.authorStats).map((author, index) => (
                  <Line
                    key={author}
                    type="monotone"
                    dataKey={author}
                    stroke={`hsl(${index * 137.5}, 70%, 50%)`}
                    name={author.split('<')[0].trim()}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProjects = (group, projects) => (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4 text-gray-800">Projects</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Project Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.map((project) => {
              const projectKey = `${group.members[0].workspaceName}/${project.slug}`;
              return (
                <tr key={project.uuid} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">{project.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleProjectSelect(
                        projectKey,
                        'commits',
                        group.members[0].workspaceName,
                        project.slug
                      )}
                      className={`px-4 py-2 rounded text-white shadow transition-transform transform hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:ring-green-400 ${
                        selectedProject === projectKey && activeView === 'commits'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      View Last Commits
                    </button>
                    <button
                      onClick={() => handleProjectSelect(
                        projectKey,
                        'allCommits',
                        group.members[0].workspaceName,
                        project.slug
                      )}
                      className={`px-4 py-2 rounded text-white shadow transition-transform transform hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 ${
                        selectedProject === projectKey && activeView === 'allCommits'
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'bg-purple-500 hover:bg-purple-600'
                      }`}
                    >
                      View All Commits
                    </button>
                    <button
                      onClick={() => handleProjectSelect(
                        projectKey,
                        'contributions',
                        group.members[0].workspaceName,
                        project.slug
                      )}
                      className={`px-4 py-2 rounded text-white shadow transition-transform transform hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 ${
                        selectedProject === projectKey && activeView === 'contributions'
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                    >
                      View Contributions
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Render views based on activeView */}
      {selectedProject && activeView === 'commits' && commits[selectedProject] && (
        <div className="mt-4 p-6 bg-gray-100 rounded-lg shadow-lg transition-transform transform hover:scale-105">
          <h4 className="text-md font-medium mb-2 text-gray-700">Last Two Commits</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-md shadow-md">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {commits[selectedProject].map((commit) => (
                  <tr key={commit.hash} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-800">{commit.message}</td>
                    <td className="px-6 py-4 text-gray-800">{commit.author}</td>
                    <td className="px-6 py-4 text-gray-800">{new Date(commit.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedProject && activeView === 'allCommits' && allCommits[selectedProject] && (
        <AllCommitsView commits={allCommits[selectedProject]} />
      )}

      {selectedProject && activeView === 'contributions' && contributions[selectedProject] && (
        <ContributionStats
          data={contributions[selectedProject]}
          repoKey={selectedProject}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="relative flex justify-between items-center mb-12 bg-white/30 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 rounded-2xl"></div>
          <div className="absolute -top-2 -left-2 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
  
          {/* Dashboard Title */}
          <div className="relative">
            <h1 className="text-5xl font-black text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                Admin Dashboard
              </span>
            </h1>
            <div className="mt-2 text-sm font-medium text-gray-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
  
          {/* Navigation Buttons */}
          <div className="relative space-x-4 flex">
            <button
              onClick={() => setDashboardView('groups')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                dashboardView === 'groups'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white/80 text-blue-600 hover:bg-white hover:text-indigo-600 shadow-md'
              }`}
            >
              Groups View
            </button>
            <button
              onClick={() => setDashboardView('contributors')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                dashboardView === 'contributors'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white/80 text-blue-600 hover:bg-white hover:text-indigo-600 shadow-md'
              }`}
            >
              Peoples
            </button>
            <button
              onClick={() => setDashboardView('projects')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                dashboardView === 'projects'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white/80 text-blue-600 hover:bg-white hover:text-indigo-600 shadow-md'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setDashboardView('workspaces')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                dashboardView === 'workspaces'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white/80 text-blue-600 hover:bg-white hover:text-indigo-600 shadow-md'
              }`}
            >
              Workspaces
            </button>
          </div>
        </div>
  
        {/* Main Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading dashboard data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-xl shadow-lg">
            {error}
          </div>
        ) : (
          <>
            {dashboardView === 'contributors' ? (
              <ContributorsDashboard />
            ) : dashboardView === 'projects' ? (
              <ProjectDashboard />
            ) : dashboardView === 'workspaces' ? (
              <WorkspaceDashboard />
            ) : (
              <div className="space-y-8">
                {groups.map((group) => (
                  <div
                    key={group.groupNumber}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50 overflow-hidden"
                  >
                    <div
                      className="relative p-8 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-all duration-300"
                      onClick={() => handleGroupSelect(group.groupNumber)}
                    >
                      {/* Decorative Elements */}
                      <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500"></div>
                      <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full translate-x-16 translate-y-16 group-hover:scale-150 transition-transform duration-500"></div>
  
                      {/* Team Title */}
                      <h2 className="relative text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        Development Team {group.groupNumber}
                      </h2>
  
                      {/* Expand/Collapse Button */}
                      <div className="relative">
                        <div
                          className={`p-3 rounded-xl transition-all duration-300 ${
                            selectedGroup === group.groupNumber
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                              : 'bg-blue-50 group-hover:bg-blue-100'
                          }`}
                        >
                          {selectedGroup === group.groupNumber ? (
                            <ChevronUp
                              className={`w-6 h-6 ${
                                selectedGroup === group.groupNumber
                                  ? 'text-white'
                                  : 'text-blue-600'
                              }`}
                            />
                          ) : (
                            <ChevronDown
                              className={`w-6 h-6 ${
                                selectedGroup === group.groupNumber
                                  ? 'text-white'
                                  : 'text-blue-600'
                              }`}
                            />
                          )}
                        </div>
                      </div>
                    </div>
  
                    {/* Expanded Content */}
                    {selectedGroup === group.groupNumber && (
                      <div className="p-8 border-t border-gray-100 bg-white">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Team Members</h3>
                        <div className="overflow-hidden rounded-xl shadow-lg border border-gray-100">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr className="bg-gradient-to-r from-blue-600 to-indigo-600">
                                <th className="px-8 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                  Name
                                </th>
                                <th className="px-8 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                  Workspace
                                </th>
                                <th className="px-8 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                              {group.members.map((member, idx) => (
                                <tr
                                  key={idx}
                                  className="hover:bg-gray-50/80 transition-colors duration-200"
                                >
                                  <td className="px-8 py-5">
                                    <div className="flex items-center space-x-4">
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                                        {member.name.charAt(0)}
                                      </div>
                                      <span className="text-gray-800 font-medium">{member.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-8 py-5">
                                    <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-600">
                                      {member.workspaceName}
                                    </span>
                                  </td>
                                  <td className="px-8 py-5">
                                    <button
                                      onClick={() =>
                                        fetchProjects(
                                          group.groupNumber,
                                          member.workspaceName,
                                          member.token
                                        )
                                      }
                                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
                                    >
                                      View Projects
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {projects[group.groupNumber] &&
                          renderProjects(group, projects[group.groupNumber])}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default AdminDashboard;