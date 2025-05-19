package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO (Data Transfer Object) pour les événements
 * Utilisé pour l'échange de données entre le frontend et le backend
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvenementDTO {

    private Long id;
    
    @NotBlank(message = "Le titre est obligatoire")
    private String titre;
    
    private String description;
    
    @NotNull(message = "La date de début est obligatoire")
    private LocalDateTime dateDebut;
    
    @NotNull(message = "La date de fin est obligatoire")
    private LocalDateTime dateFin;
    
    private String couleurFond = "#4F46E5"; // Indigo par défaut
    
    private String couleurTexte = "#FFFFFF"; // Blanc par défaut
    
    private String lieu;
    
    private boolean estJourneeEntiere = false;
    
    private Long userId;
} 