import React from 'react';
import 'tailwindcss/tailwind.css';

const IntegrationManagement = () => {
  return (
    <div className="integration-management container mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Integration Management</h2>
      <p className="text-sm text-gray-600">Manage your integrations with various health and fitness services.</p>
      <button className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-4" aria-label="Add Integration">
        Add Integration
      </button>
      <button className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600 mt-4" aria-label="Remove Integration">
        Remove Integration
      </button>
    </div>
  );
};

export default IntegrationManagement;
