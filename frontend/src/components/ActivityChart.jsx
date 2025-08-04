import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { startMeasure, endMeasure } from '../utils/performance';
import 'tailwindcss/tailwind.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Default chart options - defined outside component to prevent recreation
const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 800, // Reduced animation duration for better performance
  },
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Activity Distance Over Time',
      font: {
        size: 16,
      },
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return `${context.dataset.label}: ${context.raw} km`;
        }
      }
    }
  },
  scales: {
    y: {
      title: {
        display: true,
        text: 'Distance (km)',
      },
      beginAtZero: true,
    },
    x: {
      title: {
        display: true,
        text: 'Date',
      },
    }
  },
};

// Utility function to generate colors - defined outside to prevent recreation
const generateChartColor = (index) => {
  const hue = (index * 137) % 360; // Golden angle approximation for good distribution
  return `hsla(${hue}, 70%, 60%, 0.8)`;
};

const ActivityChart = ({ activities }) => {
  const renderStartTime = useRef(startMeasure('activity-chart-render'));
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  // Process activities data for visualization - memoized to prevent recalculation
  const processedData = useMemo(() => {
    if (!activities || activities.length === 0) return {
      labels: [],
      datasets: []
    };
    
    const processStartTime = startMeasure('process-chart-data');
    
    // Group activities by type
    const activityTypes = [...new Set(activities.map(activity => activity.type))];
    
    // Sort activities by date
    const sortedActivities = [...activities].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Extract dates for labels
    const labels = sortedActivities.map(activity => 
      new Date(activity.date).toLocaleDateString()
    );
    
    // Create datasets for each activity type
    const datasets = activityTypes.map((type, index) => {
      const typeActivities = sortedActivities.filter(activity => activity.type === type);
      
      // Create a map for faster lookups instead of using find() in a loop
      const activityByDate = {};
      typeActivities.forEach(activity => {
        const dateKey = new Date(activity.date).toLocaleDateString();
        activityByDate[dateKey] = activity;
      });
      
      const data = labels.map(date => {
        const activity = activityByDate[date];
        return activity ? activity.distance : null;
      });
      
      return {
        label: type,
        data,
        fill: false,
        backgroundColor: generateChartColor(index),
        borderColor: generateChartColor(index),
        tension: 0.1,
      };
    });
    
    const result = {
      labels: [...new Set(labels)], // Unique dates
      datasets
    };
    
    endMeasure('process-chart-data', processStartTime);
    return result;
  }, [activities]);
  
  // Update chart data when processed data changes
  useEffect(() => {
    setChartData(processedData);
    
    // Log render time after initial data is processed
    endMeasure('activity-chart-render', renderStartTime.current);
  }, [processedData]);

  if (!activities || activities.length === 0) {
    return (
      <div className="activity-chart container mx-auto p-4 border border-gray-300 rounded bg-gray-50">
        <p className="text-center text-gray-500 py-8">No activity data available to display</p>
      </div>
    );
  }

  return (
    <div className="activity-chart w-full">
      <div className="bg-white">
        <Line 
          data={chartData} 
          options={defaultOptions} 
          // Use a dedicated height for better resize performance
          height={400}
        />
      </div>
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(ActivityChart);
