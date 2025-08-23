import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { PlusIcon } from '@heroicons/react/24/outline';

const CreateCustomFeed = () => {
  const [feedName, setFeedName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement custom feed creation
    console.log('Creating custom feed:', { feedName, description });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-2xl px-8 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create Custom Feed</h1>
            <p className="text-gray-600 mt-2">Curate your own personalized feed from multiple communities</p>
          </div>
          
          <div className="bg-white border border-gray-300 rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="feedName" className="block text-sm font-medium text-gray-700 mb-2">
                  Feed Name
                </label>
                <input
                  type="text"
                  id="feedName"
                  value={feedName}
                  onChange={(e) => setFeedName(e.target.value)}
                  placeholder="Enter feed name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your custom feed"
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Link
                  to="/"
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Create Feed</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCustomFeed;