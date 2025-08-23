import React from 'react';

const VoteButtons = ({ score, onUpvote, onDownvote, size = 'normal' }) => {
  const sizeClasses = {
    small: 'w-6 h-6 text-sm',
    normal: 'w-8 h-8 text-base'
  };

  const buttonClass = `${sizeClasses[size]} flex items-center justify-center rounded hover:bg-gray-100 transition-colors`;

  return (
    <div className="flex flex-col items-center p-2 bg-gray-50">
      <button
        onClick={onUpvote}
        className={`${buttonClass} text-gray-400 hover:text-orange-500`}
        title="Upvote"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M12 4l8 8h-6v8h-4v-8H4l8-8z"/>
        </svg>
      </button>
      
      <span className={`font-bold text-gray-700 ${size === 'small' ? 'text-xs' : 'text-sm'} my-1`}>
        {score || 0}
      </span>
      
      <button
        onClick={onDownvote}
        className={`${buttonClass} text-gray-400 hover:text-blue-500`}
        title="Downvote"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M12 20l-8-8h6V4h4v8h6l-8 8z"/>
        </svg>
      </button>
    </div>
  );
};

export default VoteButtons;