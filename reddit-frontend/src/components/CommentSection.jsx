import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { commentAPI, handleApiError } from '../services/api';
import Comment from './Comment';
import { UserIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CommentSection = ({ postId }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('best');

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await commentAPI.getByPost(postId, 0, 50);
      // Comments now come with nested replies from the backend
      const commentsData = response.data || [];
      setComments(commentsData);
    } catch (err) {
      console.error('Failed to fetch comments:', handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await commentAPI.create({
        content: newComment,
        postId: postId,
        userId: user.id
      });

      setComments(prev => [response.data, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment:', handleApiError(err));
      alert('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentUpdate = (updatedComment) => {
    const updateCommentRecursively = (comments) => {
      return comments.map(comment => {
        if (comment.id === updatedComment.id) {
          return { ...comment, ...updatedComment };
        } else if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: updateCommentRecursively(comment.replies)
          };
        }
        return comment;
      });
    };
    
    setComments(prev => updateCommentRecursively(prev));
  };

  const handleReplyAdded = (parentCommentId, newReply) => {
    const addReplyRecursively = (comments) => {
      return comments.map(comment => {
        if (comment.id === parentCommentId) {
          return {
            ...comment,
            replies: comment.replies ? [newReply, ...comment.replies] : [newReply]
          };
        } else if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: addReplyRecursively(comment.replies)
          };
        }
        return comment;
      });
    };
    
    setComments(prev => addReplyRecursively(prev));
  };

  const handleCommentDelete = (commentId, parentCommentId) => {
    const deleteCommentRecursively = (comments) => {
      return comments.reduce((acc, comment) => {
        if (comment.id === commentId) {
          return acc; // Skip this comment (effectively deleting it)
        }
        
        // If this comment has replies, process them
        if (comment.replies && comment.replies.length > 0) {
          return [
            ...acc,
            {
              ...comment,
              replies: deleteCommentRecursively(comment.replies)
            }
          ];
        }
        
        return [...acc, comment];
      }, []);
    };
    
    setComments(prev => {
      // If it's a top-level comment
      if (!parentCommentId) {
        return prev.filter(comment => comment.id !== commentId);
      }
      
      // If it's a nested comment, find and update the parent
      return prev.map(comment => {
        if (comment.id === parentCommentId) {
          return {
            ...comment,
            replies: comment.replies ? comment.replies.filter(reply => reply.id !== commentId) : []
          };
        }
        
        // Recursively check for nested replies
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply.id === parentCommentId) {
                return {
                  ...reply,
                  replies: reply.replies ? reply.replies.filter(r => r.id !== commentId) : []
                };
              }
              return reply;
            })
          };
        }
        
        return comment;
      });
    });
    
    toast.success('Comment deleted successfully');
  };

  const sortOptions = [
    { key: 'best', label: 'Best' },
    { key: 'top', label: 'Top' },
    { key: 'new', label: 'New' },
    { key: 'controversial', label: 'Controversial' },
    { key: 'old', label: 'Old' },
    { key: 'qa', label: 'Q&A' }
  ];

  if (loading) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <div className="text-gray-500">Loading comments...</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
      {/* Comment Form */}
      {isAuthenticated ? (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-gray-600" />
            </div>
            <span className="text-sm text-gray-600">
              Comment as <span className="text-blue-600 font-medium">{user.username}</span>
            </span>
          </div>
          
          <form onSubmit={handleSubmitComment}>
            <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="What are your thoughts?"
                className="w-full p-4 border-0 resize-none focus:outline-none text-base"
                rows="4"
              />
              <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Remember the human
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setNewComment('')}
                    className="px-4 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    className="px-6 py-1.5 text-sm font-medium bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? 'Commenting...' : 'Comment'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-gray-600 mb-3">Log in or sign up to leave a comment</p>
            <div className="space-x-2">
              <button className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50 transition-colors">
                Log In
              </button>
              <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sort Options */}
      <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600 mr-2">Sort by:</span>
          {sortOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => setSortBy(option.key)}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                sortBy === option.key
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comments List */}
      <div>
        {comments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.126-.532l-3.874 1.55 1.55-3.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Comments Yet</h3>
            <p className="text-sm">Be the first to share what you think!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {comments.map(comment => (
              <Comment
                key={comment.id}
                comment={comment}
                onCommentUpdate={handleCommentUpdate}
                onReplyAdded={handleReplyAdded}
                onCommentDelete={handleCommentDelete}
                level={0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;