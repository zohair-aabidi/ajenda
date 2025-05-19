# Ajenda

Application de gestion d'agenda et d'événements développée avec Angular 19.

## Fonctionnalités

- Affichage d'un calendrier interactif avec différentes vues (mois, semaine, jour, liste)
- Création, modification et suppression d'événements
- Gestion des événements sur une journée entière ou sur une plage horaire
- Personnalisation des couleurs des événements
- Mode sombre/clair

## Prérequis

- Node.js (v18 ou supérieur)
- npm (v9 ou supérieur)

## Installation

1. Cloner le dépôt
2. Installer les dépendances :

```bash
npm install
```

3. Lancer l'application en mode développement :

```bash
npm start
```

4. Accéder à l'application à l'adresse : `http://localhost:4200`

## Technologies utilisées

- Angular 19
- FullCalendar
- Tailwind CSS
- RxJS

## Structure du projet

- `src/app/components` : Composants Angular
- `src/app/services` : Services pour la gestion des données
- `src/app/models` : Modèles de données

## API Backend

L'application se connecte à une API REST sur `http://localhost:8080/api/evenements` pour la gestion des événements.

## Licence

MIT
