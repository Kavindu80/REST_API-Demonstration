import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import BitbucketDashboard from './components/BitbucketDashboard';
import ContributionsDashboard from './components/ContributionsDashboard';
import StudentSignup from './components/students/StudentSignup';
import AdminLogin from './components/Admin/Adminlogin';
import AdminSignup from './components/Admin/AdminSignup';
import AdminDashboard from './components/AdminDashboard';
import ContributorsDashboard from './components/ContributorsDashboard';
import WorkspaceDashboard from './components/WorkspaceDashboard';


// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const workspace = localStorage.getItem('bitbucketWorkspace');
  const accessToken = localStorage.getItem('bitbucketToken');

  return workspace && accessToken ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <BitbucketDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace/:workspace/repo/:repoSlug/contributions"
        element={<ContributionsDashboard />}
      />

      <Route
        path="/adminsignup"
        element={<AdminSignup />}></Route>
       <Route
        path="/studentsignup"
        element={<StudentSignup />}
      />
      <Route
        path="/adminlogin"
        element={<AdminLogin />}>
      </Route>
      <Route
        path="/admin/dashboard"
        element={<AdminDashboard />}>
      </Route>
      <Route
        path="/workspaces"
        element={< WorkspaceDashboard />}/>
      <Route
        path="/contributors"
        element={<ContributorsDashboard />}/>
      <Route path="/workspace/:workspaceName" element={<BitbucketDashboard />} />
    </Routes>

  );
}

// Wrap App with BrowserRouter in index.js
export default App;