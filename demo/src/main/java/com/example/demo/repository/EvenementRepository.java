package com.example.demo.repository;

import com.example.demo.model.Evenement;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository pour l'accès aux données des événements
 */
@Repository
public interface EvenementRepository extends JpaRepository<Evenement, Long> {
    
    /**
     * Trouve tous les événements qui se déroulent dans une plage de dates
     * @param debut Date de début de la plage
     * @param fin Date de fin de la plage
     * @return Liste des événements dans cette plage
     */
    @Query("SELECT e FROM Evenement e WHERE " +
           "(e.dateDebut BETWEEN ?1 AND ?2) OR " +
           "(e.dateFin BETWEEN ?1 AND ?2) OR " +
           "(e.dateDebut <= ?1 AND e.dateFin >= ?2)")
    List<Evenement> findByDateDebutAndDateFin(LocalDateTime debut, LocalDateTime fin);
    
    /**
     * Recherche d'événements par mot clé dans le titre ou la description
     * @param motCle Mot clé à rechercher
     * @return Liste des événements correspondants
     */
    List<Evenement> findByTitreContainingOrDescriptionContaining(String motCle, String memeMotCle);
    
    /**
     * Trouve tous les événements d'un utilisateur
     * @param user L'utilisateur propriétaire des événements
     * @return Liste des événements de l'utilisateur
     */
    List<Evenement> findByUser(User user);
    
    /**
     * Trouve tous les événements d'un utilisateur dans une plage de dates
     * @param user L'utilisateur propriétaire des événements
     * @param debut Date de début de la plage
     * @param fin Date de fin de la plage
     * @return Liste des événements de l'utilisateur dans cette plage
     */
    @Query("SELECT e FROM Evenement e WHERE e.user = ?1 AND " +
           "((e.dateDebut BETWEEN ?2 AND ?3) OR " +
           "(e.dateFin BETWEEN ?2 AND ?3) OR " +
           "(e.dateDebut <= ?2 AND e.dateFin >= ?3))")
    List<Evenement> findByUserAndDateDebutAndDateFin(User user, LocalDateTime debut, LocalDateTime fin);
    
    /**
     * Recherche d'événements d'un utilisateur par mot clé dans le titre ou la description
     * @param user L'utilisateur propriétaire des événements
     * @param motCle Mot clé à rechercher
     * @return Liste des événements correspondants
     */
    List<Evenement> findByUserAndTitreContainingOrUserAndDescriptionContaining(
        User user, String titreCle, User sameUser, String descriptionCle);
} 