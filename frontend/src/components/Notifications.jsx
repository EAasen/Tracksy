import React from 'react';
import 'tailwindcss/tailwind.css';

const Notifications = ({ notifications = [] }) => {
  // Demo notifications if none are provided
  const demoNotifications = [
    { 
      title: 'New Achievements',
      message: 'Congratulations! You completed 10 running activities this month.',
      date: '2025-05-22T10:30:00Z'
    },
    { 
      title: 'Weekly Summary',
      message: 'Your weekly activity summary is now available.',
      date: '2025-05-20T09:15:00Z'
    },
    { 
      title: 'Sleep Quality Alert',
      message: 'Your sleep quality has improved by 15% this week.',
      date: '2025-05-18T14:45:00Z'
    }
  ];
  
  const displayNotifications = notifications.length > 0 ? notifications : demoNotifications;

  return (
    <div className="notifications container mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>
      <ul className="space-y-4">
        {displayNotifications.map((notification, index) => (
          <li key={index} className="p-4 border border-gray-300 rounded">
            <p className="text-lg font-medium">{notification.title}</p>
            <p className="text-sm text-gray-600">{notification.message}</p>
            <p className="text-sm text-gray-600">{new Date(notification.date).toLocaleDateString()} at {new Date(notification.date).toLocaleTimeString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
