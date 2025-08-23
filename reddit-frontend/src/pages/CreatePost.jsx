import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { postAPI, communityAPI, handleApiError, getImageUrl } from '../services/api';
import { PhotoIcon, LinkIcon, DocumentTextIcon, XMarkIcon } from '@heroicons/react/24/outline';

const CreatePost = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    url: '',
    imageUrl: '',
    type: searchParams.get('type')?.toUpperCase() || 'TEXT',
    communityId: ''
  });
  const [communities, setCommunities] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCommunities();
    
    // Pre-select community if provided in URL
    const communityId = searchParams.get('community');
    if (communityId) {
      setFormData(prev => ({
        ...prev,
        communityId: communityId
      }));
    }
  }, [isAuthenticated, navigate, searchParams]);

  const fetchCommunities = async () => {
    try {
      const response = await communityAPI.getAll(0, 50);
      setCommunities(response.data?.content || response.data?.items || []);
    } catch (error) {
      console.error('Error fetching communities:', handleApiError(error));
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    setUploadingImage(true);

    try {
      const response = await postAPI.uploadImage(file);
      const imageUrl = getImageUrl(response.data.imageUrl);
      setFormData(prev => ({ ...prev, imageUrl }));
      setImagePreview(URL.createObjectURL(file));
    } catch (error) {
      setError('Failed to upload image: ' + handleApiError(error));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleTypeChange = (type) => {
    setFormData({
      ...formData,
      type,
      content: type !== 'TEXT' ? '' : formData.content,
      url: type !== 'LINK' ? '' : formData.url,
      imageUrl: type !== 'IMAGE' ? '' : formData.imageUrl
    });
    // Clear image preview when switching away from image type
    if (type !== 'IMAGE') {
      setSelectedFile(null);
      setImagePreview('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      setLoading(false);
      return;
    }

    if (!formData.communityId) {
      setError('Please select a community');
      setLoading(false);
      return;
    }

    if (formData.type === 'LINK' && !formData.url.trim()) {
      setError('URL is required for link posts');
      setLoading(false);
      return;
    }

    if (formData.type === 'IMAGE' && !formData.imageUrl.trim()) {
      setError('Image URL is required for image posts');
      setLoading(false);
      return;
    }

    try {
      const postData = {
        title: formData.title.trim(),
        content: formData.type === 'TEXT' ? formData.content.trim() : null,
        url: formData.type === 'LINK' ? formData.url.trim() : null,
        imageUrl: formData.type === 'IMAGE' ? formData.imageUrl.trim() : null,
        type: formData.type,
        userId: user.id,
        communityId: parseInt(formData.communityId)
      };

      await postAPI.create(postData);
      navigate('/');
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const postTypes = [
    { key: 'TEXT', label: 'Text', icon: DocumentTextIcon, description: 'Share your thoughts' },
    { key: 'LINK', label: 'Link', icon: LinkIcon, description: 'Share a link' },
    { key: 'IMAGE', label: 'Image', icon: PhotoIcon, description: 'Share an image' }
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Create a post</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Community Selection */}
          <div>
            <label htmlFor="communityId" className="block text-sm font-medium text-gray-700 mb-2">
              Choose a community
            </label>
            <select
              id="communityId"
              name="communityId"
              value={formData.communityId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-reddit-blue focus:border-reddit-blue"
            >
              <option value="">Select a community</option>
              {communities.map((community) => (
                <option key={community.id} value={community.id}>
                  r/{community.name} • {community.memberCount} members
                </option>
              ))}
            </select>
          </div>

          {/* Post Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Post type</label>
            <div className="grid grid-cols-3 gap-3">
              {postTypes.map((type) => (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => handleTypeChange(type.key)}
                  className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
                    formData.type === type.key
                      ? 'border-reddit-blue bg-blue-50 text-reddit-blue'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <type.icon className="h-6 w-6 mb-2" />
                  <span className="font-medium">{type.label}</span>
                  <span className="text-xs text-gray-500 text-center">{type.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="An interesting title"
              maxLength={300}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-reddit-blue focus:border-reddit-blue"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.title.length}/300</p>
          </div>

          {/* Content based on type */}
          {formData.type === 'TEXT' && (
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Text (optional)
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="What are your thoughts?"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-reddit-blue focus:border-reddit-blue"
              />
            </div>
          )}

          {formData.type === 'LINK' && (
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                URL
              </label>
              <input
                id="url"
                name="url"
                type="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://example.com"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-reddit-blue focus:border-reddit-blue"
              />
            </div>
          )}

          {formData.type === 'IMAGE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image
              </label>
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Drag and drop an image, or</p>
                    <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      Choose File
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
                  {uploadingImage && (
                    <div className="mt-4">
                      <div className="inline-flex items-center text-sm text-gray-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-reddit-blue mr-2"></div>
                        Uploading...
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full h-auto max-h-96 rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
              
              {/* Alternative: URL input */}
              <div className="mt-4">
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Or paste image URL
                </label>
                <input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-reddit-blue focus:border-reddit-blue"
                />
              </div>
            </div>
          )}

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
              disabled={loading || uploadingImage}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Posting...' : uploadingImage ? 'Uploading...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;