import React from 'react';
import 'tailwindcss/tailwind.css';

const HealthMetrics = ({ metrics = [] }) => {
  // Demo metrics if none are provided
  const demoMetrics = [
    { heartRate: 68, sleepDuration: 7.2, recovery: 85, date: '2025-05-22T08:00:00Z' },
    { heartRate: 70, sleepDuration: 6.8, recovery: 80, date: '2025-05-21T08:00:00Z' },
    { heartRate: 65, sleepDuration: 7.5, recovery: 88, date: '2025-05-20T08:00:00Z' }
  ];
  
  const displayMetrics = metrics.length > 0 ? metrics : demoMetrics;

  return (
    <div className="health-metrics container mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Health Metrics</h2>
      <ul className="space-y-4">
        {displayMetrics.map((metric, index) => (
          <li key={index} className="p-4 border border-gray-300 rounded">
            <p className="text-lg font-medium">Heart Rate: {metric.heartRate} bpm</p>
            <p className="text-sm text-gray-600">Sleep Duration: {metric.sleepDuration} hours</p>
            <p className="text-sm text-gray-600">Recovery: {metric.recovery}%</p>
            <p className="text-sm text-gray-600">Date: {new Date(metric.date).toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HealthMetrics;
