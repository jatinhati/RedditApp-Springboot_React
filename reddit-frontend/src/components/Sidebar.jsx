import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  FireIcon, 
  ChartBarIcon, 
  ClockIcon,
  PlusIcon,
  UserGroupIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid, 
  FireIcon as FireIconSolid, 
  ChartBarIcon as ChartBarIconSolid, 
  ClockIcon as ClockIconSolid 
} from '@heroicons/react/24/solid';

const Sidebar = () => {
  const location = useLocation();
  const [showRecent, setShowRecent] = useState(true);
  const [showCommunities, setShowCommunities] = useState(true);
  const [showResources, setShowResources] = useState(true);

  const menuItems = [
    { 
      name: 'Home', 
      path: '/', 
      icon: HomeIcon, 
      iconSolid: HomeIconSolid 
    },
    { 
      name: 'Popular', 
      path: '/popular', 
      icon: FireIcon, 
      iconSolid: FireIconSolid 
    },
    { 
      name: 'All', 
      path: '/all', 
      icon: ChartBarIcon, 
      iconSolid: ChartBarIconSolid 
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen sticky top-12 overflow-y-auto">
      <div className="py-4">
        {/* Main Navigation */}
        <nav className="px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = isActive(item.path) ? item.iconSolid : item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-2 py-2 text-sm font-medium rounded transition-colors ${
                  isActive(item.path)
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Custom Feeds */}
        <div className="mt-6">
          <div className="px-4">
            <button 
              onClick={() => setShowRecent(!showRecent)}
              className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 hover:text-gray-700"
            >
              <span>Custom Feeds</span>
              {showRecent ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />}
            </button>
          </div>
          {showRecent && (
            <nav className="px-4 space-y-1">
              <Link
                to="/create-custom-feed"
                className="flex items-center px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded"
              >
                <PlusIcon className="mr-3 h-4 w-4" />
                Create Custom Feed
              </Link>
            </nav>
          )}
        </div>

        {/* Recent */}
        <div className="mt-6">
          <div className="px-4">
            <button 
              onClick={() => setShowRecent(!showRecent)}
              className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 hover:text-gray-700"
            >
              <span>Recent</span>
              {showRecent ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />}
            </button>
          </div>
          {showRecent && (
            <nav className="px-4 space-y-1">
              <Link
                to="/r/programming"
                className="flex items-center px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded"
              >
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                r/programming
              </Link>
              <Link
                to="/r/technology"
                className="flex items-center px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded"
              >
                <div className="w-4 h-4 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                r/technology
              </Link>
            </nav>
          )}
        </div>

        {/* Communities */}
        <div className="mt-6">
          <div className="px-4">
            <button 
              onClick={() => setShowCommunities(!showCommunities)}
              className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 hover:text-gray-700"
            >
              <span>Communities</span>
              {showCommunities ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />}
            </button>
          </div>
          {showCommunities && (
            <nav className="px-4 space-y-1">
              <Link
                to="/communities/create"
                className="flex items-center px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded"
              >
                <PlusIcon className="mr-3 h-4 w-4" />
                Create Community
              </Link>
              <Link
                to="/communities"
                className="flex items-center px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded"
              >
                <UserGroupIcon className="mr-3 h-4 w-4" />
                Manage Communities
              </Link>
            </nav>
          )}
        </div>

        {/* Resources */}
        <div className="mt-6">
          <div className="px-4">
            <button 
              onClick={() => setShowResources(!showResources)}
              className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 hover:text-gray-700"
            >
              <span>Resources</span>
              {showResources ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />}
            </button>
          </div>
          {showResources && (
            <nav className="px-4 space-y-1 text-xs text-gray-500">
              <Link to="/about" className="block py-1 hover:text-gray-700">About Reddit</Link>
              <Link to="/advertise" className="block py-1 hover:text-gray-700">Advertise</Link>
              <Link to="/help" className="block py-1 hover:text-gray-700">Help</Link>
              <Link to="/blog" className="block py-1 hover:text-gray-700">Blog</Link>
              <Link to="/careers" className="block py-1 hover:text-gray-700">Careers</Link>
              <Link to="/press" className="block py-1 hover:text-gray-700">Press</Link>
              <div className="pt-2 border-t border-gray-200 mt-2">
                <Link to="/terms" className="block py-1 hover:text-gray-700">Terms</Link>
                <Link to="/privacy" className="block py-1 hover:text-gray-700">Privacy Policy</Link>
                <Link to="/content-policy" className="block py-1 hover:text-gray-700">Content Policy</Link>
                <Link to="/user-agreement" className="block py-1 hover:text-gray-700">User Agreement</Link>
              </div>
              <div className="pt-2 text-xs text-gray-400">
                Reddit, Inc. © 2025. All rights reserved.
              </div>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;