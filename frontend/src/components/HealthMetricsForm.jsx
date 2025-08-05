import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHealthMetrics } from '../store/slices/activitySlice';
import axios from 'axios';

export default function HealthMetricsForm({ onSuccess }) {
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);
  const [form, setForm] = useState({
    heartRate: '',
    sleepDuration: '',
    recovery: '',
    date: ''
  });
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await axios.post('/api/healthmetrics', form, { headers: { Authorization: `Bearer ${token}` } });
      dispatch(fetchHealthMetrics());
      setForm({ heartRate: '', sleepDuration: '', recovery: '', date: '' });
      setError('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Error submitting health metrics');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Health Metrics</h3>
      <label>Heart Rate:
        <input name="heartRate" type="number" value={form.heartRate} onChange={handleChange} required />
      </label>
      <label>Sleep Duration (hrs):
        <input name="sleepDuration" type="number" value={form.sleepDuration} onChange={handleChange} required />
      </label>
      <label>Recovery (%):
        <input name="recovery" type="number" value={form.recovery} onChange={handleChange} required />
      </label>
      <label>Date:
        <input name="date" type="date" value={form.date} onChange={handleChange} required />
      </label>
      <button type="submit">Add</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}
