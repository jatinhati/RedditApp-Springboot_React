package org.example.quoraproject.dtos;

import lombok.Data;

@Data
public class VoteDTO {
    private Long userId;
    private Long postId;
    private Long commentId;
    private String voteType; // "UPVOTE" or "DOWNVOTE"
}