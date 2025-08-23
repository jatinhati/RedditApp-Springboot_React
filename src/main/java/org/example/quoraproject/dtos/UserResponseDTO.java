package org.example.quoraproject.dtos;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserResponseDTO {
    private Long id;
    private String username;
    private String email;
    private int karma;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}