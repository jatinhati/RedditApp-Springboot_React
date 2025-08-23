package org.example.quoraproject.repositories;

import org.example.quoraproject.models.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByCommunityId(Long communityId, Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE p.community.id IN :communityIds ORDER BY p.createdAt DESC")
    Page<Post> findByJoinedCommunities(@Param("communityIds") List<Long> communityIds, Pageable pageable);
    
    // Hot posts (high score + recent) - simplified version
    @Query("SELECT p FROM Post p ORDER BY p.score DESC, p.createdAt DESC")
    Page<Post> findHotPosts(Pageable pageable);
    
    // Top posts by score
    Page<Post> findAllByOrderByScoreDesc(Pageable pageable);
    
    @Modifying
    @Query("DELETE FROM Comment c WHERE c.post.id = :postId")
    @Transactional
    void deleteCommentsByPostId(@Param("postId") Long postId);
    
    @Modifying
    @Query("DELETE FROM PostVote pv WHERE pv.post.id = :postId")
    @Transactional
    void deleteVotesByPostId(@Param("postId") Long postId);
    
    @Modifying
    @Query("DELETE FROM Post p WHERE p.id = :postId")
    @Transactional
    void deletePostById(@Param("postId") Long postId);
    
    @Transactional
    default void deletePostAndRelations(Long postId) {
        deleteCommentsByPostId(postId);
        deleteVotesByPostId(postId);
        deletePostById(postId);
    }
    
    // New posts
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE p.title LIKE %:query% OR p.content LIKE %:query%")
    Page<Post> searchPosts(String query, Pageable pageable);
}