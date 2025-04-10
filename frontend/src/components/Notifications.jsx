import React from 'react';
import 'tailwindcss/tailwind.css';

const Notifications = ({ notifications }) => {
  return (
    <div className="notifications container mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>
      <ul className="space-y-4">
        {notifications.map((notification, index) => (
          <li key={index} className="p-4 border border-gray-300 rounded">
            <p className="text-lg font-medium">{notification.title}</p>
            <p className="text-sm text-gray-600">{notification.message}</p>
            <p className="text-sm text-gray-600">{new Date(notification.date).toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
