package com.foodtruck.modules.auth.service;

import com.foodtruck.modules.auth.api.dto.AuthResponse;
import com.foodtruck.modules.auth.api.dto.CustomerSignUpRequest;
import com.foodtruck.modules.auth.api.dto.OperatorSignUpRequest;
import com.foodtruck.modules.auth.api.dto.SignInRequest;
import com.foodtruck.modules.customer.api.dto.CustomerResponse;
import com.foodtruck.modules.customer.domain.AppUser;
import com.foodtruck.modules.customer.domain.CustomerProfile;
import com.foodtruck.modules.customer.repository.AppUserRepository;
import com.foodtruck.modules.customer.repository.CustomerProfileRepository;
import com.foodtruck.modules.operator.api.dto.OperatorProfileResponse;
import com.foodtruck.modules.operator.domain.OperatorProfile;
import com.foodtruck.modules.operator.repository.OperatorProfileRepository;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Locale;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    public static final String ROLE_CUSTOMER = "CUSTOMER";
    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_OPERATOR = "OPERATOR";

    private final AppUserRepository appUserRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final OperatorProfileRepository operatorProfileRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
        AppUserRepository appUserRepository,
        CustomerProfileRepository customerProfileRepository,
        OperatorProfileRepository operatorProfileRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.appUserRepository = appUserRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.operatorProfileRepository = operatorProfileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public CustomerResponse customerSignUp(CustomerSignUpRequest request) {
        if (!request.password().equals(request.confirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match");
        }

        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);
        String normalizedUsername = request.username().trim().toLowerCase(Locale.ROOT);

        if (appUserRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }
        if (appUserRepository.existsByUsernameIgnoreCase(normalizedUsername)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }

        UUID userId = UUID.randomUUID();

        AppUser appUser = new AppUser();
        appUser.setId(userId);
        appUser.setUsername(normalizedUsername);
        appUser.setEmail(normalizedEmail);
        appUser.setPasswordHash(passwordEncoder.encode(request.password()));
        appUser.setRole(ROLE_CUSTOMER);
        appUser.setIsActive(true);
        appUserRepository.save(appUser);

        CustomerProfile profile = new CustomerProfile();
        profile.setUserId(userId);
        profile.setFirstName(request.firstName().trim());
        profile.setLastName(request.lastName().trim());
        profile.setPhoneNumber(request.phoneNumber() == null ? null : request.phoneNumber().trim());
        customerProfileRepository.save(profile);

        return new CustomerResponse(
            appUser.getId(),
            appUser.getUsername(),
            appUser.getEmail(),
            appUser.getIsActive(),
            profile.getFirstName(),
            profile.getLastName(),
            profile.getPhoneNumber(),
            profile.getPreferredCuisines(),
            profile.getProfileImageUrl(),
            appUser.getCreatedAt(),
            profile.getUpdatedAt()
        );
    }

    public AuthResponse customerSignIn(SignInRequest request) {
        AppUser user = authenticate(request);
        if (!ROLE_CUSTOMER.equals(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customer access is required");
        }
        return buildAuthResponse(user, request.password());
    }

    public AuthResponse adminSignIn(SignInRequest request) {
        AppUser user = authenticate(request);
        if (!ROLE_ADMIN.equals(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access is required");
        }
        return buildAuthResponse(user, request.password());
    }

    @Transactional
    public OperatorProfileResponse operatorSignUp(OperatorSignUpRequest request) {
        if (!request.password().equals(request.confirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match");
        }

        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);
        String normalizedUsername = request.username().trim().toLowerCase(Locale.ROOT);

        if (appUserRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }
        if (appUserRepository.existsByUsernameIgnoreCase(normalizedUsername)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }

        UUID userId = UUID.randomUUID();
        AppUser appUser = new AppUser();
        appUser.setId(userId);
        appUser.setUsername(normalizedUsername);
        appUser.setEmail(normalizedEmail);
        appUser.setPasswordHash(passwordEncoder.encode(request.password()));
        appUser.setRole(ROLE_OPERATOR);
        appUser.setIsActive(true);
        appUserRepository.save(appUser);

        OperatorProfile profile = new OperatorProfile();
        profile.setUserId(userId);
        profile.setFirstName(request.firstName().trim());
        profile.setLastName(request.lastName().trim());
        profile.setPhoneNumber(request.phoneNumber() == null ? null : request.phoneNumber().trim());
        operatorProfileRepository.save(profile);

        return new OperatorProfileResponse(
            userId,
            appUser.getUsername(),
            appUser.getEmail(),
            appUser.getIsActive(),
            profile.getFirstName(),
            profile.getLastName(),
            profile.getPhoneNumber(),
            profile.getProfileImageUrl(),
            appUser.getCreatedAt(),
            profile.getUpdatedAt()
        );
    }

    public AuthResponse operatorSignIn(SignInRequest request) {
        AppUser user = authenticate(request);
        if (!ROLE_OPERATOR.equals(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Operator access is required");
        }
        return buildAuthResponse(user, request.password());
    }

    private AppUser authenticate(SignInRequest request) {
        AppUser user = appUserRepository.findByUsernameIgnoreCase(request.username().trim())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));
        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is inactive");
        }
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }
        return user;
    }

    private AuthResponse buildAuthResponse(AppUser user, String rawPassword) {
        String basicTokenValue = Base64.getEncoder()
            .encodeToString((user.getUsername() + ":" + rawPassword).getBytes(StandardCharsets.UTF_8));
        return new AuthResponse(
            user.getId(),
            user.getUsername(),
            user.getRole(),
            "Basic",
            basicTokenValue
        );
    }
}
