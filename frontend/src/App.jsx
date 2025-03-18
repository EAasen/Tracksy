import React from 'react';
import ActivityDataDisplay from './components/ActivityDataDisplay';
import HealthMetrics from './components/HealthMetrics';
import IntegrationManagement from './components/IntegrationManagement';
import UserProfile from './components/UserProfile';
import Notifications from './components/Notifications';
import NavigationMenu from './components/NavigationMenu';
import SearchBar from './components/SearchBar';
import Settings from './components/Settings';

function App() {
  return (
    <div className="App">
      <NavigationMenu />
      <SearchBar />
      <h1>Welcome to Tracksy</h1>
      <ActivityDataDisplay />
      <HealthMetrics />
      <IntegrationManagement />
      <UserProfile />
      <Notifications />
      <Settings />
    </div>
  );
}

export default App;
