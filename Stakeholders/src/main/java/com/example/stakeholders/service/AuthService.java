package com.example.stakeholders.service;

import com.example.stakeholders.dto.AuthResponse;
import com.example.stakeholders.dto.LoginRequest;
import com.example.stakeholders.dto.RegisterRequest;
import com.example.stakeholders.model.Role;
import com.example.stakeholders.model.User;
import com.example.stakeholders.repository.UserRepository;
import com.example.stakeholders.security.JwtService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Role role = Role.valueOf(request.getRole().toUpperCase());

        if (role == Role.ADMIN) {
            throw new RuntimeException(
                    "Admin registration not allowed");
        }

        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                role
        );

        user = userRepository.save(user);

        String token =
                jwtService.generateToken(user);

        return new AuthResponse(token);
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(
                        request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new RuntimeException("Invalid password");
        }

        String token =
                jwtService.generateToken(user);

        return new AuthResponse(token);
    }
}