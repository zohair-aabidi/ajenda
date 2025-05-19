package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Classe modèle représentant un événement dans l'agenda
 */
@Entity
@Table(name = "evenements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Evenement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le titre est obligatoire")
    @Column(nullable = false)
    private String titre;

    @Column(length = 1000)
    private String description;

    @NotNull(message = "La date de début est obligatoire")
    @Column(name = "date_debut", nullable = false)
    private LocalDateTime dateDebut;

    @NotNull(message = "La date de fin est obligatoire")
    @Column(name = "date_fin", nullable = false)
    private LocalDateTime dateFin;

    @Column(name = "couleur_fond")
    private String couleurFond = "#4F46E5"; // Indigo par défaut

    @Column(name = "couleur_texte")
    private String couleurTexte = "#FFFFFF"; // Blanc par défaut

    @Column(name = "lieu")
    private String lieu;
    
    @Column(name = "est_journee_entiere")
    private boolean estJourneeEntiere = false;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
} 