import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7777/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      // Normalize error message
      const message = typeof data === 'string' ? data : data?.message || `HTTP ${status} Error`;
      error.message = message;
    } else if (error.request) {
      // Network error
      error.message = 'Network error - please check your connection';
    } else {
      // Other error
      error.message = error.message || 'An unexpected error occurred';
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// User API
export const userAPI = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (userId, userData) => api.put(`/users/${userId}`, userData),
  joinCommunity: (userId, communityId) => api.post(`/users/${userId}/join/${communityId}`),
  leaveCommunity: (userId, communityId) => api.delete(`/users/${userId}/leave/${communityId}`)
};

// Community API
export const communityAPI = {
  getAll: (page = 0, size = 20) => api.get(`/communities?page=${page}&size=${size}`),
  getById: (id) => api.get(`/communities/${id}`),
  getByName: (name) => api.get(`/communities/name/${name}`),
  create: (communityData) => api.post('/communities', communityData),
  update: (id, communityData) => api.put(`/communities/${id}`, communityData),
  delete: (id) => api.delete(`/communities/${id}`),
  search: (query, page = 0, size = 20) => api.get(`/communities/search?query=${query}&page=${page}&size=${size}`),
  getPopular: (page = 0, size = 20) => api.get(`/communities/popular?page=${page}&size=${size}`),
  getMembers: (id, page = 0, size = 20) => api.get(`/communities/${id}/members?page=${page}&size=${size}`),
  getMembersByName: (name, page = 0, size = 20) => api.get(`/communities/name/${name}/members?page=${page}&size=${size}`),
  join: (communityId, userId) => api.post(`/communities/${communityId}/join/${userId}`),
  leave: (communityId, userId) => api.post(`/communities/${communityId}/leave/${userId}`)
};

// Post API
export const postAPI = {
  getAll: (page = 0, size = 20) => api.get(`/posts?page=${page}&size=${size}`),
  getById: (id) => api.get(`/posts/${id}`),
  create: (postData) => api.post('/posts', postData),
  update: (id, postData) => api.put(`/posts/${id}`, postData),
  delete: (id) => api.delete(`/posts/${id}`),
  getByCommunity: (communityId, page = 0, size = 20) => api.get(`/posts/community/${communityId}?page=${page}&size=${size}`),
  getHot: (page = 0, size = 20) => api.get(`/posts/hot?page=${page}&size=${size}`),
  getTop: (page = 0, size = 20) => api.get(`/posts/top?page=${page}&size=${size}`),
  getNew: (page = 0, size = 20) => api.get(`/posts/new?page=${page}&size=${size}`),
  search: (query, page = 0, size = 20) => api.get(`/posts/search?query=${query}&page=${page}&size=${size}`),
  getFeed: (userId, page = 0, size = 20) => api.get(`/posts/feed/${userId}?page=${page}&size=${size}`),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/posts/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getImage: (filename) => api.get(`/posts/image/${filename}`, {
    responseType: 'blob'
  })
};

// Comment API
export const commentAPI = {
  getByPost: (postId, page = 0, size = 20) => api.get(`/comments/post/${postId}?page=${page}&size=${size}`),
  getReplies: (commentId, page = 0, size = 20) => api.get(`/comments/${commentId}/replies?page=${page}&size=${size}`),
  create: (commentData) => api.post('/comments', commentData),
  update: (id, commentData) => api.put(`/comments/${id}`, commentData),
  delete: (id) => api.delete(`/comments/${id}`)
};

// Vote API
export const voteAPI = {
  votePost: (voteData) => api.post('/votes/post', voteData),
  voteComment: (voteData) => api.post('/votes/comment', voteData),
  removePostVote: (userId, postId) => api.delete(`/votes/post/${userId}/${postId}`),
  removeCommentVote: (userId, commentId) => api.delete(`/votes/comment/${userId}/${commentId}`),
  getUserPostVote: (postId, userId) => api.get(`/votes/post/${postId}/user/${userId}`),
  getUserCommentVote: (commentId, userId) => api.get(`/votes/comment/${commentId}/user/${userId}`)
};

// Utility functions
export const handleApiError = (error) => {
  console.error('API Error:', error);
  return error.message || 'An unexpected error occurred';
};

export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${API_BASE_URL.replace('/api/v1', '')}${imageUrl}`;
};

export const formatApiResponse = (response) => {
  // Handle paginated responses
  if (response.data && typeof response.data === 'object' && 'content' in response.data) {
    return {
      ...response,
      data: {
        ...response.data,
        items: response.data.content, // Normalize to 'items'
      }
    };
  }
  return response;
};

export default api;