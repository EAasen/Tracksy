import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import axios from 'axios';

// Initial state
const initialState = {
  activities: [],
  filteredActivities: [],
  activeFilters: {
    type: null,
    dateRange: null
  },
  loading: false,
  error: null,
  stats: null,
};

// Sample data for development (will be replaced with API calls in production)
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

// Async thunks
export const fetchActivities = createAsyncThunk(
  'activities/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      // For development, use sample data
      if (process.env.NODE_ENV === 'development') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return sampleActivities;
      }

      // For production, fetch from API
      const { token } = getState().auth;
      const response = await axios.get('/api/activities', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activities');
    }
  }
);

export const addActivity = createAsyncThunk(
  'activities/add',
  async (activityData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post('/api/activities', activityData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add activity');
    }
  }
);

// Slice
const activitySlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    filterActivities: (state, action) => {
      const { type, dateRange } = action.payload;
      state.activeFilters = { type, dateRange };
      
      // Apply filters
      let filteredResults = [...state.activities];
      
      if (type) {
        filteredResults = filteredResults.filter(activity => activity.type === type);
      }
      
      if (dateRange) {
        const [startDate, endDate] = dateRange;
        filteredResults = filteredResults.filter(activity => {
          const activityDate = new Date(activity.date);
          return activityDate >= new Date(startDate) && activityDate <= new Date(endDate);
        });
      }
      
      state.filteredActivities = filteredResults;
    },
    
    clearFilters: (state) => {
      state.activeFilters = { type: null, dateRange: null };
      state.filteredActivities = state.activities;
    },
    
    calculateStats: (state) => {
      if (state.activities.length === 0) return;
      
      // Calculate statistics from activities
      const totalActivities = state.activities.length;
      const totalDistance = state.activities.reduce((sum, activity) => sum + activity.distance, 0);
      const totalDuration = state.activities.reduce((sum, activity) => sum + activity.duration, 0);
      const activityTypes = [...new Set(state.activities.map(a => a.type))];
      
      state.stats = {
        totalActivities,
        totalDistance: totalDistance.toFixed(1),
        totalDuration,
        activityTypes,
        activityCounts: activityTypes.map(type => ({
          type,
          count: state.activities.filter(a => a.type === type).length
        }))
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch activities
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
        state.filteredActivities = action.payload;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add activity
      .addCase(addActivity.fulfilled, (state, action) => {
        state.activities.push(action.payload);
        state.filteredActivities = state.activeFilters.type || state.activeFilters.dateRange
          ? state.filteredActivities // Keep current filtered results
          : [...state.activities]; // Reset to show all
      });
  },
});

// Selectors
export const selectAllActivities = state => state.activities.activities;
export const selectFilteredActivities = state => state.activities.filteredActivities;
export const selectActivityStats = state => state.activities.stats;
export const selectActivityLoading = state => state.activities.loading;
export const selectActivityError = state => state.activities.error;

// Memoized selectors for derived data
export const selectActivityTypes = createSelector(
  [selectAllActivities],
  (activities) => [...new Set(activities.map(a => a.type))]
);

export const selectRecentActivities = createSelector(
  [selectAllActivities],
  (activities) => {
    return [...activities]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }
);

export const { filterActivities, clearFilters, calculateStats } = activitySlice.actions;
export default activitySlice.reducer;
