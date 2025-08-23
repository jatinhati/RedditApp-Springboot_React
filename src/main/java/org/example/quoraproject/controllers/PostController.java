package org.example.quoraproject.controllers;

import org.example.quoraproject.dtos.PostDTO;
import org.example.quoraproject.models.Post;
import org.example.quoraproject.services.PostService;
import org.example.quoraproject.services.FileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;

import java.io.IOException;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/posts")
@CrossOrigin(origins = "*")
public class PostController {
    
    @Autowired
    private PostService postService;
    
    @Autowired
    private FileUploadService fileUploadService;
    
    @GetMapping
    public Page<Post> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return postService.getAllPosts(page, size);
    }
    
    @GetMapping("/hot")
    public Page<Post> getHotPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return postService.getHotPosts(page, size);
    }
    
    @GetMapping("/top")
    public Page<Post> getTopPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return postService.getTopPosts(page, size);
    }
    
    @GetMapping("/new")
    public Page<Post> getNewPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return postService.getNewPosts(page, size);
    }
    
    @GetMapping("/community/{communityId}")
    public Page<Post> getPostsByCommunity(
            @PathVariable Long communityId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return postService.getPostsByCommunity(communityId, page, size);
    }
    
    @GetMapping("/feed/{userId}")
    public Page<Post> getFeedForUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return postService.getFeedForUser(userId, page, size);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Long id) {
        Optional<Post> post = postService.getPostById(id);
        return post.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody PostDTO postDTO) {
        try {
            // Validate input
            if (postDTO.getTitle() == null || postDTO.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Post title is required");
            }
            if (postDTO.getUserId() == null) {
                return ResponseEntity.badRequest().body("User ID is required");
            }
            if (postDTO.getCommunityId() == null) {
                return ResponseEntity.badRequest().body("Community ID is required");
            }
            
            Post post = postService.createPost(postDTO);
            return ResponseEntity.ok(post);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to create post: " + e.getMessage());
        }
    }
    
    @GetMapping("/search")
    public Page<Post> searchPosts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return postService.searchPosts(query, page, size);
    }
    
    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(@RequestParam("image") MultipartFile file) {
        try {
            String imageUrl = fileUploadService.uploadImage(file);
            // Return JSON response
            return ResponseEntity.ok(new ImageUploadResponse(imageUrl));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Failed to upload image: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/image/{filename}")
    public ResponseEntity<?> getImage(@PathVariable String filename) {
        try {
            return fileUploadService.getImage(filename);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Inner class for JSON response
    public static class ImageUploadResponse {
        private String imageUrl;
        
        public ImageUploadResponse(String imageUrl) {
            this.imageUrl = imageUrl;
        }
        
        public String getImageUrl() {
            return imageUrl;
        }
        
        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(@PathVariable Long id, @RequestBody PostDTO postDTO) {
        try {
            // Validate input
            if (postDTO.getTitle() == null || postDTO.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Post title is required");
            }
            if (postDTO.getUserId() == null) {
                return ResponseEntity.badRequest().body("User ID is required");
            }
            
            Post post = postService.updatePost(id, postDTO);
            return ResponseEntity.ok(post);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to update post: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id, Authentication authentication) {
        try {
            // Check if user is authenticated
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            
            // Get the authenticated user
            String username = authentication.getName();
            
            // Check if the post exists and if the user owns it
            Optional<Post> postOptional = postService.getPostById(id);
            if (postOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Post post = postOptional.get();
            
            if (!post.getUser().getUsername().equals(username)) {
                return ResponseEntity.status(403).body("You can only delete your own posts");
            }
            
            postService.deletePost(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to delete post: " + e.getMessage());
        }
    }
}