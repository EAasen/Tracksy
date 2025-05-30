import React from 'react';
import 'tailwindcss/tailwind.css';

const ActivityDataDisplay = ({ activities = [] }) => {
  // Demo activities if none are provided
  const demoActivities = [
    { type: 'Running', duration: 45, distance: 5.2, date: '2025-05-20T12:00:00Z' },
    { type: 'Cycling', duration: 90, distance: 25.0, date: '2025-05-18T12:00:00Z' },
    { type: 'Swimming', duration: 30, distance: 1.0, date: '2025-05-15T12:00:00Z' }
  ];
  
  const displayActivities = activities.length > 0 ? activities : demoActivities;

  return (
    <div className="activity-data-display container mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Activity Data</h2>
      <ul className="space-y-4">
        {displayActivities.map((activity, index) => (
          <li key={index} className="p-4 border border-gray-300 rounded">
            <p className="text-lg font-medium">{activity.type}</p>
            <p className="text-sm text-gray-600">Duration: {activity.duration} minutes</p>
            <p className="text-sm text-gray-600">Distance: {activity.distance} km</p>
            <p className="text-sm text-gray-600">Date: {new Date(activity.date).toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityDataDisplay;
