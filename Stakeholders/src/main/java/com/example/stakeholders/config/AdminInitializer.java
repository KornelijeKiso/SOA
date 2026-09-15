package com.example.stakeholders.config;

import com.example.stakeholders.model.Role;
import com.example.stakeholders.model.User;
import com.example.stakeholders.repository.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        String adminEmail = "admin@admin.com";

        if (!userRepository.existsByEmail(adminEmail)) {

            User admin = new User(
                    "admin",
                    adminEmail,
                    passwordEncoder.encode("admin123"),
                    Role.ADMIN
            );

            userRepository.save(admin);

            System.out.println("Admin user created");
        }
    }
}
