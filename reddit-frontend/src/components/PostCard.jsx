import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { voteAPI, postAPI, handleApiError, getImageUrl } from '../services/api';
import { toast } from 'react-toastify';
import ConfirmationDialog from './common/ConfirmationDialog';
import { 
  ArrowUpIcon,
  ArrowDownIcon,
  ChatBubbleLeftIcon,
  GiftIcon,
  ShareIcon,
  BookmarkIcon as BookmarkOutlineIcon
} from '@heroicons/react/24/outline';
import { 
  ArrowUpIcon as ArrowUpSolid,
  ArrowDownIcon as ArrowDownSolid,
  BookmarkIcon as BookmarkSolid
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

  const handleVote = async (voteType) => {
    if (!isAuthenticated || voting) return;
    setVoting(true);
    
    try {
      const apiVoteType = voteType === 'UP' ? 'UPVOTE' : 'DOWNVOTE';
      let response;
      
      if (userVote === apiVoteType) {
        setUserVote(null);
        response = await voteAPI.removePostVote(user.id, post.id);
      } else {
        response = await voteAPI.votePost({
          userId: user.id,
          postId: post.id,
          voteType: apiVoteType
        });
        setUserVote(apiVoteType);
      }
      
      if (response?.data?.score !== undefined) {
        setCurrentScore(response.data.score);
      }
      
      if (onVoteUpdate) {
        onVoteUpdate(post.id, response?.data);
      }
    } catch (error) {
      console.error('Error voting:', handleApiError(error));
      toast.error('Failed to update vote');
    } finally {
      setVoting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await postAPI.delete(post.id);
      if (onPostDelete) {
        onPostDelete(post.id);
      }
      toast.success('Post deleted successfully');
    } catch (err) {
      console.error('Failed to delete post:', err);
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4 mb-4 border max-w-4xl w-full">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <img
          src={post.user?.avatar || 'https://www.redditstatic.com/avatars/avatar_default_02_24A0ED.png'}
          alt={post.user?.username || 'user'}
          className="w-6 h-6 rounded-full"
        />
        <span className="font-medium text-gray-700">u/{post.user?.username || 'anonymous'}</span>
        <span>•</span>
        <span>{formatTimeAgo(post.createdAt)}</span>
        <span>•</span>
        <Link to={`/r/${post.community?.name}`} className="flex items-center gap-1 text-black font-semibold hover:underline">
          <img
            src={post.community?.profileImageUrl ? getImageUrl(post.community.profileImageUrl) : 'https://www.redditstatic.com/desktop2x/img/id-cards/snoo-home@2x.png'}
            alt={post.community?.name}
            className="w-6 h-6 rounded-full"
          />
          <span className="font-medium text-gray-700">r/{post.community?.name}</span>
        </Link>
      </div>

      <Link to={`/post/${post.id}`}>
        <h2 className="text-lg font-semibold mt-2 hover:text-blue-600">
          {post.title}
        </h2>
      </Link>

      {post.content && (
        <p className="text-gray-700 mt-2">
          {post.content.length > 300 
            ? `${post.content.substring(0, 300)}...` 
            : post.content}
        </p>
      )}

      {post.imageUrl && (
        <div className="mt-3">
          <img 
            src={getImageUrl(post.imageUrl)} 
            alt={post.title}
            className="w-full max-h-[512px] object-contain rounded-lg cursor-pointer"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="flex items-center gap-3 mt-4 text-sm">
        <div className={`flex items-center rounded-full px-2 py-1 gap-1 ${userVote === 'UPVOTE' ? 'bg-orange-300' : userVote === 'DOWNVOTE' ? 'bg-blue-300' : 'bg-gray-100'}`}>
          <button 
            onClick={() => handleVote('UP')}
            className={`p-1 rounded-full ${userVote === 'UPVOTE' ? 'text-orange-500' : 'text-gray-500 hover:bg-gray-200'}`}
            disabled={voting}
          >
            {userVote === 'UPVOTE' ? (
              <ArrowUpSolid className="h-5 w-5" />
            ) : (
              <ArrowUpIcon className="h-5 w-5" />
            )}
          </button>
          <span className="font-medium px-1">{formatScore(currentScore)}</span>
          <button 
            onClick={() => handleVote('DOWN')}
            className={`${userVote === 'DOWNVOTE' ? 'text-blue-500' : 'text-gray-500'}`}
            disabled={voting}
          >
            {userVote === 'DOWNVOTE' ? (
              <ArrowDownSolid className="h-5 w-5" />
            ) : (
              <ArrowDownIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        <Link 
          to={`/post/${post.id}`}
          className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1"
        >
          <ChatBubbleLeftIcon className="h-4 w-4" />
          <span>{post.commentCount || 0}</span>
        </Link>

        <button className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1">
          <GiftIcon className="h-4 w-4" />
        </button>

        <button className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1">
          <ShareIcon className="h-4 w-4" />
          <span>Share</span>
        </button>

        <button 
          className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 ml-auto"
          onClick={() => setSaved(!saved)}
        >
          {saved ? (
            <BookmarkSolid className="h-4 w-4 text-blue-500" />
          ) : (
            <BookmarkOutlineIcon className="h-4 w-4" />
          )}
          <span>Save</span>
        </button>
      </div>

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
