import React, { useState } from 'react';
import 'tailwindcss/tailwind.css';

const Settings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleNotificationsToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="settings container mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Settings</h2>
      <div className="p-4 border border-gray-300 rounded">
        <div className="flex items-center justify-between mb-4">
          <label className="text-lg font-medium" aria-label="Enable Notifications">
            Enable Notifications
          </label>
          <button
            onClick={handleNotificationsToggle}
            className={`w-10 h-6 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer ${
              notificationsEnabled ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            aria-pressed={notificationsEnabled}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform ${
                notificationsEnabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            ></div>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-lg font-medium" aria-label="Enable Dark Mode">
            Enable Dark Mode
          </label>
          <button
            onClick={handleDarkModeToggle}
            className={`w-10 h-6 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer ${
              darkMode ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            aria-pressed={darkMode}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform ${
                darkMode ? 'translate-x-4' : 'translate-x-0'
              }`}
            ></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
