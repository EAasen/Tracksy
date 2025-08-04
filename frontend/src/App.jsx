import React, { useState, useEffect, lazy, Suspense } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import NavigationMenu from './components/NavigationMenu';
import SearchBar from './components/SearchBar';
import PrefetchManager from './components/PrefetchManager';
import ErrorBoundary from './components/ErrorBoundary';
import 'tailwindcss/tailwind.css';

// Lazy loaded components
const Dashboard = lazy(() => import('./components/Dashboard'));
const IntegrationManagement = lazy(() => import('./components/IntegrationManagement'));
const UserProfile = lazy(() => import('./components/UserProfile'));
const Notifications = lazy(() => import('./components/Notifications'));
const Settings = lazy(() => import('./components/Settings'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-48">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    <p className="ml-3 font-semibold text-gray-700">Loading...</p>
  </div>
);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (username, password) => {
    setLoading(true);
    try {
      const response = await axios.post('/login', { username, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      setIsLoggedIn(true);
      fetchUserProfile();
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserProfile(response.data);
    } catch (err) {
      setError('Failed to fetch user profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchUserProfile();
    }
  }, []);
  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <NavigationMenu />
        {/* Add PrefetchManager component to handle component prefetching */}
        {isLoggedIn && <PrefetchManager />}
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Tracksy</h1>
            {isLoggedIn && (
              <div className="flex items-center">
                <SearchBar />
                <div className="ml-4 text-sm font-medium text-gray-600">
                  Welcome, {userProfile?.username || 'User'}
                </div>
              </div>
            )}
          </div>

          {/* Main Navigation */}
          {isLoggedIn && (
            <div className="mb-6">
              <nav className="flex space-x-4">
                <Link 
                  to="/dashboard" 
                  className={`px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 
                    ${window.location.pathname === '/dashboard' ? 'bg-blue-500 text-white' : ''}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/integrations" 
                  className={`px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200
                    ${window.location.pathname === '/integrations' ? 'bg-blue-500 text-white' : ''}`}
                >
                  Integrations
                </Link>
                <Link 
                  to="/profile" 
                  className={`px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200
                    ${window.location.pathname === '/profile' ? 'bg-blue-500 text-white' : ''}`}
                >
                  Profile
                </Link>
                <Link 
                  to="/notifications" 
                  className={`px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200
                    ${window.location.pathname === '/notifications' ? 'bg-blue-500 text-white' : ''}`}
                >
                  Notifications
                </Link>
                <Link 
                  to="/settings" 
                  className={`px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200
                    ${window.location.pathname === '/settings' ? 'bg-blue-500 text-white' : ''}`}
                >
                  Settings
                </Link>
              </nav>
            </div>
          )}

          {/* Main Content */}
          <div className="main-content bg-white rounded-lg shadow-sm p-6">            {isLoggedIn ? (
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard user={userProfile} />} />
                    <Route path="/integrations" element={<IntegrationManagement />} />
                    <Route path="/profile" element={<UserProfile user={userProfile || {}} />} />
                    <Route path="/notifications" element={<Notifications notifications={[]} />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            ) : (
              <LoginForm onLogin={handleLogin} loading={loading} error={error} />
            )}
          </div>
        </div>
      </div>
    </Router>
  );
}

function LoginForm({ onLogin, loading, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold">Login</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label className="block">Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded"
          aria-label="Username"
        />
      </div>
      <div>
        <label className="block">Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded"
          aria-label="Password"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

export default App;
