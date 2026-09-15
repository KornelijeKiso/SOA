package com.example.stakeholders.dto;

public class ProfileResponse {

    private String username;
    private String email;
    private String role;

    private String firstName;
    private String lastName;
    private String profileImageUrl;
    private String biography;
    private String motto;

    public ProfileResponse() {
    }

    public ProfileResponse(
            String username,
            String email,
            String role,
            String firstName,
            String lastName,
            String profileImageUrl,
            String biography,
            String motto
    ) {
        this.username = username;
        this.email = email;
        this.role = role;
        this.firstName = firstName;
        this.lastName = lastName;
        this.profileImageUrl = profileImageUrl;
        this.biography = biography;
        this.motto = motto;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public String getBiography() {
        return biography;
    }

    public String getMotto() {
        return motto;
    }
}