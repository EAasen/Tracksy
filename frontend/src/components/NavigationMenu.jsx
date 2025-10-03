import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// Updated heroicons import for v2 structure
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import 'tailwindcss/tailwind.css';

const NavigationMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-2xl font-bold">Tracksy</div>
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-white focus:outline-none">
            {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
        <div className={`md:flex ${isOpen ? 'block' : 'hidden'} w-full md:w-auto`}>
          <ul className="md:flex md:space-x-4">
            <li>
              <Link to="/" className="block text-white py-2 px-4 hover:bg-gray-700 rounded">
                Home
              </Link>
            </li>
            <li>
              <Link to="/profile" className="block text-white py-2 px-4 hover:bg-gray-700 rounded">
                Profile
              </Link>
            </li>
            <li>
              <Link to="/settings" className="block text-white py-2 px-4 hover:bg-gray-700 rounded">
                Settings
              </Link>
            </li>
            <li>
              <Link to="/notifications" className="block text-white py-2 px-4 hover:bg-gray-700 rounded">
                Notifications
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavigationMenu;
