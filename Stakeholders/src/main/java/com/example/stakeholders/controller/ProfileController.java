package com.example.stakeholders.controller;

import com.example.stakeholders.dto.ProfileResponse;
import com.example.stakeholders.dto.UpdateProfileRequest;
import com.example.stakeholders.service.ProfileService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(
            ProfileService profileService
    ) {
        this.profileService = profileService;
    }

    @GetMapping("/me")
    public ProfileResponse getMyProfile(
            Authentication authentication
    ) {

        String email = authentication.getName();

        return profileService.getProfile(email);
    }

    @PutMapping("/me")
    public ProfileResponse updateMyProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request
    ) {

        String email = authentication.getName();

        return profileService.updateProfile(
                email,
                request
        );
    }
}