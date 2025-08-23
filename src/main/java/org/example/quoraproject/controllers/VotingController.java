package org.example.quoraproject.controllers;

import org.example.quoraproject.dtos.VoteDTO;
import org.example.quoraproject.models.Comment;
import org.example.quoraproject.models.Post;
import org.example.quoraproject.services.VotingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/votes")
@CrossOrigin(origins = "*")
public class VotingController {
    
    @Autowired
    private VotingService votingService;
    
    @PostMapping("/post")
    public ResponseEntity<?> voteOnPost(@RequestBody VoteDTO voteDTO) {
        try {
            // Validate input
            if (voteDTO.getUserId() == null) {
                return ResponseEntity.badRequest().body("User ID is required");
            }
            if (voteDTO.getPostId() == null) {
                return ResponseEntity.badRequest().body("Post ID is required");
            }
            if (voteDTO.getVoteType() == null || 
                (!voteDTO.getVoteType().equals("UPVOTE") && !voteDTO.getVoteType().equals("DOWNVOTE"))) {
                return ResponseEntity.badRequest().body("Vote type must be UPVOTE or DOWNVOTE");
            }
            
            Post post = votingService.voteOnPost(voteDTO);
            return ResponseEntity.ok(post);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to vote on post: " + e.getMessage());
        }
    }
    
    @PostMapping("/comment")
    public ResponseEntity<?> voteOnComment(@RequestBody VoteDTO voteDTO) {
        try {
            // Validate input
            if (voteDTO.getUserId() == null) {
                return ResponseEntity.badRequest().body("User ID is required");
            }
            if (voteDTO.getCommentId() == null) {
                return ResponseEntity.badRequest().body("Comment ID is required");
            }
            if (voteDTO.getVoteType() == null || 
                (!voteDTO.getVoteType().equals("UPVOTE") && !voteDTO.getVoteType().equals("DOWNVOTE"))) {
                return ResponseEntity.badRequest().body("Vote type must be UPVOTE or DOWNVOTE");
            }
            
            Comment comment = votingService.voteOnComment(voteDTO);
            return ResponseEntity.ok(comment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to vote on comment: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/post/{userId}/{postId}")
    public ResponseEntity<?> removePostVote(@PathVariable Long userId, @PathVariable Long postId) {
        try {
            Post post = votingService.removePostVote(userId, postId);
            return ResponseEntity.ok(post);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to remove vote: " + e.getMessage());
        }
    }
    
    @GetMapping("/post/{postId}/user/{userId}")
    public ResponseEntity<?> getUserPostVote(@PathVariable Long postId, @PathVariable Long userId) {
        try {
            String voteType = votingService.getUserPostVote(userId, postId);
            return ResponseEntity.ok(new VoteStatusResponse(voteType));
        } catch (Exception e) {
            return ResponseEntity.ok(new VoteStatusResponse(null));
        }
    }
    
    @GetMapping("/comment/{commentId}/user/{userId}")
    public ResponseEntity<?> getUserCommentVote(@PathVariable Long commentId, @PathVariable Long userId) {
        try {
            String voteType = votingService.getUserCommentVote(userId, commentId);
            return ResponseEntity.ok(new VoteStatusResponse(voteType));
        } catch (Exception e) {
            return ResponseEntity.ok(new VoteStatusResponse(null));
        }
    }

    @DeleteMapping("/comment/{userId}/{commentId}")
    public ResponseEntity<?> removeCommentVote(@PathVariable Long userId, @PathVariable Long commentId) {
        try {
            Comment comment = votingService.removeCommentVote(userId, commentId);
            return ResponseEntity.ok(comment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to remove vote: " + e.getMessage());
        }
    }
    
    @PostMapping("/refresh-counts")
    public ResponseEntity<?> refreshVoteCounts() {
        try {
            votingService.refreshAllVoteCounts();
            return ResponseEntity.ok("Vote counts refreshed successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to refresh vote counts: " + e.getMessage());
        }
    }
    
    // Inner class for vote status response
    public static class VoteStatusResponse {
        private String voteType;
        
        public VoteStatusResponse(String voteType) {
            this.voteType = voteType;
        }
        
        public String getVoteType() {
            return voteType;
        }
        
        public void setVoteType(String voteType) {
            this.voteType = voteType;
        }
    }
}