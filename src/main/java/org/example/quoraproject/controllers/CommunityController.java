package org.example.quoraproject.controllers;

import org.example.quoraproject.dtos.CommunityDTO;
import org.example.quoraproject.dtos.CommunityResponseDTO;
import org.example.quoraproject.dtos.UserResponseDTO;
import org.example.quoraproject.models.Community;
import org.example.quoraproject.models.User;
import org.example.quoraproject.services.CommunityService;
import org.example.quoraproject.utils.DTOMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/communities")
@CrossOrigin(origins = "*")
public class CommunityController {
    
    @Autowired
    private CommunityService communityService;
    
    @GetMapping
    public Page<CommunityResponseDTO> getAllCommunities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Community> communities = communityService.getAllCommunities(page, size);
        return DTOMapper.toCommunityResponseDTOPage(communities);
    }
    
    @GetMapping("/popular")
    public Page<CommunityResponseDTO> getPopularCommunities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Community> communities = communityService.getPopularCommunities(page, size);
        return DTOMapper.toCommunityResponseDTOPage(communities);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CommunityResponseDTO> getCommunityById(@PathVariable Long id) {
        Optional<Community> community = communityService.getCommunityById(id);
        return community.map(c -> ResponseEntity.ok(DTOMapper.toCommunityResponseDTO(c)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @GetMapping("/name/{name}")
    public ResponseEntity<CommunityResponseDTO> getCommunityByName(@PathVariable String name) {
        Optional<Community> community = communityService.getCommunityByName(name);
        return community.map(c -> ResponseEntity.ok(DTOMapper.toCommunityResponseDTO(c)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> createCommunity(@RequestBody CommunityDTO communityDTO) {
        try {
            // Validate input
            if (communityDTO.getName() == null || communityDTO.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Community name is required");
            }
            if (communityDTO.getCreatorId() == null) {
                return ResponseEntity.badRequest().body("Creator ID is required");
            }
            
            Community community = communityService.createCommunity(communityDTO);
            return ResponseEntity.ok(community);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to create community: " + e.getMessage());
        }
    }
    
    @PostMapping("/{communityId}/join/{userId}")
    public ResponseEntity<?> joinCommunity(@PathVariable Long communityId, @PathVariable Long userId) {
        try {
            communityService.joinCommunity(userId, communityId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/{communityId}/leave/{userId}")
    public ResponseEntity<?> leaveCommunity(@PathVariable Long communityId, @PathVariable Long userId) {
        try {
            communityService.leaveCommunity(userId, communityId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/search")
    public Page<Community> searchCommunities(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return communityService.searchCommunities(query, page, size);
    }
    
    @GetMapping("/{id}/members")
    public ResponseEntity<Page<User>> getCommunityMembers(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Page<User> members = communityService.getCommunityMembers(id, page, size);
            return ResponseEntity.ok(members);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/name/{name}/members")
    public ResponseEntity<Page<User>> getCommunityMembersByName(
            @PathVariable String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Page<User> members = communityService.getCommunityMembersByName(name, page, size);
            return ResponseEntity.ok(members);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCommunity(@PathVariable Long id) {
        communityService.deleteCommunity(id);
        return ResponseEntity.noContent().build();
    }
}