package org.example.quoraproject.services;

import org.example.quoraproject.dtos.PostDTO;
import org.example.quoraproject.models.Community;
import org.example.quoraproject.models.Post;
import org.example.quoraproject.models.User;
import org.example.quoraproject.repositories.CommunityRepository;
import org.example.quoraproject.repositories.PostRepository;
import org.example.quoraproject.repositories.PostVoteRepository;
import org.example.quoraproject.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PostService {
    

    @Autowired
    private PostVoteRepository postVoteRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CommunityRepository communityRepository;
    
    public Page<Post> getAllPosts(int page, int size) {
        return postRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }
    
    public Page<Post> getHotPosts(int page, int size) {
        return postRepository.findHotPosts(PageRequest.of(page, size));
    }
    
    public Page<Post> getTopPosts(int page, int size) {
        return postRepository.findAllByOrderByScoreDesc(PageRequest.of(page, size));
    }
    
    public Page<Post> getNewPosts(int page, int size) {
        return postRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }
    
    public Page<Post> getPostsByCommunity(Long communityId, int page, int size) {
        return postRepository.findByCommunityId(communityId, PageRequest.of(page, size));
    }
    
    public Page<Post> getFeedForUser(Long userId, int page, int size) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Long> communityIds = user.getJoinedCommunities().stream()
                .map(Community::getId)
                .collect(Collectors.toList());
        
        if (communityIds.isEmpty()) {
            // If user hasn't joined any communities, show all posts
            return getAllPosts(page, size);
        }
        
        return postRepository.findByJoinedCommunities(communityIds, PageRequest.of(page, size));
    }
    
    public Optional<Post> getPostById(Long id) {
        return postRepository.findById(id);
    }
    
    public Post createPost(PostDTO postDTO) {
        User user = userRepository.findById(postDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Community community = communityRepository.findById(postDTO.getCommunityId())
                .orElseThrow(() -> new RuntimeException("Community not found"));
        
        Post post = new Post();
        post.setTitle(postDTO.getTitle());
        post.setContent(postDTO.getContent());
        post.setUrl(postDTO.getUrl());
        post.setImageUrl(postDTO.getImageUrl());
        post.setType(postDTO.getType() != null ? postDTO.getType() : Post.PostType.TEXT);
        post.setUser(user);
        post.setCommunity(community);
        
        return postRepository.save(post);
    }
    
    public Page<Post> searchPosts(String query, int page, int size) {
        return postRepository.searchPosts(query, PageRequest.of(page, size));
    }
    
    public Post updatePost(Long id, PostDTO postDTO) {
        Optional<Post> existingPost = postRepository.findById(id);
        if (existingPost.isEmpty()) {
            throw new RuntimeException("Post not found");
        }
        
        Post post = existingPost.get();
        
        // Verify user ownership
        if (!post.getUser().getId().equals(postDTO.getUserId())) {
            throw new RuntimeException("You can only edit your own posts");
        }
        
        post.setTitle(postDTO.getTitle());
        post.setContent(postDTO.getContent());
        post.setUrl(postDTO.getUrl());
        post.setImageUrl(postDTO.getImageUrl());
        if (postDTO.getType() != null) {
            post.setType(postDTO.getType());
        }
        
        return postRepository.save(post);
    }
    
    public void updateCommentCount(Long postId) {
        Optional<Post> postOpt = postRepository.findById(postId);
        if (postOpt.isPresent()) {
            Post post = postOpt.get();
            int commentCount = post.getComments() != null ? post.getComments().size() : 0;
            post.setCommentCount(commentCount);
            postRepository.save(post);
        }
    }
        
    @Autowired
    private PostRepository postRepository;

    @Transactional
    public void deletePost(Long id) {
    // This will delete the post and all its relationships due to the CASCADE settings
    postRepository.deletePostAndRelations(id);
    }
    
    public void refreshAllCommentCounts() {
        List<Post> allPosts = postRepository.findAll();
        for (Post post : allPosts) {
            updateCommentCount(post.getId());
        }
    }
    
    private void refreshPostVoteCounts(Post post) {
        // This method would recalculate vote counts from the votes table
        // For now, we'll just save the post to trigger any database calculations
        postRepository.save(post);
    }
}