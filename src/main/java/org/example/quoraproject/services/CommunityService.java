package org.example.quoraproject.services;

import org.example.quoraproject.dtos.CommunityDTO;
import org.example.quoraproject.models.Community;
import org.example.quoraproject.models.User;
import org.example.quoraproject.repositories.CommunityRepository;
import org.example.quoraproject.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CommunityService {
    
    @Autowired
    private CommunityRepository communityRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<Community> getAllCommunities() {
        return communityRepository.findAll();
    }
    
    public Page<Community> getAllCommunities(int page, int size) {
        return communityRepository.findAll(PageRequest.of(page, size));
    }
    
    public Page<Community> getPopularCommunities(int page, int size) {
        return communityRepository.findAllByOrderByMemberCountDesc(PageRequest.of(page, size));
    }
    
    public Optional<Community> getCommunityById(Long id) {
        return communityRepository.findById(id);
    }
    
    public Optional<Community> getCommunityByName(String name) {
        return communityRepository.findByName(name);
    }
    
    @Transactional
    public Community createCommunity(CommunityDTO communityDTO) {
        if (communityRepository.findByName(communityDTO.getName()).isPresent()) {
            throw new RuntimeException("Community name already exists");
        }
        
        User creator = userRepository.findById(communityDTO.getCreatorId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Community community = new Community();
        community.setName(communityDTO.getName());
        
        if (communityDTO.getDisplayName() != null && !communityDTO.getDisplayName().trim().isEmpty()) {
            community.setDisplayName(communityDTO.getDisplayName().trim());
        } else {
            community.setDisplayName("r/" + communityDTO.getName());
        }
        
        community.setDescription(communityDTO.getDescription());
        community.setCreator(creator);
        community.setMemberCount(1);
        
        Community savedCommunity = communityRepository.save(community);
        
        try {
            joinCommunity(creator.getId(), savedCommunity.getId());
        } catch (Exception e) {
            System.err.println("Failed to auto-join creator to community: " + e.getMessage());
        }
        
        return savedCommunity;
    }
    
    @Transactional
    public void joinCommunity(Long userId, Long communityId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new RuntimeException("Community not found"));
        
        if (user.getJoinedCommunities() == null) {
            user.setJoinedCommunities(new java.util.HashSet<>());
        }
        
        if (!user.getJoinedCommunities().contains(community)) {
            user.getJoinedCommunities().add(community);
            community.setMemberCount(community.getMemberCount() + 1);
            
            communityRepository.save(community);
            userRepository.save(user);
        }
    }
    
    @Transactional
    public void leaveCommunity(Long userId, Long communityId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new RuntimeException("Community not found"));
        
        if (user.getJoinedCommunities().contains(community)) {
            user.getJoinedCommunities().remove(community);
            community.setMemberCount(Math.max(0, community.getMemberCount() - 1));
            userRepository.save(user);
            communityRepository.save(community);
        }
    }
    
    public Page<Community> searchCommunities(String query, int page, int size) {
        return communityRepository.searchCommunities(query, PageRequest.of(page, size));
    }
    
    public Page<User> getCommunityMembers(Long communityId, int page, int size) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new RuntimeException("Community not found"));
        
        return userRepository.findByCommunityId(communityId, PageRequest.of(page, size));
    }
    
    public Page<User> getCommunityMembersByName(String communityName, int page, int size) {
        Community community = communityRepository.findByName(communityName)
                .orElseThrow(() -> new RuntimeException("Community not found"));
        
        return userRepository.findByCommunityId(community.getId(), PageRequest.of(page, size));
    }

    public void deleteCommunity(Long id) {
        communityRepository.deleteById(id);
    }
}