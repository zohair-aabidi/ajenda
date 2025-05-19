package com.example.demo.service;

import com.example.demo.dto.EvenementDTO;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Interface de service pour la gestion des événements
 */
public interface EvenementService {
    
    /**
     * Crée un nouvel événement
     * @param evenementDTO Les données de l'événement
     * @return L'événement créé
     */
    EvenementDTO creerEvenement(EvenementDTO evenementDTO);
    
    /**
     * Récupère un événement par son id
     * @param id L'id de l'événement
     * @return L'événement trouvé ou null
     */
    EvenementDTO getEvenementById(Long id);
    
    /**
     * Met à jour un événement existant
     * @param id L'id de l'événement à mettre à jour
     * @param evenementDTO Les nouvelles données
     * @return L'événement mis à jour
     */
    EvenementDTO mettreAJourEvenement(Long id, EvenementDTO evenementDTO);
    
    /**
     * Supprime un événement
     * @param id L'id de l'événement à supprimer
     */
    void supprimerEvenement(Long id);
    
    /**
     * Récupère tous les événements
     * @return Liste de tous les événements
     */
    List<EvenementDTO> getTousLesEvenements();
    
    /**
     * Récupère les événements dans une plage de dates
     * @param debut Date de début
     * @param fin Date de fin
     * @return Liste des événements dans cette plage
     */
    List<EvenementDTO> getEvenementsParPlageDeDates(LocalDateTime debut, LocalDateTime fin);
    
    /**
     * Recherche d'événements par mot clé
     * @param motCle Mot clé à rechercher
     * @return Liste des événements correspondants
     */
    List<EvenementDTO> rechercherEvenements(String motCle);
    
    /**
     * Récupère tous les événements d'un utilisateur
     * @param userId ID de l'utilisateur
     * @return Liste des événements de l'utilisateur
     */
    List<EvenementDTO> getEvenementsParUtilisateur(Long userId);
    
    /**
     * Récupère les événements d'un utilisateur dans une plage de dates
     * @param userId ID de l'utilisateur
     * @param debut Date de début
     * @param fin Date de fin
     * @return Liste des événements de l'utilisateur dans cette plage
     */
    List<EvenementDTO> getEvenementsParUtilisateurEtPlageDeDates(Long userId, LocalDateTime debut, LocalDateTime fin);
    
    /**
     * Recherche d'événements d'un utilisateur par mot clé
     * @param userId ID de l'utilisateur
     * @param motCle Mot clé à rechercher
     * @return Liste des événements correspondants
     */
    List<EvenementDTO> rechercherEvenementsParUtilisateur(Long userId, String motCle);
} 