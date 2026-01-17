package id.tokobapak.userservice.service;

import id.tokobapak.userservice.domain.User;
import id.tokobapak.userservice.domain.UserRole;
import id.tokobapak.userservice.dto.CreateUserRequest;
import id.tokobapak.userservice.dto.PageResponse;
import id.tokobapak.userservice.dto.UpdateUserRequest;
import id.tokobapak.userservice.dto.UserResponse;
import id.tokobapak.userservice.exception.EmailAlreadyExistsException;
import id.tokobapak.userservice.exception.UserNotFoundException;
import id.tokobapak.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse createUser(CreateUserRequest request) {
        log.info("Creating user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .name(request.getName().trim())
                .phone(request.getPhone())
                .role(request.getRole() != null ? request.getRole() : UserRole.CUSTOMER)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User created successfully with ID: {}", savedUser.getId());

        return UserResponse.fromEntity(savedUser);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        User user = userRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));
        return UserResponse.fromEntity(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmailAndIsActiveTrue(email.toLowerCase().trim())
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
        return UserResponse.fromEntity(user);
    }

    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmailAndIsActiveTrue(email.toLowerCase().trim());
    }

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getAllUsers(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<User> userPage = userRepository.findAllByIsActiveTrue(pageable);

        return PageResponse.<UserResponse>builder()
                .content(userPage.getContent().stream()
                        .map(UserResponse::fromEntity)
                        .toList())
                .page(userPage.getNumber())
                .size(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .first(userPage.isFirst())
                .last(userPage.isLast())
                .build();
    }

    public UserResponse updateUser(UUID id, UpdateUserRequest request) {
        User user = userRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        User updatedUser = userRepository.save(user);
        log.info("User updated successfully: {}", id);

        return UserResponse.fromEntity(updatedUser);
    }

    public void deleteUser(UUID id) {
        User user = userRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));

        user.setIsActive(false);
        userRepository.save(user);
        log.info("User soft-deleted: {}", id);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email.toLowerCase().trim());
    }

    public void verifyUser(UUID id) {
        User user = userRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));

        user.setIsVerified(true);
        userRepository.save(user);
        log.info("User verified: {}", id);
    }
}
