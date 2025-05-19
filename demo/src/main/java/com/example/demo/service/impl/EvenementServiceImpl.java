package com.example.demo.service.impl;

import com.example.demo.dto.EvenementDTO;
import com.example.demo.model.Evenement;
import com.example.demo.model.User;
import com.example.demo.repository.EvenementRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.EvenementService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implémentation du service pour la gestion des événements
 */
@Service
public class EvenementServiceImpl implements EvenementService {

    private final EvenementRepository evenementRepository;
    private final UserRepository userRepository;

    @Autowired
    public EvenementServiceImpl(EvenementRepository evenementRepository, UserRepository userRepository) {
        this.evenementRepository = evenementRepository;
        this.userRepository = userRepository;
    }

    /**
     * Convertit un objet Evenement en EvenementDTO
     */
    private EvenementDTO convertToDTO(Evenement evenement) {
        EvenementDTO dto = new EvenementDTO();
        dto.setId(evenement.getId());
        dto.setTitre(evenement.getTitre());
        dto.setDescription(evenement.getDescription());
        dto.setDateDebut(evenement.getDateDebut());
        dto.setDateFin(evenement.getDateFin());
        dto.setCouleurFond(evenement.getCouleurFond());
        dto.setCouleurTexte(evenement.getCouleurTexte());
        dto.setLieu(evenement.getLieu());
        dto.setEstJourneeEntiere(evenement.isEstJourneeEntiere());
        if (evenement.getUser() != null) {
            dto.setUserId(evenement.getUser().getId());
        }
        return dto;
    }

    /**
     * Convertit un objet EvenementDTO en Evenement
     */
    private Evenement convertToEntity(EvenementDTO dto) {
        Evenement evenement = new Evenement();
        evenement.setId(dto.getId());
        evenement.setTitre(dto.getTitre());
        evenement.setDescription(dto.getDescription());
        evenement.setDateDebut(dto.getDateDebut());
        evenement.setDateFin(dto.getDateFin());
        evenement.setCouleurFond(dto.getCouleurFond());
        evenement.setCouleurTexte(dto.getCouleurTexte());
        evenement.setLieu(dto.getLieu());
        evenement.setEstJourneeEntiere(dto.isEstJourneeEntiere());
        
        if (dto.getUserId() != null) {
            User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé avec l'ID: " + dto.getUserId()));
            evenement.setUser(user);
        }
        
        return evenement;
    }

    @Override
    public EvenementDTO creerEvenement(EvenementDTO evenementDTO) {
        Evenement evenement = convertToEntity(evenementDTO);
        Evenement saved = evenementRepository.save(evenement);
        return convertToDTO(saved);
    }

    @Override
    public EvenementDTO getEvenementById(Long id) {
        return evenementRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new EntityNotFoundException("Événement non trouvé avec l'ID: " + id));
    }

    @Override
    public EvenementDTO mettreAJourEvenement(Long id, EvenementDTO evenementDTO) {
        if (!evenementRepository.existsById(id)) {
            throw new EntityNotFoundException("Événement non trouvé avec l'ID: " + id);
        }
        evenementDTO.setId(id);
        Evenement evenement = convertToEntity(evenementDTO);
        Evenement updated = evenementRepository.save(evenement);
        return convertToDTO(updated);
    }

    @Override
    public void supprimerEvenement(Long id) {
        if (!evenementRepository.existsById(id)) {
            throw new EntityNotFoundException("Événement non trouvé avec l'ID: " + id);
        }
        evenementRepository.deleteById(id);
    }

    @Override
    public List<EvenementDTO> getTousLesEvenements() {
        return evenementRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<EvenementDTO> getEvenementsParPlageDeDates(LocalDateTime debut, LocalDateTime fin) {
        return evenementRepository.findByDateDebutAndDateFin(debut, fin).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<EvenementDTO> rechercherEvenements(String motCle) {
        return evenementRepository.findByTitreContainingOrDescriptionContaining(motCle, motCle).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<EvenementDTO> getEvenementsParUtilisateur(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé avec l'ID: " + userId));
        
        return evenementRepository.findByUser(user).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<EvenementDTO> getEvenementsParUtilisateurEtPlageDeDates(Long userId, LocalDateTime debut, LocalDateTime fin) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé avec l'ID: " + userId));
        
        return evenementRepository.findByUserAndDateDebutAndDateFin(user, debut, fin).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<EvenementDTO> rechercherEvenementsParUtilisateur(Long userId, String motCle) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé avec l'ID: " + userId));
        
        return evenementRepository.findByUserAndTitreContainingOrUserAndDescriptionContaining(user, motCle, user, motCle).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
} 