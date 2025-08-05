import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

export default function AdminActivityLogView() {
  const token = useSelector(state => state.auth.token);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAllLogs() {
      try {
        const res = await axios.get('/api/admin/activitylog', { headers: { Authorization: `Bearer ${token}` } });
        setLogs(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Error fetching logs');
      }
    }
    fetchAllLogs();
  }, [token]);

  return (
    <div>
      <h2>Admin: All Activity Logs</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Type</th>
            <th>Duration</th>
            <th>Distance</th>
            <th>Date</th>
            <th>Deleted</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log._id}>
              <td>{log.userId}</td>
              <td>{log.activityType}</td>
              <td>{log.duration}</td>
              <td>{log.distance}</td>
              <td>{new Date(log.date).toLocaleDateString()}</td>
              <td>{log.deleted ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
