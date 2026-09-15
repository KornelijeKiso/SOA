package com.example.stakeholders.service;

import com.example.stakeholders.dto.ProfileResponse;
import com.example.stakeholders.dto.UpdateProfileRequest;
import com.example.stakeholders.model.User;
import com.example.stakeholders.repository.UserRepository;

import org.springframework.stereotype.Service;

@Service
public class ProfileService {

    private final UserRepository userRepository;

    public ProfileService(
            UserRepository userRepository
    ) {
        this.userRepository = userRepository;
    }

    public ProfileResponse getProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return new ProfileResponse(
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.getFirstName(),
                user.getLastName(),
                user.getProfileImageUrl(),
                user.getBiography(),
                user.getMotto()
        );
    }

    public ProfileResponse updateProfile(
            String email,
            UpdateProfileRequest request
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setProfileImageUrl(request.getProfileImageUrl());
        user.setBiography(request.getBiography());
        user.setMotto(request.getMotto());

        userRepository.save(user);

        return new ProfileResponse(
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.getFirstName(),
                user.getLastName(),
                user.getProfileImageUrl(),
                user.getBiography(),
                user.getMotto()
        );
    }
}
