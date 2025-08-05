import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { fetchActivityLogs } from '../store/slices/activitySlice';

export default function FoodForm({ onSuccess }) {
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);
  const [form, setForm] = useState({
    name: '',
    brand: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    servingSize: '',
    date: ''
  });
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await axios.post('/api/food', form, { headers: { Authorization: `Bearer ${token}` } });
      setForm({ name: '', brand: '', calories: '', protein: '', carbs: '', fat: '', servingSize: '', date: '' });
      setError('');
      if (onSuccess) onSuccess();
      dispatch(fetchActivityLogs());
    } catch (err) {
      setError(err.response?.data?.error || 'Error submitting food');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Food Entry</h3>
      <label>Name: <input name="name" value={form.name} onChange={handleChange} required /></label>
      <label>Brand: <input name="brand" value={form.brand} onChange={handleChange} /></label>
      <label>Calories: <input name="calories" type="number" value={form.calories} onChange={handleChange} required /></label>
      <label>Protein: <input name="protein" type="number" value={form.protein} onChange={handleChange} /></label>
      <label>Carbs: <input name="carbs" type="number" value={form.carbs} onChange={handleChange} /></label>
      <label>Fat: <input name="fat" type="number" value={form.fat} onChange={handleChange} /></label>
      <label>Serving Size: <input name="servingSize" value={form.servingSize} onChange={handleChange} /></label>
      <label>Date: <input name="date" type="date" value={form.date} onChange={handleChange} required /></label>
      <button type="submit">Add</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}
