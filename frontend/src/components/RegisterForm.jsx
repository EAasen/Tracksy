import React, { useState } from 'react';
import 'tailwindcss/tailwind.css';

const RegisterForm = ({ onRegister, loading, error }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister({ username, email, password, role });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold">Register</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label className="block">Username:</label>
        <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full p-2 border border-gray-300 rounded" />
      </div>
      <div>
        <label className="block">Email:</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 border border-gray-300 rounded" />
      </div>
      <div>
        <label className="block">Password:</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-2 border border-gray-300 rounded" />
      </div>
      <div>
        <label className="block">Role:</label>
        <select value={role} onChange={e => setRole(e.target.value)} className="w-full p-2 border border-gray-300 rounded">
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button type="submit" disabled={loading} className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600">
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};

export default RegisterForm;
