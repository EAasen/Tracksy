/**
 * Performance utility functions for the Tracksy application
 * Helps with measuring and optimizing frontend performance
 */
import React, { useEffect } from 'react';

// Performance monitoring helper
export const measurePerformance = (metricName, callback) => {
  let startTime;
  
  return (...args) => {
    if (!startTime) {
      startTime = performance.now();
      const result = callback(...args);
      
      // Report performance metric
      const duration = performance.now() - startTime;
      console.log(`[Performance] ${metricName}: ${duration.toFixed(2)}ms`);
      
      // Reset for next measurement
      startTime = null;
      
      // If supported, also report to browser performance API
      if (window.performance && window.performance.mark) {
        window.performance.mark(`${metricName}-end`);
        window.performance.measure(metricName, `${metricName}-start`, `${metricName}-end`);
      }
      
      return result;
    }
    
    return callback(...args);
  };
};

// Start measuring performance for a specific operation
export const startMeasure = (metricName) => {
  if (window.performance && window.performance.mark) {
    window.performance.mark(`${metricName}-start`);
  }
  return performance.now();
};

// End measuring and get the duration
export const endMeasure = (metricName, startTime) => {
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  if (window.performance && window.performance.mark) {
    window.performance.mark(`${metricName}-end`);
    window.performance.measure(metricName, `${metricName}-start`, `${metricName}-end`);
  }
  
  console.log(`[Performance] ${metricName}: ${duration.toFixed(2)}ms`);
  return duration;
};

// Resource loading optimization
export const preloadResource = (url, type = 'fetch') => {
  if (!url) return;
  
  if (type === 'image' && typeof url === 'string') {
    const img = new Image();
    img.src = url;
  } 
  else if (type === 'fetch' && typeof url === 'string') {
    fetch(url, { method: 'HEAD' }).catch(() => {});
  }
};

// Component rendering performance decorator
export const withPerformanceTracking = (Component, componentName) => {
  return (props) => {
    const startTime = startMeasure(`render-${componentName}`);
    
    // Effect cleanup to measure complete render time including effects
    useEffect(() => {
      endMeasure(`render-${componentName}`, startTime);
      
      // Report to monitoring system if needed
      // reportMetricToAnalytics(`render-${componentName}`, duration);
    }, []);
    
    return <Component {...props} />;
  };
};

// Debounce function to limit high-frequency updates
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for operations like scroll or resize
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export default {
  measurePerformance,
  startMeasure,
  endMeasure,
  preloadResource,
  withPerformanceTracking,
  debounce,
  throttle
};
