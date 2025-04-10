import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ActivityDataDisplay from './components/ActivityDataDisplay';
import HealthMetrics from './components/HealthMetrics';
import IntegrationManagement from './components/IntegrationManagement';
import UserProfile from './components/UserProfile';
import Notifications from './components/Notifications';
import NavigationMenu from './components/NavigationMenu';
import SearchBar from './components/SearchBar';
import Settings from './components/Settings';
import 'tailwindcss/tailwind.css';

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
    <div className="App container mx-auto p-4">
      <NavigationMenu />
      <SearchBar />
      <h1 className="text-2xl font-bold mb-4">Welcome to Tracksy</h1>
      {isLoggedIn ? (
        <>
          <p>Logged in as {userProfile?.username}</p>
          <ActivityDataDisplay />
          <HealthMetrics />
          <IntegrationManagement />
          <UserProfile />
          <Notifications />
          <Settings />
        </>
      ) : (
        <LoginForm onLogin={handleLogin} loading={loading} error={error} />
      )}
    </div>
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
