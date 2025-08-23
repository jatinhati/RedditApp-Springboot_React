import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { communityAPI, postAPI, handleApiError, getImageUrl } from '../services/api';
import { 
  UserGroupIcon, 
  CalendarIcon, 
  UserPlusIcon, 
  UserMinusIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';

const CommunityPage = () => {
  const { communityName } = useParams();
  const { user, isAuthenticated } = useAuth();
  
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCommunityData();
  }, [communityName]);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch community details
      const communityResponse = await communityAPI.getByName(communityName);
      setCommunity(communityResponse.data);
      
      // Fetch community members
      fetchMembers(communityResponse.data.id);
      
      // Fetch community posts
      fetchPosts(communityResponse.data.id);
      
      // Check if current user is a member
      if (isAuthenticated && user) {
        checkMembership(communityResponse.data.id);
      }
      
    } catch (error) {
      console.error('Error fetching community:', error);
      setError('Community not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (communityId) => {
    try {
      setMembersLoading(true);
      const response = await communityAPI.getMembers(communityId, 0, 10);
      setMembers(response.data?.content || response.data?.items || []);
    } catch (error) {
      console.error('Error fetching members:', handleApiError(error));
    } finally {
      setMembersLoading(false);
    }
  };

  const fetchPosts = async (communityId) => {
    try {
      setPostsLoading(true);
      const response = await postAPI.getByCommunity(communityId, 0, 5);
      setPosts(response.data?.content || response.data?.items || []);
    } catch (error) {
      console.error('Error fetching posts:', handleApiError(error));
    } finally {
      setPostsLoading(false);
    }
  };

  const checkMembership = async (communityId) => {
    try {
      // Check if user is in the members list
      const membersResponse = await communityAPI.getMembers(communityId, 0, 100);
      const members = membersResponse.data?.content || membersResponse.data?.items || [];
      const isMember = members.some(member => member.id === user.id);
      setIsJoined(isMember);
    } catch (error) {
      console.error('Error checking membership:', handleApiError(error));
      setIsJoined(false);
    }
  };

  const handleJoinLeave = async () => {
    if (!isAuthenticated) {
      alert('Please log in to join communities');
      return;
    }

    try {
      if (isJoined) {
        await communityAPI.leave(community.id, user.id);
        setIsJoined(false);
        setCommunity(prev => ({
          ...prev,
          memberCount: Math.max(0, prev.memberCount - 1)
        }));
      } else {
        await communityAPI.join(community.id, user.id);
        setIsJoined(true);
        setCommunity(prev => ({
          ...prev,
          memberCount: prev.memberCount + 1
        }));
      }
      // Refresh members list
      fetchMembers(community.id);
    } catch (error) {
      console.error('Error joining/leaving community:', handleApiError(error));
      alert('Failed to join/leave community');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading community...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Community Not Found</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link to="/" className="text-blue-500 hover:text-blue-600">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Community Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={community?.profileImageUrl ? getImageUrl(community.profileImageUrl) : 'https://www.redditstatic.com/desktop2x/img/id-cards/snoo-home@2x.png'}
                    alt={community?.name}
                    className="w-20 h-20 rounded-full"
                  />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{community?.displayName}</h1>
                    <h2 className="text-xl text-gray-500">r/{community?.name}</h2>
                  </div>
                </div>
                
                {isAuthenticated && (
                  <button
                    onClick={handleJoinLeave}
                    className={`flex items-center px-4 py-2 rounded-full font-medium transition-colors ${
                      isJoined
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {isJoined ? (
                      <>
                        <UserMinusIcon className="h-4 w-4 mr-2" />
                        Leave
                      </>
                    ) : (
                      <>
                        <UserPlusIcon className="h-4 w-4 mr-2" />
                        Join
                      </>
                    )}
                  </button>
                )}
              </div>
              
              <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <UserGroupIcon className="h-4 w-4 mr-1" />
                  {community?.memberCount || 0} members
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Created {new Date(community?.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Recent Posts */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Recent Posts
                </h3>
              </div>
              
              {postsLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading posts...</p>
                </div>
              ) : posts.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {posts.map((post) => (
                    <div key={post.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start space-x-3">
                        {/* Vote Section */}
                        <div className="flex flex-col items-center space-y-1 text-gray-400">
                          <button className="hover:text-orange-500 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <span className="text-sm font-medium">{post.score || 0}</span>
                          <button className="hover:text-blue-500 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Post Content */}
                        <div className="flex-1 min-w-0">
                          <Link to={`/post/${post.id}`} className="block">
                            <h4 className="font-medium text-gray-900 hover:text-blue-600 mb-1">
                              {post.title}
                            </h4>
                            {post.content && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {post.content}
                              </p>
                            )}
                            {post.imageUrl && (
                              <div className="mb-2">
                                <img 
                                  src={post.imageUrl} 
                                  alt="Post" 
                                  className="max-w-full h-32 object-cover rounded"
                                  onError={(e) => e.target.style.display = 'none'}
                                />
                              </div>
                            )}
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>by u/{post.user?.username}</span>
                              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                              <span>{post.commentCount || 0} comments</span>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* View All Posts Link */}
                  <div className="p-4 text-center border-t border-gray-200">
                    <Link 
                      to={`/r/${community?.name}/posts`}
                      className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                    >
                      View all posts in r/{community?.name}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No posts yet in this community</p>
                  {isAuthenticated && (
                    <Link
                      to="/submit"
                      className="inline-block mt-3 text-blue-500 hover:text-blue-600 text-sm"
                    >
                      Be the first to post!
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Members */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-2" />
                  Members ({community?.memberCount || 0})
                </h3>
              </div>
              
              {membersLoading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading members...</p>
                </div>
              ) : members.length > 0 ? (
                <div className="p-4 space-y-3">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {member.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          u/{member.username}
                        </p>
                        <p className="text-xs text-gray-500">
                          {member.karma || 0} karma
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {community?.memberCount > members.length && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500 text-center">
                        and {community.memberCount - members.length} more members
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <UserGroupIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No members yet</p>
                </div>
              )}
            </div>

            {/* Community Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About Community</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="text-gray-900">
                    {new Date(community?.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Members</span>
                  <span className="text-gray-900">{community?.memberCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Creator</span>
                  <span className="text-gray-900">u/{community?.creator?.username}</span>
                </div>
              </div>
              
              {isAuthenticated && (
                <Link
                  to={`/submit?community=${community?.id}`}
                  className="w-full mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors text-center block"
                >
                  Create Post
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;