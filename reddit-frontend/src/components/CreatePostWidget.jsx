import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PhotoIcon, LinkIcon, PencilIcon } from '@heroicons/react/24/outline';

const CreatePostWidget = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="text-center">
          <p className="text-gray-600 mb-3">Join Reddit to create posts</p>
          <div className="space-x-2">
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-reddit-orange hover:bg-reddit-orange-dark"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
        <Link
          to="/submit"
          className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md px-4 py-2 text-left text-gray-500 transition-colors"
        >
          Create Post
        </Link>
      </div>
      
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <Link
          to="/submit?type=image"
          className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-50"
        >
          <PhotoIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Image</span>
        </Link>
        
        <Link
          to="/submit?type=link"
          className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-50"
        >
          <LinkIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Link</span>
        </Link>
        
        <Link
          to="/submit?type=text"
          className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-50"
        >
          <PencilIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Text</span>
        </Link>
      </div>
    </div>
  );
};

export default CreatePostWidget;