package org.example.quoraproject.dtos;

import lombok.Data;
import org.example.quoraproject.models.Post;

@Data
public class PostDTO {
    private Long id;
    private String title;
    private String content;
    private String url;
    private String imageUrl;
    private Post.PostType type;
    private Long userId;
    private Long communityId;
}