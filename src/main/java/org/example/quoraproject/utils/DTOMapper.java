package org.example.quoraproject.utils;

import org.example.quoraproject.dtos.CommunityResponseDTO;
import org.example.quoraproject.dtos.UserResponseDTO;
import org.example.quoraproject.models.Community;
import org.example.quoraproject.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

import java.util.List;
import java.util.stream.Collectors;

public class DTOMapper {
    
    public static CommunityResponseDTO toCommunityResponseDTO(Community community) {
        if (community == null) return null;
        
        CommunityResponseDTO dto = new CommunityResponseDTO();
        dto.setId(community.getId());
        dto.setName(community.getName());
        dto.setDisplayName(community.getDisplayName());
        dto.setDescription(community.getDescription());
        dto.setMemberCount(community.getMemberCount());
        dto.setProfileImageUrl(community.getProfileImageUrl());
        dto.setCreatedAt(community.getCreatedAt());
        dto.setUpdatedAt(community.getUpdatedAt());
        
        // Set creator info without circular reference
        if (community.getCreator() != null) {
            dto.setCreatorId(community.getCreator().getId());
            dto.setCreatorUsername(community.getCreator().getUsername());
        }
        
        return dto;
    }
    
    public static UserResponseDTO toUserResponseDTO(User user) {
        if (user == null) return null;
        
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setKarma(user.getKarma());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        
        return dto;
    }
    
    public static Page<CommunityResponseDTO> toCommunityResponseDTOPage(Page<Community> communityPage) {
        List<CommunityResponseDTO> dtos = communityPage.getContent().stream()
                .map(DTOMapper::toCommunityResponseDTO)
                .collect(Collectors.toList());
        
        return new PageImpl<>(dtos, communityPage.getPageable(), communityPage.getTotalElements());
    }
    
    public static Page<UserResponseDTO> toUserResponseDTOPage(Page<User> userPage) {
        List<UserResponseDTO> dtos = userPage.getContent().stream()
                .map(DTOMapper::toUserResponseDTO)
                .collect(Collectors.toList());
        
        return new PageImpl<>(dtos, userPage.getPageable(), userPage.getTotalElements());
    }
}