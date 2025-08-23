import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { communityAPI, handleApiError, getImageUrl } from '../services/api';
import { UserGroupIcon } from '@heroicons/react/24/outline';

const PopularCommunities = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularCommunities();
  }, []);

  const fetchPopularCommunities = async () => {
    try {
      const response = await communityAPI.getAll(0, 5);
      setCommunities(response.data?.content || response.data?.items || []);
    } catch (error) {
      console.error('Error fetching popular communities:', handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Communities</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-300 rounded">
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Popular Communities</h3>
      </div>
      
      {communities.length === 0 ? (
        <div className="p-3">
          <p className="text-gray-500 text-xs">No communities found</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {communities.slice(0, 5).map((community, index) => (
            <Link
              key={community.id}
              to={`/r/${community.name}`}
              className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                {community.profileImageUrl ? (
                  <img
                    src={getImageUrl(community.profileImageUrl)}
                    alt={community.name}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    <UserGroupIcon className="w-4 h-4 text-gray-600" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    r/{community.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {community.memberCount || 0} members
                  </p>
                </div>
              </div>
              <button className="px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600">
                Join
              </button>
            </Link>
          ))}
        </div>
      )}
      
      <div className="p-3 border-t border-gray-200">
        <Link
          to="/communities"
          className="text-xs text-blue-600 hover:underline"
        >
          View All
        </Link>
      </div>
    </div>
  );
};

export default PopularCommunities;