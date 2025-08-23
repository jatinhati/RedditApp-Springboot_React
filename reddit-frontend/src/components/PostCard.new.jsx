import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { voteAPI, postAPI, userAPI, handleApiError, getImageUrl } from '../services/api';
import { toast } from 'react-toastify';
import ConfirmationDialog from './common/ConfirmationDialog';
import { 
  ChatBubbleLeftIcon, 
  BookmarkIcon,
  EllipsisHorizontalIcon,
  TrashIcon,
  PencilIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowUpTrayIcon as ShareIcon
} from '@heroicons/react/24/outline';
import { 
  BookmarkIcon as BookmarkSolid,
  ArrowUpIcon as ArrowUpSolid, 
  ArrowDownIcon as ArrowDownSolid 
} from '@heroicons/react/24/solid';

const PostCard = ({ post, onVoteUpdate, onPostDelete }) => {
  const { user, isAuthenticated } = useAuth();
  const [voting, setVoting] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [currentScore, setCurrentScore] = useState(post.score || 0);
  const [showMenu, setShowMenu] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [joiningCommunity, setJoiningCommunity] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saved, setSaved] = useState(false);

  // ... (keep all the existing useEffect hooks and handler functions)

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
    if (score >= 1000000) return `${(score / 1000000).toFixed(1)}M`;
    if (score >= 1000) return `${(score / 1000).toFixed(1)}K`;
    return score.toString();
  };

  return (
    <div className="bg-white border border-gray-300 mb-4 rounded-md overflow-hidden">
      <div className="flex">
        {/* Voting */}
        <div className="flex flex-col items-center w-10 p-2 bg-gray-50">
          <button 
            onClick={() => handleVote('UP')}
            className={`p-1 rounded hover:bg-gray-200 ${userVote === 'UPVOTE' ? 'text-orange-500' : 'text-gray-400'}`}
            disabled={voting}
          >
            <ArrowUpIcon className="h-5 w-5" />
          </button>
          <span className="text-xs font-semibold my-1">{formatScore(currentScore)}</span>
          <button 
            onClick={() => handleVote('DOWN')}
            className={`p-1 rounded hover:bg-gray-200 ${userVote === 'DOWNVOTE' ? 'text-blue-500' : 'text-gray-400'}`}
            disabled={voting}
          >
            <ArrowDownIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Post Content */}
        <div className="flex-1 p-2">
          {/* Post Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-xs text-gray-500">
              <div className="w-6 h-6 bg-green-600 rounded-full mr-2 flex items-center justify-center">
                <span className="text-white text-xs font-bold">r</span>
              </div>
              <Link 
                to={`/r/${post.community?.name}`}
                className="font-bold text-black hover:underline mr-2"
              >
                r/{post.community?.name}
              </Link>
              <span>•</span>
              <span className="ml-2">{formatTimeAgo(post.createdAt)}</span>
            </div>

            {isAuthenticated && post.community && (
              <button 
                onClick={handleJoinCommunity}
                disabled={joiningCommunity}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  isJoined 
                    ? 'text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100' 
                    : 'text-white bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {joiningCommunity ? '...' : (isJoined ? 'Joined' : 'Join')}
              </button>
            )}
          </div>

          {/* Post Title and Content */}
          <Link to={`/post/${post.id}`} className="block">
            <h2 className="text-lg font-medium text-gray-900 hover:text-blue-600 mb-1">
              {post.title}
            </h2>
            {post.content && (
              <p className="text-gray-800 text-sm mb-2">
                {post.content.length > 200 
                  ? `${post.content.substring(0, 200)}...` 
                  : post.content
                }
              </p>
            )}
          </Link>

          {/* Action Buttons */}
          <div className="flex items-center text-xs text-gray-500 mt-2">
            <Link 
              to={`/post/${post.id}`}
              className="flex items-center mr-4 hover:bg-gray-100 p-1.5 rounded"
            >
              <ChatBubbleLeftIcon className="h-5 w-5 mr-1.5" />
              <span>{post.commentCount || 0} Comments</span>
            </Link>
            
            <button className="flex items-center mr-4 hover:bg-gray-100 p-1.5 rounded">
              <ShareIcon className="h-5 w-5 mr-1.5" />
              <span>Share</span>
            </button>
            
            <button 
              className="flex items-center hover:bg-gray-100 p-1.5 rounded"
              onClick={() => setSaved(!saved)}
            >
              {saved ? (
                <BookmarkSolid className="h-5 w-5 mr-1.5 text-blue-500" />
              ) : (
                <BookmarkIcon className="h-5 w-5 mr-1.5" />
              )}
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        isConfirming={isDeleting}
      />
    </div>
  );
};

export default PostCard;
