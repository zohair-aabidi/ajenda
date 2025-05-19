package com.example.demo.controller;

import com.example.demo.dto.EvenementDTO;
import com.example.demo.service.EvenementService;
import com.example.demo.service.impl.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Contrôleur REST pour la gestion des événements
 */
@RestController
@RequestMapping("/api/evenements")
@CrossOrigin(origins = "*")
public class EvenementController {

    private final EvenementService evenementService;

    @Autowired
    public EvenementController(EvenementService evenementService) {
        this.evenementService = evenementService;
    }

    /**
     * Crée un nouvel événement
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EvenementDTO> creerEvenement(
            @Valid @RequestBody EvenementDTO evenementDTO,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        evenementDTO.setUserId(userDetails.getId());
        return new ResponseEntity<>(evenementService.creerEvenement(evenementDTO), HttpStatus.CREATED);
    }

    /**
     * Récupère un événement par son id
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EvenementDTO> getEvenement(@PathVariable Long id) {
        return ResponseEntity.ok(evenementService.getEvenementById(id));
    }

    /**
     * Met à jour un événement existant
     */
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EvenementDTO> mettreAJourEvenement(
            @PathVariable Long id, 
            @Valid @RequestBody EvenementDTO evenementDTO,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        // Vérifier que l'événement appartient à l'utilisateur connecté
        EvenementDTO existingEvent = evenementService.getEvenementById(id);
        if (!existingEvent.getUserId().equals(userDetails.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        evenementDTO.setUserId(userDetails.getId());
        return ResponseEntity.ok(evenementService.mettreAJourEvenement(id, evenementDTO));
    }

    /**
     * Supprime un événement
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> supprimerEvenement(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        // Vérifier que l'événement appartient à l'utilisateur connecté
        EvenementDTO existingEvent = evenementService.getEvenementById(id);
        if (!existingEvent.getUserId().equals(userDetails.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        evenementService.supprimerEvenement(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Récupère tous les événements de l'utilisateur connecté
     */
    @GetMapping("/mes-evenements")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EvenementDTO>> getMesEvenements(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(evenementService.getEvenementsParUtilisateur(userDetails.getId()));
    }

    /**
     * Récupère les événements de l'utilisateur connecté dans une plage de dates
     */
    @GetMapping("/mes-evenements/plage")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EvenementDTO>> getMesEvenementsParPlage(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(evenementService.getEvenementsParUtilisateurEtPlageDeDates(
                userDetails.getId(), debut, fin));
    }

    /**
     * Recherche d'événements de l'utilisateur connecté par mot clé
     */
    @GetMapping("/mes-evenements/recherche")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EvenementDTO>> rechercherMesEvenements(
            @RequestParam String motCle,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(evenementService.rechercherEvenementsParUtilisateur(
                userDetails.getId(), motCle));
    }
    
    /**
     * Récupère tous les événements (admin)
     */
    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<EvenementDTO>> getTousLesEvenements() {
        return ResponseEntity.ok(evenementService.getTousLesEvenements());
    }

    /**
     * Récupère les événements dans une plage de dates (admin)
     */
    @GetMapping("/plage")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<EvenementDTO>> getEvenementsParPlage(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        return ResponseEntity.ok(evenementService.getEvenementsParPlageDeDates(debut, fin));
    }

    /**
     * Recherche d'événements par mot clé (admin)
     */
    @GetMapping("/recherche")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<EvenementDTO>> rechercherEvenements(@RequestParam String motCle) {
        return ResponseEntity.ok(evenementService.rechercherEvenements(motCle));
    }
} 