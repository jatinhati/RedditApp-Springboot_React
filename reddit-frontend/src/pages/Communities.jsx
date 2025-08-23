import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { UserGroupIcon } from '@heroicons/react/24/outline';

const Communities = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-4xl px-8 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Your Communities</h1>
            <p className="text-gray-600 mt-2">Manage the communities you've created or moderate</p>
          </div>
          
          <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
            <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No communities yet</h3>
            <p className="text-sm text-gray-500 mb-4">Create your first community to get started</p>
            <Link 
              to="/communities/create"
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              Create Community
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communities;