package org.example.quoraproject.services;


import org.example.quoraproject.dtos.CommentDTO;
import org.example.quoraproject.models.Post;
import org.example.quoraproject.models.Comment;
import org.example.quoraproject.models.User;
import org.example.quoraproject.repositories.PostRepository;
import org.example.quoraproject.repositories.CommentRepository;
import org.example.quoraproject.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CommentService {
    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Comment> getCommentsByPostId(Long postId, int page, int size) {
        // Get top-level comments (no parent)
        List<Comment> topLevelComments = commentRepository.findByPostIdAndParentCommentIsNull(postId, PageRequest.of(page, size)).getContent();
        
        // For each top-level comment, load its replies
        for (Comment comment : topLevelComments) {
            loadRepliesRecursively(comment);
        }
        
        return topLevelComments;
    }
    
    private void loadRepliesRecursively(Comment comment) {
        List<Comment> replies = commentRepository.findByParentCommentId(comment.getId(), PageRequest.of(0, 100)).getContent();
        comment.setReplies(new java.util.HashSet<>(replies));
        
        // Recursively load replies for each reply (up to a reasonable depth)
        for (Comment reply : replies) {
            loadRepliesRecursively(reply);
        }
    }

    public List<Comment> getRepliesByCommentId(Long commentId, int page, int size) {
        return commentRepository.findByParentCommentId(commentId, PageRequest.of(page, size)).getContent();
    }

    public Optional<Comment> getCommentById(Long id) {
        return commentRepository.findById(id);
    }

    @Transactional
    public Comment createComment(CommentDTO commentDTO) {
        User user = userRepository.findById(commentDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Post post = postRepository.findById(commentDTO.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        Comment comment = new Comment();
        comment.setContent(commentDTO.getContent());
        comment.setUser(user);
        comment.setPost(post);
        comment.setScore(0);
        comment.setUpvotes(0);
        comment.setDownvotes(0);
        
        // Handle parent comment if this is a reply
        if (commentDTO.getParentCommentId() != null) {
            Comment parentComment = commentRepository.findById(commentDTO.getParentCommentId())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            comment.setParentComment(parentComment);
        }
        
        Comment savedComment = commentRepository.save(comment);
        
        // Update comment count for the post
        updatePostCommentCount(post.getId());
        
        return savedComment;
    }

    public Comment updateComment(Long id, CommentDTO commentDTO) {
        Optional<Comment> existingComment = commentRepository.findById(id);
        if (existingComment.isEmpty()) {
            throw new RuntimeException("Comment not found");
        }
        
        Comment comment = existingComment.get();
        
        // Verify user ownership
        if (!comment.getUser().getId().equals(commentDTO.getUserId())) {
            throw new RuntimeException("You can only edit your own comments");
        }
        
        comment.setContent(commentDTO.getContent());
        return commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(Long id) {
    Optional<Comment> commentOpt = commentRepository.findById(id);
    if (commentOpt.isPresent()) {
        Comment comment = commentOpt.get();
        Long postId = comment.getPost().getId();
        
        // Delete the comment (this will cascade delete all replies due to CascadeType.ALL)
        commentRepository.deleteById(id);
        
        // Update comment count for the post
        updatePostCommentCount(postId);
    }
}
    

    
    private void updatePostCommentCount(Long postId) {
        Optional<Post> postOpt = postRepository.findById(postId);
        if (postOpt.isPresent()) {
            Post post = postOpt.get();
            // Count all comments for this post (including nested replies)
            int commentCount = countAllCommentsForPost(postId);
            post.setCommentCount(commentCount);
            postRepository.save(post);
        }
    }
    
    private int countAllCommentsForPost(Long postId) {
        return (int) commentRepository.countByPostId(postId);
    }
    
    public long getCommentCountByPostId(Long postId) {
        return commentRepository.countByPostId(postId);
    }
    
    public long getReplyCountByCommentId(Long commentId) {
        return commentRepository.countByParentCommentId(commentId);
    }
}