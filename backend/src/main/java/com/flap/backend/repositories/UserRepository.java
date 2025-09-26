package com.flap.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.flap.backend.models.User;

public interface UserRepository extends JpaRepository<User, Long> {
}