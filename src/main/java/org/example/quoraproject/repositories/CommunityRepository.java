package org.example.quoraproject.repositories;

import org.example.quoraproject.models.Community;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommunityRepository extends JpaRepository<Community, Long> {
    Optional<Community> findByName(String name);
    
    @Query("SELECT c FROM Community c WHERE c.name LIKE %:query% OR c.displayName LIKE %:query% OR c.description LIKE %:query%")
    Page<Community> searchCommunities(String query, Pageable pageable);
    
    Page<Community> findAllByOrderByMemberCountDesc(Pageable pageable);
}