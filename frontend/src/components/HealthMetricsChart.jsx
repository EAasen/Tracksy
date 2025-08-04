import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Default chart options - defined outside component to prevent recreation
const heartRateOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 800, // Reduced for better performance
  },
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Heart Rate Over Time',
      font: {
        size: 16,
      },
    },
  },
  scales: {
    y: {
      title: {
        display: true,
        text: 'BPM',
      },
      beginAtZero: false,
    },
    x: {
      title: {
        display: true,
        text: 'Date',
      },
    }
  },
};

const sleepOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 800, // Reduced for better performance
  },
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Sleep Duration',
      font: {
        size: 16,
      },
    },
  },
  scales: {
    y: {
      title: {
        display: true,
        text: 'Hours',
      },
      beginAtZero: true,
      max: 12,
    },
    x: {
      title: {
        display: true,
        text: 'Date',
      },
    }
  },
};

const HealthMetricsChart = ({ metrics }) => {
  const renderStartTime = useRef(startMeasure('health-metrics-chart-render'));
  
  // Process health metrics data once when it changes - memoize the results
  const { heartRateData, sleepData } = useMemo(() => {
    if (!metrics || metrics.length === 0) {
      return { 
        heartRateData: { labels: [], datasets: [] }, 
        sleepData: { labels: [], datasets: [] } 
      };
    }
    
    const processStartTime = startMeasure('process-health-metrics');
    
    // Sort metrics by date
    const sortedMetrics = [...metrics].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Extract dates for labels
    const labels = sortedMetrics.map(metric => 
      new Date(metric.date).toLocaleDateString()
    );
    
    // Heart rate data
    const heartRateDataset = {
      label: 'Heart Rate (bpm)',
      data: sortedMetrics.map(metric => metric.heartRate),
      fill: false,
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      tension: 0.1,
      // Add point styling for better visibility at a glance
      pointRadius: 3,
      pointHoverRadius: 5,
    };
    
    // Sleep data
    const sleepDataset = {
      label: 'Sleep Duration (hours)',
      data: sortedMetrics.map(metric => metric.sleepDuration),
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
      // Add hover effect for better UX
      hoverBackgroundColor: 'rgba(53, 162, 235, 0.7)',
    };
    
    const result = {
      heartRateData: {
        labels,
        datasets: [heartRateDataset]
      },
      sleepData: {
        labels,
        datasets: [sleepDataset]
      }
    };
    
    endMeasure('process-health-metrics', processStartTime);
    return result;
  }, [metrics]);

  // Log render completion
  useEffect(() => {
    endMeasure('health-metrics-chart-render', renderStartTime.current);
    
    // Cleanup function
    return () => {
      // Could track component usage time here
      // endMeasure('health-chart-visible-time', someStartTimeRef);
    };
  }, []);

  if (!metrics || metrics.length === 0) {
    return (
      <div className="health-metrics-chart w-full border border-gray-300 rounded bg-gray-50">
        <p className="text-center text-gray-500 py-8">No health metrics available to display</p>
      </div>
    );
  }

  return (
    <div className="health-metrics-chart w-full">      
      <div className="mb-8 border border-gray-300 rounded p-4 bg-white">
        <h3 className="text-lg font-medium mb-2">Heart Rate</h3>
        <div style={{ height: '300px' }}>
          <Line data={heartRateData} options={heartRateOptions} />
        </div>
      </div>
      
      <div className="border border-gray-300 rounded p-4 bg-white">
        <h3 className="text-lg font-medium mb-2">Sleep Duration</h3>
        <div style={{ height: '300px' }}>
          <Bar data={sleepData} options={sleepOptions} />
        </div>
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(HealthMetricsChart);
