import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { postAPI, voteAPI, userAPI, handleApiError, getImageUrl } from '../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CommentSection from '../components/CommentSection';
import Sidebar from '../components/Sidebar';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ChatBubbleLeftIcon, 
  ShareIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { 
  ArrowUpIcon as ArrowUpSolid, 
  ArrowDownIcon as ArrowDownSolid 
} from '@heroicons/react/24/solid';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voting, setVoting] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [currentUpvotes, setCurrentUpvotes] = useState(0);
  const [currentDownvotes, setCurrentDownvotes] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [joiningCommunity, setJoiningCommunity] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    content: '',
    type: 'TEXT'
  });
  
  const location = useLocation();
  
  // Initialize edit data when post loads
  useEffect(() => {
    if (post) {
      setEditData(prev => ({
        ...prev,
        title: post.title || '',
        content: post.content || '',
        type: post.type || 'TEXT'
      }));
    }
  }, [post]);

  useEffect(() => {
    fetchPost();
  }, [id]);

  useEffect(() => {
    const loadUserData = async () => {
      if (isAuthenticated && user && post) {
        try {
          // Load user vote
          const voteResponse = await voteAPI.getUserPostVote(post.id, user.id);
          setUserVote(voteResponse.data.voteType);
          
          // Load user profile to check joined communities
          const userResponse = await userAPI.getProfile(user.id);
          const joinedCommunities = userResponse.data.joinedCommunities || [];
          const isMember = joinedCommunities.some(community => community.id === post.community?.id);
          setIsJoined(isMember);
        } catch (error) {
          console.error('Error loading user data:', handleApiError(error));
        }
      }
    };

    loadUserData();
  }, [isAuthenticated, user, post]);

  const fetchPost = async () => {
    try {
      const response = await postAPI.getById(id);
      setPost(response.data);
      setCurrentScore(response.data.score || 0);
      setCurrentUpvotes(response.data.upvotes || 0);
      setCurrentDownvotes(response.data.downvotes || 0);
    } catch (err) {
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType) => {
    if (!isAuthenticated || voting) return;

    setVoting(true);
    const previousVote = userVote;
    const previousScore = currentScore;
    const previousUpvotes = currentUpvotes;
    const previousDownvotes = currentDownvotes;
    const apiVoteType = voteType === 'UP' ? 'UPVOTE' : 'DOWNVOTE';

    try {
      let response;
      if (userVote === apiVoteType) {
        // Remove vote if clicking the same vote
        response = await voteAPI.removePostVote(user.id, post.id);
        setUserVote(null);
      } else {
        // Cast new vote or change vote
        response = await voteAPI.votePost({
          userId: user.id,
          postId: post.id,
          voteType: apiVoteType
        });
        setUserVote(apiVoteType);
      }
      
      // Update vote counts from server response
      if (response.data) {
        if (response.data.score !== undefined) {
          setCurrentScore(response.data.score);
        }
        if (response.data.upvotes !== undefined) {
          setCurrentUpvotes(response.data.upvotes);
        }
        if (response.data.downvotes !== undefined) {
          setCurrentDownvotes(response.data.downvotes);
        }
      }
    } catch (error) {
      console.error('Error voting:', handleApiError(error));
      // Revert optimistic update on error
      setUserVote(previousVote);
      setCurrentScore(previousScore);
      setCurrentUpvotes(previousUpvotes);
      setCurrentDownvotes(previousDownvotes);
    } finally {
      setVoting(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteDialog(false);
    setIsDeleting(true);
    try {
      await postAPI.delete(post.id);
      toast.success('Post deleted successfully');
      navigate('/');
    } catch (err) {
      console.error('Failed to delete post:', err);
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      const response = await postAPI.update(post.id, {
        ...formData,
        userId: user.id
      });
      
      // Update the post with the response data
      setPost(prevPost => ({
        ...prevPost,
        title: response.data.title,
        content: response.data.content,
        updatedAt: response.data.updatedAt
      }));
      
      setIsEditDialogOpen(false);
      toast.success('Post updated successfully');
    } catch (err) {
      console.error('Failed to update post:', err);
      toast.error(err.response?.data?.message || 'Failed to update post');
    }
  };

  const handleJoinCommunity = async () => {
    if (!isAuthenticated || joiningCommunity || !post.community) return;

    setJoiningCommunity(true);
    try {
      if (isJoined) {
        await userAPI.leaveCommunity(user.id, post.community.id);
        setIsJoined(false);
      } else {
        await userAPI.joinCommunity(user.id, post.community.id);
        setIsJoined(true);
      }
    } catch (error) {
      console.error('Error joining/leaving community:', handleApiError(error));
      alert('Failed to join/leave community');
    } finally {
      setJoiningCommunity(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInSeconds < 60) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 30) return `${diffInDays}d ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}mo ago`;
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears}y ago`;
  };

  const formatScore = (score) => {
    if (score === null || score === undefined) return '0';
    if (score >= 1000000) {
      return `${(score / 1000000).toFixed(1)}M`;
    }
    if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}K`;
    }
    return score.toString();
  };

  // Edit Post Dialog Component
  const EditPostDialog = () => {
    // Local state for the form to prevent re-renders
    const [formData, setFormData] = useState({
      title: post?.title || '',
      content: post?.content || ''
    });

    // Update local state when post changes
    useEffect(() => {
      if (post) {
        setFormData({
          title: post.title || '',
          content: post.content || ''
        });
      }
    }, [post]);

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSubmit = () => {
      // Pass the form data directly to handleUpdate
      handleUpdate(formData);
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Edit Post</h2>
              <button
                onClick={() => setIsEditDialogOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-blue-100 mt-1">Make changes to your post</p>
          </div>

          {/* Form */}
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="edit-title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter a descriptive title"
                />
                {!formData.title.trim() && (
                  <p className="mt-1 text-xs text-red-500">Title is required</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-content" className="block text-sm font-medium text-gray-700">
                Content <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  id="edit-content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[200px]"
                  placeholder="Share your thoughts..."
                />
                {!formData.content.trim() && (
                  <p className="mt-1 text-xs text-red-500">Content is required</p>
                )}
              </div>
            </div>

            {/* Character Count */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-500 gap-2">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {formData.title.length}/300
                </span>
                <span>characters in title</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {formData.content.length}/10000
                </span>
                <span>characters in content</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={() => setIsEditDialogOpen(false)}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!formData.title.trim() || !formData.content.trim()}
              className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                !formData.title.trim() || !formData.content.trim()
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Update Post
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Delete Confirmation Dialog Component
  const DeleteConfirmationDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow overflow-hidden w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Delete Post</h3>
          <p className="text-gray-700 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteDialog(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-gray-500">Loading post...</div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-red-500">{error || 'Post not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex justify-center">
        <div className="flex-1 max-w-4xl mx-auto p-4 md:p-6">
          {isEditDialogOpen && <EditPostDialog />}
          {showDeleteDialog && <DeleteConfirmationDialog />}
          {/* Post Content */}
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm mb-6">
            {/* Post Header */}
            <div className="flex items-center justify-between px-6 py-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  r/
                </div>
                <Link 
                  to={`/r/${post.community?.name}`}
                  className="font-medium hover:underline"
                >
                  r/{post.community?.name}
                </Link>
                <span className="mx-2">•</span>
                <span>Posted by u/{post.user?.username}</span>
                <span className="mx-2">•</span>
                <span className="text-gray-500">{formatTimeAgo(post.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                {isAuthenticated && post.community && (
                  <button 
                    onClick={handleJoinCommunity}
                    disabled={joiningCommunity}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                      isJoined 
                        ? 'text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100' 
                        : 'text-white bg-blue-500 hover:bg-blue-600'
                    } ${joiningCommunity ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {joiningCommunity ? 'Loading...' : (isJoined ? 'Joined' : 'Join')}
                  </button>
                )}
                <div className="relative">
                  <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <EllipsisHorizontalIcon className="h-5 w-5" />
                  </button>
                  
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                      {isAuthenticated && user?.id === post.user?.id && (
                        <>
                          <button
                            onClick={() => setIsEditDialogOpen(true)}
                            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Edit Post
                          </button>
                          <button
                            onClick={() => {
                              setShowMenu(false);
                              handleDelete();
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Delete Post
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setShowMenu(false)}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Report
                      </button>
                      <button
                        onClick={() => setShowMenu(false)}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Hide
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Post Title */}
            <div className="px-6 pb-4">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {post.title}
              </h1>
            </div>

            {/* Post Content */}
            {post.content && (
              <div className="px-6 pb-4">
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>
            )}

            {/* Image Preview */}
            {post.type === 'IMAGE' && post.imageUrl && (
              <div className="px-6 pb-4">
                <img 
                  src={getImageUrl(post.imageUrl)} 
                  alt={post.title}
                  className="w-full h-auto rounded-lg"
                  style={{ maxHeight: '700px', objectFit: 'contain' }}
                  onError={(e) => {
                    console.error('Failed to load image:', post.imageUrl);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Link Preview */}
            {post.type === 'LINK' && post.url && (
              <div className="px-6 pb-4">
                <div className="p-5 border border-gray-200 rounded-lg bg-gray-50">
                  <a 
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-lg break-all"
                  >
                    {post.url}
                  </a>
                </div>
              </div>
            )}

            {/* Post Actions */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                {/* Upvote with count */}
                <button
                  onClick={() => handleVote('UP')}
                  disabled={!isAuthenticated || voting}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-full transition-colors ${
                    userVote === 'UPVOTE' 
                      ? 'bg-orange-100 text-orange-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {userVote === 'UPVOTE' ? (
                    <ArrowUpSolid className="h-6 w-6" />
                  ) : (
                    <ArrowUpIcon className="h-6 w-6" strokeWidth={2} />
                  )}
                  <span className="text-base font-bold">{formatScore(currentUpvotes)}</span>
                </button>

                {/* Downvote with count */}
                <button
                  onClick={() => handleVote('DOWN')}
                  disabled={!isAuthenticated || voting}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-full transition-colors ${
                    userVote === 'DOWNVOTE' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {userVote === 'DOWNVOTE' ? (
                    <ArrowDownSolid className="h-6 w-6" />
                  ) : (
                    <ArrowDownIcon className="h-6 w-6" strokeWidth={2} />
                  )}
                  <span className="text-base font-bold">{formatScore(currentDownvotes)}</span>
                </button>

                {/* Comments */}
                <div className="flex items-center space-x-2 px-4 py-2.5 rounded-full text-gray-600">
                  <ChatBubbleLeftIcon className="h-6 w-6" />
                  <span className="text-base font-medium">{post.commentCount || 0}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Share */}
                <button className="flex items-center space-x-2 px-4 py-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600">
                  <ShareIcon className="h-6 w-6" />
                  <span className="text-base font-medium">Share</span>
                </button>

                {/* Save */}
                <button className="flex items-center space-x-2 px-4 py-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600">
                  <BookmarkIcon className="h-6 w-6" />
                  <span className="text-base font-medium">Save</span>
                </button>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <CommentSection postId={post.id} />
        </div>
      </div>
    </div>
  );
};

export default PostDetail;