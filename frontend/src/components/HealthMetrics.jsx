import React from 'react';
import 'tailwindcss/tailwind.css';

const HealthMetrics = ({ metrics }) => {
  return (
    <div className="health-metrics container mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Health Metrics</h2>
      <ul className="space-y-4">
        {metrics.map((metric, index) => (
          <li key={index} className="p-4 border border-gray-300 rounded">
            <p className="text-lg font-medium">Heart Rate: {metric.heartRate} bpm</p>
            <p className="text-sm text-gray-600">Sleep Duration: {metric.sleepDuration} hours</p>
            <p className="text-sm text-gray-600">Recovery: {metric.recovery}</p>
            <p className="text-sm text-gray-600">Date: {new Date(metric.date).toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HealthMetrics;
