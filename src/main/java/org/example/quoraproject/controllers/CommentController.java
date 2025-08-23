package org.example.quoraproject.controllers;


import org.example.quoraproject.dtos.CommentDTO;
import org.example.quoraproject.models.Comment;
import org.example.quoraproject.services.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.example.quoraproject.security.JwtUtil;





import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/comments")
@CrossOrigin(origins = "*")
public class CommentController {
    @Autowired
    private CommentService commentService;
    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/post/{postId}")
    public List<Comment> getCommentsByPostId(@PathVariable Long postId, @RequestParam int page, @RequestParam int size) {
        return commentService.getCommentsByPostId(postId, page, size);
    }

    @GetMapping("/{commentId}/replies")
    public List<Comment> getRepliesByCommentId(@PathVariable Long commentId, @RequestParam int page, @RequestParam int size) {
        return commentService.getRepliesByCommentId(commentId, page, size);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Comment> getCommentById(@PathVariable Long id) {
        Optional<Comment> comment = commentService.getCommentById(id);
        return comment.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createComment(@RequestBody CommentDTO commentDTO) {
        try {
            // Validate input
            if (commentDTO.getContent() == null || commentDTO.getContent().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Comment content is required");
            }
            if (commentDTO.getUserId() == null) {
                return ResponseEntity.badRequest().body("User ID is required");
            }
            if (commentDTO.getPostId() == null && commentDTO.getParentCommentId() == null) {
                return ResponseEntity.badRequest().body("Either post ID or parent comment ID is required");
            }
            
            Comment comment = commentService.createComment(commentDTO);
            return ResponseEntity.ok(comment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace(); // For debugging
            return ResponseEntity.badRequest().body("Failed to create comment: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateComment(@PathVariable Long id, @RequestBody CommentDTO commentDTO) {
        try {
            // Validate input
            if (commentDTO.getContent() == null || commentDTO.getContent().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Comment content is required");
            }
            if (commentDTO.getUserId() == null) {
                return ResponseEntity.badRequest().body("User ID is required");
            }
            
            Comment comment = commentService.updateComment(id, commentDTO);
            return ResponseEntity.ok(comment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to update comment: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(
    @PathVariable Long id,
    @RequestHeader("Authorization") String token) {
    
    try {
        // Extract username from JWT token
        String username = jwtUtil.extractUsername(token.replace("Bearer ", ""));
        
        // Get the comment to check ownership
        Optional<Comment> commentOpt = commentService.getCommentById(id);
        if (commentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Comment comment = commentOpt.get();
        
        // Check if the current user is the owner of the comment
        if (!comment.getUser().getUsername().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("You are not authorized to delete this comment");
        }
        
        commentService.deleteComment(id);
        return ResponseEntity.noContent().build();
        
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body("Error deleting comment: " + e.getMessage());
    }
}
    
    @GetMapping("/post/{postId}/count")
    public ResponseEntity<Long> getCommentCountByPostId(@PathVariable Long postId) {
        long count = commentService.getCommentCountByPostId(postId);
        return ResponseEntity.ok(count);
    }
    
    @GetMapping("/{commentId}/replies/count")
    public ResponseEntity<Long> getReplyCountByCommentId(@PathVariable Long commentId) {
        long count = commentService.getReplyCountByCommentId(commentId);
        return ResponseEntity.ok(count);
    }
}