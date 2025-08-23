package org.example.quoraproject.dtos;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CommunityResponseDTO {
    private Long id;
    private String name;
    private String displayName;
    private String description;
    private int memberCount;
    private String profileImageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Creator info without circular reference
    private Long creatorId;
    private String creatorUsername;
}