package id.tokobapak.userservice.repository;

import id.tokobapak.userservice.domain.User;
import id.tokobapak.userservice.domain.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndIsActiveTrue(String email);

    Optional<User> findByIdAndIsActiveTrue(UUID id);

    boolean existsByEmail(String email);

    Page<User> findAllByIsActiveTrue(Pageable pageable);

    Page<User> findAllByRoleAndIsActiveTrue(UserRole role, Pageable pageable);
}
