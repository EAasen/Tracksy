import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

export default function AdminAnalytics() {
  const token = useSelector(state => state.auth.token);
  const [stats, setStats] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await axios.get('/api/admin/analytics', { headers: { Authorization: `Bearer ${token}` } });
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Error fetching analytics');
      }
    }
    fetchStats();
  }, [token]);

  return (
    <div>
      <h2>Admin Analytics</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <ul>
        <li>Total Users: {stats.totalUsers}</li>
        <li>Total Activities: {stats.totalActivities}</li>
        <li>Average Activity Duration: {stats.avgDuration} min</li>
        <li>Most Popular Activity: {stats.popularActivity}</li>
        <li>Active Goals: {stats.activeGoals}</li>
        <li>Water Intake (avg): {stats.avgWaterIntake} ml</li>
      </ul>
    </div>
  );
}
