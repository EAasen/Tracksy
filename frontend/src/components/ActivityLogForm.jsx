import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivityLogs } from '../store/slices/activitySlice';
import axios from 'axios';

export default function ActivityLogForm({ onSuccess }) {
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);
  const [form, setForm] = useState({
    activityType: '',
    duration: '',
    distance: '',
    date: ''
  });
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await axios.post('/api/activitylog', form, { headers: { Authorization: `Bearer ${token}` } });
      dispatch(fetchActivityLogs());
      setForm({ activityType: '', duration: '', distance: '', date: '' });
      setError('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Error submitting activity log');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Activity Log</h3>
      <label>Type:
        <select name="activityType" value={form.activityType} onChange={handleChange} required>
          <option value="">Select</option>
          <option value="run">Run</option>
          <option value="walk">Walk</option>
          <option value="cycle">Cycle</option>
          <option value="swim">Swim</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label>Duration (min):
        <input name="duration" type="number" value={form.duration} onChange={handleChange} required />
      </label>
      <label>Distance (km):
        <input name="distance" type="number" value={form.distance} onChange={handleChange} required />
      </label>
      <label>Date:
        <input name="date" type="date" value={form.date} onChange={handleChange} required />
      </label>
      <button type="submit">Add</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}
