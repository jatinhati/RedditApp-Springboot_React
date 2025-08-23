import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { communityAPI } from '../services/api';

const CreateCommunity = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    profileImageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    let value = e.target.value;
    
    // For community name, convert to lowercase and remove spaces
    if (e.target.name === 'name') {
      value = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    }
    
    setFormData({
      ...formData,
      [e.target.name]: value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Community name is required');
      setLoading(false);
      return;
    }

    if (formData.name.length < 3) {
      setError('Community name must be at least 3 characters long');
      setLoading(false);
      return;
    }

    if (!formData.displayName.trim()) {
      setError('Display name is required');
      setLoading(false);
      return;
    }

    try {
      const communityData = {
        name: formData.name.trim(),
        displayName: formData.displayName.trim(),
        description: formData.description.trim(),
        profileImageUrl: formData.profileImageUrl.trim(),
        creatorId: user.id
      };

      console.log('Creating community with data:', communityData);
      console.log('User object:', user);
      
      const response = await communityAPI.create(communityData);
      console.log('Community creation response:', response);
      navigate(`/r/${response.data.name}`);
    } catch (error) {
      console.error('Community creation error:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      if (error.response?.status === 409) {
        setError('A community with this name already exists');
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to create community';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 flex max-w-5xl mx-auto">
        <div className="flex-1 px-6 py-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded border border-gray-200 p-6">
              <h1 className="text-xl font-bold text-gray-900 mb-6">Create a community</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Community Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Community name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">r/</span>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="community_name"
                maxLength={21}
                required
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-reddit-blue focus:border-reddit-blue"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Community names including capitalization cannot be changed. {formData.name.length}/21
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
              Display name
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="Community Display Name"
              maxLength={100}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-reddit-blue focus:border-reddit-blue"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.displayName.length}/100</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell people what your community is about"
              rows={4}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-reddit-blue focus:border-reddit-blue"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500</p>
          </div>

          {/* Profile Image URL */}
          <div>
            <label htmlFor="profileImageUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Profile Image URL (optional)
            </label>
            <input
              id="profileImageUrl"
              name="profileImageUrl"
              type="url"
              value={formData.profileImageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.png"
              maxLength={255}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-reddit-blue focus:border-reddit-blue"
            />
          </div>

          {/* Community Rules Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Community Guidelines</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Be respectful and civil</li>
              <li>• No spam or self-promotion</li>
              <li>• Stay on topic</li>
              <li>• Follow Reddit's content policy</li>
            </ul>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name || !formData.displayName}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Community'}
            </button>
          </div>
            </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCommunity;