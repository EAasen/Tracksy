import React, { useState } from 'react';
import 'tailwindcss/tailwind.css';

const PasswordResetForm = ({ onReset, loading, error }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onReset(email);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold">Password Reset</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label className="block">Email:</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 border border-gray-300 rounded" />
      </div>
      <button type="submit" disabled={loading} className="w-full p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
        {loading ? 'Sending...' : 'Send Password Reset Email'}
      </button>
    </form>
  );
};

export default PasswordResetForm;
