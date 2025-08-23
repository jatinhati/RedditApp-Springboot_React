package org.example.quoraproject.dtos;

import lombok.Data;

@Data
public class CommunityDTO {
    private Long id;
    private String name;
    private String displayName;
    private String description;
    private String profileImageUrl;
    private Long creatorId;
}