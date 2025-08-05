import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

export default function WaterIntakeForm({ onSuccess }) {
  const token = useSelector(state => state.auth.token);
  const [form, setForm] = useState({
    amount: '',
    date: ''
  });
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await axios.post('/api/waterintake', form, { headers: { Authorization: `Bearer ${token}` } });
      setForm({ amount: '', date: '' });
      setError('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Error submitting water intake');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Water Intake</h3>
      <label>Amount (ml): <input name="amount" type="number" value={form.amount} onChange={handleChange} required /></label>
      <label>Date: <input name="date" type="date" value={form.date} onChange={handleChange} required /></label>
      <button type="submit">Add</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}
