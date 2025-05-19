# Ajenda - Application d'agenda d'événements

Une application simple de gestion d'événements avec Spring Boot et Angular, avec support des thèmes clair et sombre.

## Technologies utilisées

### Backend
- Java 17
- Spring Boot 3.4.5
- Spring Data JPA
- MySQL
- Lombok

### Frontend
- Angular 18
- TailwindCSS
- FullCalendar

## Prérequis

- JDK 17
- Node.js et npm
- MySQL (via XAMPP ou autre)

## Installation et démarrage

### Base de données
1. Démarrer MySQL via XAMPP
2. La base de données sera créée automatiquement au démarrage de l'application

### Backend (Spring Boot)
1. Ouvrir un terminal dans le dossier `demo`
2. Exécuter la commande : `./mvnw spring-boot:run`
3. Le serveur démarre sur http://localhost:8080

### Frontend (Angular)
1. Ouvrir un terminal dans le dossier `frontend`
2. Installer les dépendances : `npm install`
3. Démarrer le serveur de développement : `npm start`
4. L'application est accessible sur http://localhost:4200

## Fonctionnalités

- Affichage d'un calendrier interactif
- Création, modification et suppression d'événements
- Personnalisation des couleurs des événements
- Support des événements sur une journée entière
- Recherche d'événements
- Thème clair/sombre

## Structure du projet

### Backend
- `model` : Entités JPA
- `repository` : Interfaces d'accès aux données
- `service` : Logique métier
- `controller` : API REST
- `dto` : Objets de transfert de données
- `exception` : Gestion des erreurs

### Frontend
- `components` : Composants Angular
- `services` : Services pour la communication avec l'API
- `models` : Interfaces TypeScript

## API REST

- `GET /api/evenements` : Liste tous les événements
- `GET /api/evenements/{id}` : Récupère un événement par son ID
- `POST /api/evenements` : Crée un nouvel événement
- `PUT /api/evenements/{id}` : Met à jour un événement existant
- `DELETE /api/evenements/{id}` : Supprime un événement
- `GET /api/evenements/plage` : Récupère les événements dans une plage de dates
- `GET /api/evenements/recherche` : Recherche des événements par mot clé 