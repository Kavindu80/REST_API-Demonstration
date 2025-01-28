import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      console.log('Logging in with:', { username, password });

      const response = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (response.ok) {
        localStorage.setItem('bitbucketWorkspace', data.workspace);
        localStorage.setItem('bitbucketToken', data.token);

        console.log('Login successful, navigating to dashboard...');
        navigate('/dashboard');
      } else {
        console.error('Error from backend:', data.error);
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
          <h2 className="text-3xl font-bold text-white text-center">
            Bitbucket Dashboard
          </h2>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div>
            <label htmlFor="username" className="block text-gray-700 font-semibold mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center space-x-2"
          >
            <span>Login</span>
          </button>

          <div className="text-center text-sm text-gray-600 mt-4">
            <p>Don't have an account?</p>
            <button
              type="button"
              onClick={() => navigate('/studentsignup')}
              className="text-blue-600 hover:underline"
            >
              Sign up as Student
            </button>
          </div>

          <div className="text-center text-sm text-gray-600 mt-4">
            <p>Are you an Admin?</p>
            <button
              type="button"
              onClick={() => navigate('/adminlogin')}
              className="text-indigo-600 hover:underline font-semibold"
            >
              Login as Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
