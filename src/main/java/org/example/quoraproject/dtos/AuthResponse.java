package org.example.quoraproject.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.example.quoraproject.models.User;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private User user;
}