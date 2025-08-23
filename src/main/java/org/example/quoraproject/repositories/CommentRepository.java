package org.example.quoraproject.repositories;

import org.example.quoraproject.models.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    Page<Comment> findByPostId(Long postId, Pageable pageable);
    List<Comment> findByPostId(Long postId);
    Page<Comment> findByPostIdAndParentCommentIsNull(Long postId, Pageable pageable);
    Page<Comment> findByParentCommentId(Long parentCommentId, Pageable pageable);
    List<Comment> findByParentCommentId(Long parentCommentId);
    
    // Count methods for better performance
    long countByPostId(Long postId);
    long countByParentCommentId(Long parentCommentId);
    
    // Find all nested comments under a parent (for deletion purposes)
    @Query("SELECT c FROM Comment c WHERE c.parentComment.id = :parentId")
    List<Comment> findAllNestedComments(@Param("parentId") Long parentId);
}