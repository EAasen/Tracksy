import React from 'react';
import 'tailwindcss/tailwind.css';

const UserProfile = ({ user }) => {
  return (
    <div className="user-profile container mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">User Profile</h2>
      <div className="p-4 border border-gray-300 rounded">
        <p className="text-lg font-medium" aria-label="Username">Username: {user.username}</p>
        <p className="text-sm text-gray-600" aria-label="Email">Email: {user.email}</p>
        <p className="text-sm text-gray-600" aria-label="Joined Date">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default UserProfile;
