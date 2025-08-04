import React from 'react';
import 'tailwindcss/tailwind.css';

const UserProfile = ({ user = {} }) => {
  // Default user data if not provided
  const defaultUser = {
    username: user.username || 'johndoe',
    email: user.email || 'john.doe@example.com',
    createdAt: user.createdAt || '2025-01-15T08:00:00Z',
    fullName: user.fullName || 'John Doe',
    location: user.location || 'San Francisco, CA',
    bio: user.bio || 'Fitness enthusiast and outdoor adventurer',
    profileImage: user.profileImage || 'https://via.placeholder.com/150'
  };

  return (
    <div className="user-profile container mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">User Profile</h2>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 text-center mb-6 md:mb-0">
            <img 
              src={defaultUser.profileImage} 
              alt="Profile" 
              className="rounded-full mx-auto h-32 w-32 object-cover border-4 border-gray-200"
            />
            <h3 className="text-xl font-medium mt-4">{defaultUser.fullName}</h3>
            <p className="text-gray-600">@{defaultUser.username}</p>
          </div>
          
          <div className="md:w-2/3 md:pl-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Email</h4>
                <p className="text-gray-800">{defaultUser.email}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Location</h4>
                <p className="text-gray-800">{defaultUser.location}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Member Since</h4>
                <p className="text-gray-800">{new Date(defaultUser.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500">Bio</h4>
              <p className="text-gray-800 mt-2">{defaultUser.bio}</p>
            </div>
            
            <div className="mt-6">
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
