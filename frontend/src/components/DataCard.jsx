import React, { memo } from 'react';
import PropTypes from 'prop-types';
import 'tailwindcss/tailwind.css';

// SVG icons defined outside component to prevent recreation on each render
const TrendUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
  </svg>
);

const TrendDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
);

// A reusable card component for displaying data visualizations and metrics
const DataCard = ({ title, children, fullWidth = false, className = "" }) => {
  return (
    <div className={`data-card ${fullWidth ? 'w-full' : 'w-full md:w-auto'} ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 h-full">
        {title && (
          <div className="mb-4 pb-2 border-b">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          </div>
        )}
        <div className="data-card-content">
          {children}
        </div>
      </div>
    </div>
  );
};

DataCard.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  fullWidth: PropTypes.bool,
  className: PropTypes.string
};

// A component for displaying metric stats with optional icons and trends
const MetricStat = ({ 
  label, 
  value, 
  unit = '', 
  trend = null, // 'up', 'down', or null
  trendValue = null,
  icon = null 
}) => {
  // Determine trend styling and icon based on trend direction
  let trendColor = '';
  let trendIcon = null;
  
  if (trend === 'up') {
    trendColor = 'text-green-500';
    trendIcon = <TrendUpIcon />;
  } else if (trend === 'down') {
    trendColor = 'text-red-500';
    trendIcon = <TrendDownIcon />;
  }
  
  return (
    <div className="metric-stat p-4">
      <div className="flex items-center mb-2">
        {icon && <span className="mr-2">{icon}</span>}
        <h4 className="text-sm font-medium text-gray-500">{label}</h4>
      </div>
      <div className="flex items-baseline">
        <p className="text-2xl font-semibold text-gray-800">{value}</p>
        {unit && <span className="ml-1 text-gray-600">{unit}</span>}
        {trend && trendValue && (
          <span className={`ml-2 ${trendColor} text-sm font-medium flex items-center`}>
            {trendIcon} {trendValue}
          </span>
        )}
      </div>
    </div>
  );
};

MetricStat.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  unit: PropTypes.string,
  trend: PropTypes.oneOf(['up', 'down', null]),
  trendValue: PropTypes.string,
  icon: PropTypes.node
};

// Memoize components to prevent unnecessary re-renders
const MemoizedDataCard = memo(DataCard);
const MemoizedMetricStat = memo(MetricStat);

// Export memoized versions
export { MemoizedDataCard as DataCard, MemoizedMetricStat as MetricStat };
