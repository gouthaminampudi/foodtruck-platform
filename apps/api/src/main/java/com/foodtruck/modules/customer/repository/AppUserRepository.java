package com.foodtruck.modules.customer.repository;

import com.foodtruck.modules.customer.domain.AppUser;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppUserRepository extends JpaRepository<AppUser, UUID> {

    boolean existsByEmailIgnoreCase(String email);
    boolean existsByUsernameIgnoreCase(String username);
    Optional<AppUser> findByUsernameIgnoreCase(String username);
}
