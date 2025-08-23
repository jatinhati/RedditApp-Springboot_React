package org.example.quoraproject.repositories;

import org.example.quoraproject.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    
    @Query("SELECT u FROM User u JOIN u.joinedCommunities c WHERE c.id = :communityId")
    Page<User> findByCommunityId(@Param("communityId") Long communityId, Pageable pageable);
}

