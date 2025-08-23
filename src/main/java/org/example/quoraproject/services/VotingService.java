package org.example.quoraproject.services;

import org.example.quoraproject.dtos.VoteDTO;
import org.example.quoraproject.models.*;
import org.example.quoraproject.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class VotingService {
    
    @Autowired
    private PostVoteRepository postVoteRepository;
    
    @Autowired
    private CommentVoteRepository commentVoteRepository;
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Transactional
    public Post voteOnPost(VoteDTO voteDTO) {
        User user = userRepository.findById(voteDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(voteDTO.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        PostVote.VoteType voteType = PostVote.VoteType.valueOf(voteDTO.getVoteType());
        
        Optional<PostVote> existingVote = postVoteRepository.findByUserIdAndPostId(user.getId(), post.getId());
        
        if (existingVote.isPresent()) {
            PostVote vote = existingVote.get();
            if (vote.getVoteType() == voteType) {
                // Remove vote if clicking same vote type
                postVoteRepository.delete(vote);
                updatePostScore(post);
                return post;
            } else {
                // Change vote type
                vote.setVoteType(voteType);
                postVoteRepository.save(vote);
            }
        } else {
            // Create new vote
            PostVote newVote = new PostVote();
            newVote.setUser(user);
            newVote.setPost(post);
            newVote.setVoteType(voteType);
            postVoteRepository.save(newVote);
        }
        
        updatePostScore(post);
        return post;
    }
    
    @Transactional
    public Comment voteOnComment(VoteDTO voteDTO) {
        User user = userRepository.findById(voteDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Comment comment = commentRepository.findById(voteDTO.getCommentId())
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        CommentVote.VoteType voteType = CommentVote.VoteType.valueOf(voteDTO.getVoteType());
        
        Optional<CommentVote> existingVote = commentVoteRepository.findByUserIdAndCommentId(user.getId(), comment.getId());
        
        if (existingVote.isPresent()) {
            CommentVote vote = existingVote.get();
            if (vote.getVoteType() == voteType) {
                // Remove vote if clicking same vote type
                commentVoteRepository.delete(vote);
                updateCommentScore(comment);
                return comment;
            } else {
                // Change vote type
                vote.setVoteType(voteType);
                commentVoteRepository.save(vote);
            }
        } else {
            // Create new vote
            CommentVote newVote = new CommentVote();
            newVote.setUser(user);
            newVote.setComment(comment);
            newVote.setVoteType(voteType);
            commentVoteRepository.save(newVote);
        }
        
        updateCommentScore(comment);
        return comment;
    }
    
    private void updatePostScore(Post post) {
        // Count votes directly from repository to avoid lazy loading issues
        long upvotes = postVoteRepository.countByPostIdAndVoteType(post.getId(), PostVote.VoteType.UPVOTE);
        long downvotes = postVoteRepository.countByPostIdAndVoteType(post.getId(), PostVote.VoteType.DOWNVOTE);
        
        post.setUpvotes((int) upvotes);
        post.setDownvotes((int) downvotes);
        post.setScore((int) (upvotes - downvotes));
        postRepository.save(post);
        
        // Update user karma
        User postAuthor = post.getUser();
        updateUserKarma(postAuthor);
    }
    
    private void updateCommentScore(Comment comment) {
        // Count votes directly from repository to avoid lazy loading issues
        long upvotes = commentVoteRepository.countByCommentIdAndVoteType(comment.getId(), CommentVote.VoteType.UPVOTE);
        long downvotes = commentVoteRepository.countByCommentIdAndVoteType(comment.getId(), CommentVote.VoteType.DOWNVOTE);
        
        comment.setUpvotes((int) upvotes);
        comment.setDownvotes((int) downvotes);
        comment.setScore((int) (upvotes - downvotes));
        commentRepository.save(comment);
        
        // Update user karma
        User commentAuthor = comment.getUser();
        updateUserKarma(commentAuthor);
    }
    
    @Transactional
    public Post removePostVote(Long userId, Long postId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        Optional<PostVote> existingVote = postVoteRepository.findByUserIdAndPostId(userId, postId);
        if (existingVote.isPresent()) {
            postVoteRepository.delete(existingVote.get());
            updatePostScore(post);
        }
        
        return post;
    }
    
    @Transactional
    public Comment removeCommentVote(Long userId, Long commentId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        Optional<CommentVote> existingVote = commentVoteRepository.findByUserIdAndCommentId(userId, commentId);
        if (existingVote.isPresent()) {
            commentVoteRepository.delete(existingVote.get());
            updateCommentScore(comment);
        }
        
        return comment;
    }
    
    public String getUserPostVote(Long userId, Long postId) {
        Optional<PostVote> vote = postVoteRepository.findByUserIdAndPostId(userId, postId);
        return vote.map(v -> v.getVoteType().toString()).orElse(null);
    }
    
    public String getUserCommentVote(Long userId, Long commentId) {
        Optional<CommentVote> vote = commentVoteRepository.findByUserIdAndCommentId(userId, commentId);
        return vote.map(v -> v.getVoteType().toString()).orElse(null);
    }
    
    private void updateUserKarma(User user) {
        int postKarma = user.getPosts().stream()
                .mapToInt(Post::getScore)
                .sum();
        int commentKarma = user.getComments().stream()
                .mapToInt(Comment::getScore)
                .sum();
        
        user.setKarma(postKarma + commentKarma);
        userRepository.save(user);
    }
    
    @Transactional
    public void refreshAllVoteCounts() {
        // Refresh all post vote counts
        List<Post> allPosts = postRepository.findAll();
        for (Post post : allPosts) {
            updatePostScore(post);
        }
        
        // Refresh all comment vote counts
        List<Comment> allComments = commentRepository.findAll();
        for (Comment comment : allComments) {
            updateCommentScore(comment);
        }
    }
}