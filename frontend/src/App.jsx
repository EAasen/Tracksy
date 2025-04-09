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
    <div className="App">
      <NavigationMenu />
      <SearchBar />
      <h1>Welcome to Tracksy</h1>
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
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

export default App;
