import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

export default function GoalForm({ onSuccess }) {
  const token = useSelector(state => state.auth.token);
  const [form, setForm] = useState({
    type: '',
    target: '',
    unit: '',
    deadline: '',
    status: 'active'
  });
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await axios.post('/api/goal', form, { headers: { Authorization: `Bearer ${token}` } });
      setForm({ type: '', target: '', unit: '', deadline: '', status: 'active' });
      setError('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Error submitting goal');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Goal</h3>
      <label>Type: <input name="type" value={form.type} onChange={handleChange} required /></label>
      <label>Target: <input name="target" type="number" value={form.target} onChange={handleChange} required /></label>
      <label>Unit: <input name="unit" value={form.unit} onChange={handleChange} /></label>
      <label>Deadline: <input name="deadline" type="date" value={form.deadline} onChange={handleChange} /></label>
      <button type="submit">Add</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}
