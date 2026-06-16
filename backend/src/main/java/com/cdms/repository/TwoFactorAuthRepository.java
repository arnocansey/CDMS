package com.cdms.repository;

import com.cdms.entity.TwoFactorAuth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TwoFactorAuthRepository extends JpaRepository<TwoFactorAuth, Long> {
    Optional<TwoFactorAuth> findByUserId(Long userId);
    Optional<TwoFactorAuth> findByUserIdAndEnabled(Long userId, boolean enabled);
}
