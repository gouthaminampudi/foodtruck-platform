package com.foodtruck.modules.auth.service;

import com.foodtruck.modules.customer.domain.AppUser;
import com.foodtruck.modules.customer.repository.AppUserRepository;
import java.util.Locale;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrapService implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.auth.admin.username:admin}")
    private String adminUsername;

    @Value("${app.auth.admin.email:admin@foodtruck.local}")
    private String adminEmail;

    @Value("${app.auth.admin.password:Admin1234}")
    private String adminPassword;

    public AdminBootstrapService(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String normalizedUsername = adminUsername.trim().toLowerCase(Locale.ROOT);
        String normalizedEmail = adminEmail.trim().toLowerCase(Locale.ROOT);
        if (appUserRepository.existsByUsernameIgnoreCase(normalizedUsername)) {
            return;
        }
        AppUser admin = new AppUser();
        admin.setId(UUID.randomUUID());
        admin.setUsername(normalizedUsername);
        admin.setEmail(normalizedEmail);
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setRole(AuthService.ROLE_ADMIN);
        admin.setIsActive(true);
        appUserRepository.save(admin);
    }
}
