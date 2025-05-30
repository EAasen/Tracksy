import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import 'tailwindcss/tailwind.css';
import { startMeasure, endMeasure, throttle } from '../utils/performance';
import { DataCard, MetricStat } from './DataCard';
import ErrorBoundary from './ErrorBoundary';

// Lazy load components to reduce initial load time
const ActivityChart = lazy(() => import('./ActivityChart'));
const HealthMetricsChart = lazy(() => import('./HealthMetricsChart'));

// Loading fallback for charts
const ChartLoadingPlaceholder = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-pulse flex space-x-4 w-full">
      <div className="flex-1 space-y-4 py-1">
        <div className="h-64 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  </div>
);

// Virtualized table component for improved performance with large datasets
const VirtualizedTable = ({ data, columns, rowHeight = 40, visibleRows = 10 }) => {
  const [startIndex, setStartIndex] = useState(0);
  const totalHeight = data.length * rowHeight;
  const containerHeight = visibleRows * rowHeight;
  
  // Throttled scroll handler to reduce scroll event frequency
  const handleScroll = throttle((e) => {
    const scrollTop = e.target.scrollTop;
    const newStartIndex = Math.floor(scrollTop / rowHeight);
    setStartIndex(newStartIndex);
  }, 50);
  
  const visibleData = data.slice(startIndex, startIndex + visibleRows + 3); // +3 for buffer
  
  return (
    <div 
      className="overflow-y-auto"
      style={{ height: `${containerHeight}px` }}
      onScroll={handleScroll}
    >
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        <table className="min-w-full">
          <thead>
            <tr>
              {columns.map(column => (
                <th key={column.key} className="py-2 px-4 text-left sticky top-0 bg-white z-10">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ position: 'absolute', top: `${startIndex * rowHeight}px`, width: '100%' }}>
            {visibleData.map((item, index) => (
              <tr 
                key={startIndex + index} 
                className={(startIndex + index) % 2 === 0 ? 'bg-gray-50' : ''}
                style={{ height: `${rowHeight}px` }}
              >
                {columns.map(column => (
                  <td key={column.key} className="py-2 px-4">
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Dashboard = ({ user }) => {
  // Track component render performance
  const startTime = React.useRef(startMeasure('dashboard-render'));

  const [activeTab, setActiveTab] = useState('summary');
  const [activityData, setActivityData] = useState([]);
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sample metrics for demonstration - in a real app, these would come from an API
  useEffect(() => {
    // Simulate API call
    const fetchUserData = async () => {
      const fetchStartTime = startMeasure('dashboard-data-fetch');
      
      try {
        setLoading(true);
        
        // Create some sample activity data (would normally fetch from API)
        const sampleActivities = [
          { type: 'Running', duration: 45, distance: 5.2, date: '2025-05-01T12:00:00Z' },
          { type: 'Running', duration: 50, distance: 6.1, date: '2025-05-03T12:00:00Z' },
          { type: 'Running', duration: 42, distance: 5.0, date: '2025-05-07T12:00:00Z' },
          { type: 'Running', duration: 55, distance: 7.3, date: '2025-05-10T12:00:00Z' },
          { type: 'Running', duration: 48, distance: 6.7, date: '2025-05-14T12:00:00Z' },
          { type: 'Running', duration: 60, distance: 8.2, date: '2025-05-18T12:00:00Z' },
          { type: 'Cycling', duration: 90, distance: 25.0, date: '2025-05-02T12:00:00Z' },
          { type: 'Cycling', duration: 75, distance: 18.5, date: '2025-05-06T12:00:00Z' },
          { type: 'Cycling', duration: 120, distance: 35.2, date: '2025-05-09T12:00:00Z' },
          { type: 'Cycling', duration: 60, distance: 15.0, date: '2025-05-13T12:00:00Z' },
          { type: 'Cycling', duration: 105, distance: 28.5, date: '2025-05-17T12:00:00Z' },
          { type: 'Swimming', duration: 30, distance: 1.0, date: '2025-05-04T12:00:00Z' },
          { type: 'Swimming', duration: 35, distance: 1.2, date: '2025-05-11T12:00:00Z' },
          { type: 'Swimming', duration: 40, distance: 1.5, date: '2025-05-19T12:00:00Z' },
        ];
        
        // Create some sample health metrics (would normally fetch from API)
        const sampleHealthMetrics = [
          { heartRate: 68, sleepDuration: 7.2, recovery: 85, date: '2025-05-01T08:00:00Z' },
          { heartRate: 70, sleepDuration: 6.8, recovery: 80, date: '2025-05-02T08:00:00Z' },
          { heartRate: 65, sleepDuration: 7.5, recovery: 88, date: '2025-05-03T08:00:00Z' },
          { heartRate: 72, sleepDuration: 6.5, recovery: 75, date: '2025-05-04T08:00:00Z' },
          { heartRate: 67, sleepDuration: 7.8, recovery: 90, date: '2025-05-05T08:00:00Z' },
          { heartRate: 69, sleepDuration: 7.0, recovery: 82, date: '2025-05-06T08:00:00Z' },
          { heartRate: 66, sleepDuration: 7.3, recovery: 87, date: '2025-05-07T08:00:00Z' },
          { heartRate: 71, sleepDuration: 6.7, recovery: 78, date: '2025-05-08T08:00:00Z' },
          { heartRate: 68, sleepDuration: 7.1, recovery: 84, date: '2025-05-09T08:00:00Z' },
          { heartRate: 64, sleepDuration: 8.0, recovery: 92, date: '2025-05-10T08:00:00Z' },
          { heartRate: 67, sleepDuration: 7.4, recovery: 86, date: '2025-05-11T08:00:00Z' },
          { heartRate: 70, sleepDuration: 7.2, recovery: 83, date: '2025-05-12T08:00:00Z' },
          { heartRate: 66, sleepDuration: 7.6, recovery: 89, date: '2025-05-13T08:00:00Z' },
          { heartRate: 69, sleepDuration: 7.0, recovery: 81, date: '2025-05-14T08:00:00Z' },
        ];
        
        setActivityData(sampleActivities);
        setHealthData(sampleHealthMetrics);
        setLoading(false);
        
        // Log performance metric
        endMeasure('dashboard-data-fetch', fetchStartTime);
      } catch (err) {
        setError('Failed to load user data');
        setLoading(false);
      }
    };
    
    fetchUserData();
    
    // Cleanup
    return () => {
      // Record time spent on dashboard for analytics
      endMeasure('dashboard-active-time', startTime.current);
    };
  }, []);

  // Memoize summary statistics calculations to avoid recalculating on every render
  const summaryStats = useMemo(() => {
    if (!activityData.length || !healthData.length) return null;
    
    const calcStartTime = startMeasure('summary-stats-calc');
    
    // Activity metrics
    const totalActivities = activityData.length;
    const totalDistance = activityData.reduce((sum, activity) => sum + activity.distance, 0).toFixed(1);
    const totalDuration = activityData.reduce((sum, activity) => sum + activity.duration, 0);
    const activityTypes = [...new Set(activityData.map(a => a.type))];
    
    // Health metrics
    const avgHeartRate = (healthData.reduce((sum, metric) => sum + metric.heartRate, 0) / healthData.length).toFixed(1);
    const avgSleep = (healthData.reduce((sum, metric) => sum + metric.sleepDuration, 0) / healthData.length).toFixed(1);
    const avgRecovery = (healthData.reduce((sum, metric) => sum + metric.recovery, 0) / healthData.length).toFixed(1);
    
    const result = {
      totalActivities,
      totalDistance,
      totalDuration,
      activityTypes,
      avgHeartRate,
      avgSleep,
      avgRecovery
    };
    
    endMeasure('summary-stats-calc', calcStartTime);
    return result;
  }, [activityData, healthData]);
  
  // Define table columns once to avoid recreating on each render
  const activityColumns = useMemo(() => [
    { key: 'type', label: 'Type' },
    { key: 'date', label: 'Date', render: (item) => new Date(item.date).toLocaleDateString() },
    { key: 'distance', label: 'Distance', render: (item) => `${item.distance} km` },
    { key: 'duration', label: 'Duration', render: (item) => `${item.duration} min` },
  ], []);
  
  const healthColumns = useMemo(() => [
    { key: 'date', label: 'Date', render: (item) => new Date(item.date).toLocaleDateString() },
    { key: 'heartRate', label: 'Heart Rate', render: (item) => `${item.heartRate} bpm` },
    { key: 'sleepDuration', label: 'Sleep Duration', render: (item) => `${item.sleepDuration} hours` },
    { key: 'recovery', label: 'Recovery', render: (item) => `${item.recovery}%` },
  ], []);

  // Memoize the sorted data arrays to avoid re-sorting on every render
  const sortedActivityData = useMemo(() => 
    [...activityData].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [activityData]
  );
  
  const sortedHealthData = useMemo(() => 
    [...healthData].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [healthData]
  );
  
  // Recent activities - limited subset
  const recentActivities = useMemo(() => 
    sortedActivityData.slice(0, 5),
    [sortedActivityData]
  );
  
  // Recent health data - for charts
  const recentHealthMetrics = useMemo(() => 
    healthData.slice(-7),
    [healthData]
  );
  
  // Log performance when component finishes initial render
  useEffect(() => {
    if (!loading) {
      endMeasure('dashboard-render', startTime.current);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="dashboard container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Your Health & Fitness Dashboard</h1>
      
      {/* Tab navigation */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button 
              className={`inline-block py-2 px-4 ${activeTab === 'summary' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('summary')}
            >
              Summary
            </button>
          </li>
          <li className="mr-2">
            <button 
              className={`inline-block py-2 px-4 ${activeTab === 'activities' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('activities')}
            >
              Activities
            </button>
          </li>
          <li className="mr-2">
            <button 
              className={`inline-block py-2 px-4 ${activeTab === 'health' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('health')}
            >
              Health
            </button>
          </li>
        </ul>
      </div>
      
      {/* Dashboard content */}
      <ErrorBoundary>
        <div className="dashboard-content">
          {activeTab === 'summary' && (
            <>
              {/* Summary metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <DataCard>
                  <MetricStat 
                    label="Activities" 
                    value={summaryStats?.totalActivities || 0} 
                    trend="up"
                    trendValue="+3 this week"
                  />
                </DataCard>
                
                <DataCard>
                  <MetricStat 
                    label="Total Distance" 
                    value={summaryStats?.totalDistance || 0} 
                    unit="km"
                    trend="up"
                    trendValue="+12.5 km"
                  />
                </DataCard>
                
                <DataCard>
                  <MetricStat 
                    label="Average Sleep" 
                    value={summaryStats?.avgSleep || 0}
                    unit="hrs" 
                    trend="down"
                    trendValue="-0.3 hrs"
                  />
                </DataCard>
                
                <DataCard>
                  <MetricStat 
                    label="Average Heart Rate" 
                    value={summaryStats?.avgHeartRate || 0}
                    unit="bpm"
                  />
                </DataCard>
              </div>
              
              {/* Charts preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <DataCard title="Activity Trends">
                  <div style={{ height: '300px' }}>
                    <Suspense fallback={<ChartLoadingPlaceholder />}>
                      <ActivityChart activities={activityData.slice(-7)} />
                    </Suspense>
                  </div>
                  <div className="mt-2 text-right">
                    <button 
                      className="text-blue-500 text-sm"
                      onClick={() => setActiveTab('activities')}
                    >
                      View all activities →
                    </button>
                  </div>
                </DataCard>
                
                <DataCard title="Health Trends">
                  <div style={{ height: '300px' }}>
                    <Suspense fallback={<ChartLoadingPlaceholder />}>
                      <HealthMetricsChart metrics={recentHealthMetrics} />
                    </Suspense>
                  </div>
                  <div className="mt-2 text-right">
                    <button 
                      className="text-blue-500 text-sm"
                      onClick={() => setActiveTab('health')}
                    >
                      View all health metrics →
                    </button>
                  </div>
                </DataCard>
              </div>
              
              {/* Recent Activities Preview */}
              <DataCard title="Recent Activities" fullWidth={true}>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        {activityColumns.map(column => (
                          <th key={column.key} className="py-2 px-4 text-left">
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivities.map((activity, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                          {activityColumns.map(column => (
                            <td key={column.key} className="py-2 px-4">
                              {column.render ? column.render(activity) : activity[column.key]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DataCard>
            </>
          )}
          
          {activeTab === 'activities' && (
            <>
              <DataCard title="Activity Distance Trends" fullWidth={true}>
                <div style={{ height: '400px' }}>
                  <Suspense fallback={<ChartLoadingPlaceholder />}>
                    <ActivityChart activities={activityData} />
                  </Suspense>
                </div>
              </DataCard>
              
              {/* Activity list with virtualization */}
              <div className="mt-8">
                <DataCard title="All Activities" fullWidth={true}>
                  <VirtualizedTable 
                    data={sortedActivityData}
                    columns={activityColumns}
                    rowHeight={48}
                    visibleRows={10}
                  />
                </DataCard>
              </div>
            </>
          )}
          
          {activeTab === 'health' && (
            <>
              <DataCard title="Health Metrics Trends" fullWidth={true}>
                <div style={{ height: '400px' }}>
                  <Suspense fallback={<ChartLoadingPlaceholder />}>
                    <HealthMetricsChart metrics={healthData} />
                  </Suspense>
                </div>
              </DataCard>
              
              {/* Health metrics list with virtualization */}
              <div className="mt-8">
                <DataCard title="All Health Metrics" fullWidth={true}>
                  <VirtualizedTable 
                    data={sortedHealthData}
                    columns={healthColumns}
                    rowHeight={48}
                    visibleRows={10}
                  />
                </DataCard>
              </div>
            </>
          )}
        </div>
      </ErrorBoundary>
    </div>
  );
};

// Export memoized version of the component to prevent unnecessary re-renders
export default React.memo(Dashboard);
