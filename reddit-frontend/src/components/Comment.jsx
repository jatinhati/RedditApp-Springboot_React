import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { commentAPI, voteAPI } from '../services/api';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { 
  ArrowUpIcon as ArrowUpSolid, 
  ArrowDownIcon as ArrowDownSolid 
} from '@heroicons/react/24/solid';
import ConfirmationDialog from './common/ConfirmationDialog';

const Comment = ({ comment, onCommentUpdate, onReplyAdded, onCommentDelete, level = 0 }) => {
  const { user, isAuthenticated } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [voting, setVoting] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [currentScore, setCurrentScore] = useState(comment.score || 0);
  const [voteLoaded, setVoteLoaded] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const maxLevel = 8; // Maximum nesting level for replies
  const indentClass = level > 0 ? `ml-${Math.min(level * 4, 32)}` : '';

  // Load user's vote status when component mounts
  useEffect(() => {
    const loadUserVote = async () => {
      if (isAuthenticated && user && !voteLoaded) {
        try {
          const response = await voteAPI.getUserCommentVote(comment.id, user.id);
          setUserVote(response.data.voteType);
          setVoteLoaded(true);
        } catch (error) {
          console.error('Error loading user vote:', error);
          setVoteLoaded(true);
        }
      }
    };

    loadUserVote();
  }, [isAuthenticated, user, comment.id, voteLoaded]);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
  };

  const handleVote = async (voteType) => {
    if (!isAuthenticated || voting) return;

    setVoting(true);
    const previousVote = userVote;
    const previousScore = currentScore;
    const apiVoteType = voteType === 'UP' ? 'UPVOTE' : 'DOWNVOTE';

    try {
      let response;
      if (userVote === apiVoteType) {
        // Remove vote if clicking the same vote
        response = await voteAPI.removeCommentVote(user.id, comment.id);
        setUserVote(null);
      } else {
        // Cast new vote or change vote
        response = await voteAPI.voteComment({
          userId: user.id,
          commentId: comment.id,
          voteType: apiVoteType
        });
        setUserVote(apiVoteType);
      }
      
      // Update score from server response
      if (response.data && response.data.score !== undefined) {
        setCurrentScore(response.data.score);
      }
      
      if (onCommentUpdate) {
        onCommentUpdate(response.data);
      }
    } catch (error) {
      console.error('Error voting:', error);
      setUserVote(previousVote);
      setCurrentScore(previousScore);
    } finally {
      setVoting(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Please login to reply');
      return;
    }

    if (!replyText.trim()) {
      return;
    }

    setSubmittingReply(true);
    try {
      const response = await commentAPI.create({
        content: replyText,
        parentCommentId: comment.id,
        postId: comment.post?.id || comment.postId,
        userId: user.id
      });

      onReplyAdded(comment.id, response.data);
      setReplyText('');
      setShowReplyForm(false);
    } catch (err) {
      console.error('Failed to post reply:', err);
      alert('Failed to post reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;

    try {
      const response = await commentAPI.update(comment.id, {
        content: editText,
        userId: user.id
      });
      
      onCommentUpdate(response.data);
      setEditing(false);
    } catch (err) {
      console.error('Failed to edit comment:', err);
      toast.error('Failed to edit comment');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await commentAPI.delete(comment.id);
      if (onCommentDelete) {
        onCommentDelete(comment.id, comment.parentCommentId);
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
      toast.error('Failed to delete comment');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
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

  return (
    <div className={`${level > 0 ? 'ml-10 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="py-2">
        <div className="flex">
          {/* Vote Buttons */}
          <div className="flex flex-col items-center mr-3 pt-1">
            <button
              onClick={() => handleVote('UP')}
              disabled={!isAuthenticated || voting}
              className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                userVote === 'UPVOTE' ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'
              }`}
            >
              {userVote === 'UPVOTE' ? (
                <ArrowUpSolid className="h-4 w-4" />
              ) : (
                <ArrowUpIcon className="h-4 w-4" strokeWidth={2} />
              )}
            </button>
            
            <span className={`text-xs font-bold py-1 ${
              userVote === 'UPVOTE' ? 'text-orange-500' : 
              userVote === 'DOWNVOTE' ? 'text-blue-500' : 
              'text-gray-700'
            }`}>
              {formatScore(currentScore)}
            </span>
            
            <button
              onClick={() => handleVote('DOWN')}
              disabled={!isAuthenticated || voting}
              className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                userVote === 'DOWNVOTE' ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'
              }`}
            >
              {userVote === 'DOWNVOTE' ? (
                <ArrowDownSolid className="h-4 w-4" />
              ) : (
                <ArrowDownIcon className="h-4 w-4" strokeWidth={2} />
              )}
            </button>
          </div>

          {/* Comment Content */}
          <div className="flex-1">
            {/* Comment Header */}
            <div className="flex items-center text-xs text-gray-500 mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {(comment.user?.username || 'U')[0].toUpperCase()}
                  </span>
                </div>
                <span className="font-medium text-gray-800 hover:text-blue-600 cursor-pointer text-sm">
                  {comment.user?.username || 'Unknown'}
                </span>
              </div>
              <span className="mx-2 text-gray-300">•</span>
              <span className="text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
            </div>

            {/* Comment Text */}
            {editing ? (
              <div className="mb-3">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditText(comment.content);
                    }}
                    className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEdit}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-800 mb-3 whitespace-pre-wrap text-sm">
                {comment.content}
              </div>
            )}

            {/* Comment Actions */}
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              {level < maxLevel && isAuthenticated && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="hover:bg-gray-100 px-2 py-1 rounded font-medium"
                >
                  Reply
                </button>
              )}
              
              {isAuthenticated && user?.id === comment.user?.id && (
                <>
                  <button
                    onClick={() => setEditing(!editing)}
                    className="flex items-center space-x-1 hover:bg-gray-100 px-2 py-1 rounded"
                  >
                    <PencilIcon className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="flex items-center text-sm text-gray-600 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </>
              )}
              
              <button className="hover:bg-gray-100 px-2 py-1 rounded">
                Award
              </button>
              <button className="hover:bg-gray-100 px-2 py-1 rounded">
                Share
              </button>
              
              {comment.replies && comment.replies.length > 0 && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="hover:bg-gray-100 px-2 py-1 rounded font-medium"
                >
                  {showReplies ? 'Hide' : 'Show'} {comment.replies.length} replies
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && isAuthenticated && (
        <form onSubmit={handleReplySubmit} className="mt-4 ml-7">
          <div className="border border-gray-300 rounded focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="What are your thoughts?"
              className="w-full p-3 border-0 resize-none focus:outline-none text-sm"
              rows="3"
            />
            <div className="bg-gray-50 px-3 py-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyText('');
                }}
                className="px-3 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!replyText.trim() || submittingReply}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {submittingReply ? 'Replying...' : 'Reply'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Nested Replies */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map(reply => (
            <Comment
              key={reply.id}
              comment={reply}
              onCommentUpdate={onCommentUpdate}
              onReplyAdded={onReplyAdded}
              onCommentDelete={onCommentDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete Comment"
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Comment;