package com.example.demo.controller;

import com.example.demo.dto.JwtResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.MessageResponse;
import com.example.demo.dto.SignupRequest;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.jwt.JwtUtils;
import com.example.demo.service.impl.UserDetailsImpl;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        logger.info("Tentative de connexion pour l'utilisateur: {}", loginRequest.getUsername());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Log user details to help with debugging
        logger.info("Utilisateur authentifié: {}", userDetails.getUsername());
        logger.info("Rôles bruts: {}", userDetails.getAuthorities());
        
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        
        logger.info("Rôles extraits: {}", roles);
        
        // Ensure roles have the ROLE_ prefix if they don't already
        List<String> formattedRoles = roles.stream()
                .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                .collect(Collectors.toList());
        
        logger.info("Rôles formatés: {}", formattedRoles);
        
        JwtResponse response = new JwtResponse(
            jwt,
            userDetails.getId(), 
            userDetails.getUsername(), 
            userDetails.getEmail(), 
            formattedRoles
        );
        
        logger.info("Réponse JWT générée avec succès: token={} (tronqué), roles={}", 
            jwt.substring(0, Math.min(20, jwt.length())), formattedRoles);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        logger.info("Tentative d'inscription pour l'utilisateur: {}", signUpRequest.getUsername());
        
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            logger.warn("Inscription échouée: nom d'utilisateur déjà pris: {}", signUpRequest.getUsername());
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Erreur: Ce nom d'utilisateur est déjà pris!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            logger.warn("Inscription échouée: email déjà utilisé: {}", signUpRequest.getEmail());
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Erreur: Cet email est déjà utilisé!"));
        }

        // Create new user's account
        User user = new User(signUpRequest.getUsername(), 
                             signUpRequest.getEmail(),
                             encoder.encode(signUpRequest.getPassword()));

        Set<String> strRoles = signUpRequest.getRoles();
        Set<String> roles = new HashSet<>();

        if (strRoles == null || strRoles.isEmpty()) {
            roles.add("ROLE_USER");
        } else {
            strRoles.forEach(role -> {
                // Ensure roles have the ROLE_ prefix
                if (!role.startsWith("ROLE_")) {
                    roles.add("ROLE_" + role);
                } else {
                    roles.add(role);
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);
        
        logger.info("Utilisateur enregistré avec succès: {}, rôles: {}", user.getUsername(), roles);

        return ResponseEntity.ok(new MessageResponse("Utilisateur enregistré avec succès!"));
    }
} 