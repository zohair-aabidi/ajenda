package com.example.demo.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/test")
public class TestController {
    private static final Logger logger = LoggerFactory.getLogger(TestController.class);
    
    @GetMapping("/all")
    public ResponseEntity<String> allAccess() {
        logger.info("Accès à l'endpoint public /api/test/all");
        return ResponseEntity.ok("Contenu public.");
    }
    
    @GetMapping("/user")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<String> userAccess() {
        logger.info("Accès à l'endpoint protégé /api/test/user");
        return ResponseEntity.ok("Contenu utilisateur.");
    }
    
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> adminAccess() {
        logger.info("Accès à l'endpoint protégé /api/test/admin");
        return ResponseEntity.ok("Contenu administrateur.");
    }
}