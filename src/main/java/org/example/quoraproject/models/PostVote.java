package org.example.quoraproject.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.transaction.annotation.Transactional;


@Data
@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "post_votes", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "post_id"}))
public class PostVote extends BaseModel {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties("votes")
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnoreProperties("votes")
    private Post post;
    
    @Enumerated(EnumType.STRING)
    private VoteType voteType;
    
    public enum VoteType {
        UPVOTE, DOWNVOTE
    }
}