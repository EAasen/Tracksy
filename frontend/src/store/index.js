import { configureStore } from '@reduxjs/toolkit';
import { startMeasure, endMeasure } from '../utils/performance';
import authReducer from './slices/authSlice';
import activityReducer from './slices/activitySlice';
import healthReducer from './slices/healthSlice';
import uiReducer from './slices/uiSlice';

// Custom middleware to track Redux actions for performance monitoring
const performanceMiddleware = store => next => action => {
  const actionType = action.type;
  const startTime = startMeasure(`redux-action-${actionType}`);
  
  // Call the next dispatch method in the middleware chain
  const result = next(action);
  
  // Log performance metrics for this action
  endMeasure(`redux-action-${actionType}`, startTime);
  
  return result;
};

// Configure the Redux store
const store = configureStore({
  reducer: {
    auth: authReducer,
    activities: activityReducer,
    health: healthReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/loginSuccess'],
        // Ignore these field paths in all actions
        ignoredPaths: ['auth.user.lastLogin'],
      }
    }).concat(performanceMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Enable hot module replacement for reducers in development
if (process.env.NODE_ENV !== 'production' && module.hot) {
  module.hot.accept('./slices/authSlice', () => {
    store.replaceReducer(authReducer);
  });
  module.hot.accept('./slices/activitySlice', () => {
    store.replaceReducer(activityReducer);
  });
  module.hot.accept('./slices/healthSlice', () => {
    store.replaceReducer(healthReducer);
  });
  module.hot.accept('./slices/uiSlice', () => {
    store.replaceReducer(uiReducer);
  });
}

export default store;
