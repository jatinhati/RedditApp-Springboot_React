package org.example.quoraproject.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.Set;

@Data
@EqualsAndHashCode(callSuper=false, onlyExplicitlyIncluded = true)
@Entity
@Table(name = "communities")
public class Community extends BaseModel {
    @Column(unique = true, nullable = false)
    @EqualsAndHashCode.Include
    private String name; // e.g., "technology"
    
    @Column(nullable = false)
    private String displayName; // e.g., "r/technology"
    
    private String description;
    
    private String profileImageUrl;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id")
    @JsonIgnore
    private User creator;
    
    @ManyToMany(mappedBy = "joinedCommunities")
    @JsonIgnore
    @ToString.Exclude
    private Set<User> members;
    
    @OneToMany(mappedBy = "community", cascade = CascadeType.ALL)
    @JsonIgnore
    @ToString.Exclude
    private Set<Post> posts;
    
    private int memberCount = 0;
}