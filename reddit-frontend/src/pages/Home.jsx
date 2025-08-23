import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { postAPI, handleApiError } from '../services/api';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';
import PopularCommunities from '../components/PopularCommunities';
import { FireIcon } from '@heroicons/react/24/outline';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Determine sort type based on URL path
  const getSortType = () => {
    const path = location.pathname;
    if (path === '/popular') return 'hot';
    if (path === '/all') return 'top';
    return isAuthenticated ? 'feed' : 'hot';
  };

  const sortBy = getSortType();

  useEffect(() => {
    fetchPosts(true);
  }, [location.pathname, isAuthenticated]);

  const fetchPosts = async (reset = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 0 : page;
      let response;

      if (isAuthenticated && sortBy === 'feed') {
        response = await postAPI.getFeed(user.id, currentPage, 20);
      } else {
        switch (sortBy) {
          case 'top':
            response = await postAPI.getTop(currentPage, 20);
            break;
          case 'new':
            response = await postAPI.getNew(currentPage, 20);
            break;
          default:
            response = await postAPI.getHot(currentPage, 20);
        }
      }

      const newPosts = response.data?.content || response.data?.items || [];
      
      if (reset) {
        setPosts(newPosts);
        setPage(1);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
        setPage(prev => prev + 1);
      }
      
      setHasMore(!response.data?.last && newPosts.length > 0);
    } catch (error) {
      console.error('Error fetching posts:', handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleVoteUpdate = (postId, updatedPost) => {
    // Update the specific post in the list with new vote counts
    if (updatedPost) {
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, ...updatedPost } : post
      ));
    } else {
      // Fallback: refresh all posts
      fetchPosts(true);
    }
  };

  const handlePostDelete = (postId) => {
    // Remove the deleted post from the list
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  // Get page title based on current path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/popular') return 'Popular posts';
    if (path === '/all') return 'All posts';
    return isAuthenticated ? 'Home feed' : 'Popular posts';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex justify-center">
        {/* Posts Feed */}
        <div className="w-full max-w-4xl px-8 py-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
          </div>


          {/* Posts */}
          {loading && posts.length === 0 ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-300 rounded-lg p-6 animate-pulse">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-200 rounded w-4/5"></div>
                    <div className="h-40 bg-gray-200 rounded-lg"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
              <div className="text-gray-500">
                <FireIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-sm">Be the first to share something!</p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-0">
                {posts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onVoteUpdate={handleVoteUpdate}
                    onPostDelete={handlePostDelete}
                  />
                ))}
              </div>
              
              {/* Load More */}
              {hasMore && (
                <div className="text-center py-6">
                  <button
                    onClick={() => fetchPosts(false)}
                    disabled={loading}
                    className="px-6 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-80 px-4 py-4 space-y-4 hidden lg:block">
          <PopularCommunities />
        </div>
      </div>
    </div>
  );
};

export default Home;