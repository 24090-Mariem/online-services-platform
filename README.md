# Plateforme de Services

<p align="center">
Application web Full Stack permettant de connecter des clients avec des techniciens pour la réservation, la gestion et l'évaluation des services.
</p>

---

# Description

Cette plateforme facilite la mise en relation entre des clients ayant besoin de services et des techniciens proposant leurs compétences.

Elle permet aux utilisateurs de rechercher des services, trouver des techniciens, effectuer des réservations et suivre l'évolution des prestations.

---

# Rôles utilisateurs

| Rôle | Description |
|------|-------------|
| Client | Recherche des services, réserve des prestations, suit ses demandes et évalue les services réalisés |
| Technicien | Gère son profil professionnel, ses services, ses disponibilités et ses réservations |
| Administrateur | Supervise la plateforme, gère les utilisateurs, techniciens, services et catégories |

---

# Fonctionnalités principales

## Client

- Inscription et authentification.
- Consultation des services disponibles.
- Recherche de techniciens.
- Consultation des profils professionnels.
- Création et suivi des réservations.
- Gestion de l'historique des réservations.
- Évaluation des services avec un système d'étoiles.
- Gestion du profil utilisateur.

## Technicien

- Création d'une demande d'inscription professionnelle.
- Gestion du profil technicien.
- Ajout et modification des services proposés.
- Gestion des réservations reçues.
- Suivi des prestations.
- Consultation des évaluations clients.

## Administrateur

- Tableau de bord administratif.
- Gestion des utilisateurs.
- Gestion des techniciens.
- Validation des demandes d'inscription.
- Gestion des catégories.
- Gestion des services.
- Gestion des réservations.
- Gestion des avis.
- Consultation des statistiques.

---

# Technologies utilisées

## Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- Axios
- React i18next

## Backend

- Node.js
- Express.js
- MySQL
- JWT Authentication
- bcrypt
- Express Validator

## Tests et outils

- Jest
- Git
- GitHub Actions CI

---

# Architecture du projet
Services/
├── frontend/
│ ├── src/
│ │ ├── components/ # Composants React réutilisables
│ │ ├── pages/ # Pages de l'application
│ │ ├── services/ # Appels API
│ │ ├── context/ # Context API
│ │ └── utils/ # Fonctions utilitaires
│ └── package.json
│
├── backend/
│ ├── controllers/ # Gestion des requêtes HTTP
│ ├── models/ # Modèles base de données
│ ├── routes/ # Routes API
│ ├── services/ # Logique métier
│ ├── middlewares/ # Authentification et sécurité
│ ├── validations/ # Validation des données
│ └── package.json
│
└── README.md


---

# Installation

## Prérequis

Avant de commencer, installer :

- Node.js version 20 ou supérieure.
- MySQL version 8 ou supérieure.
- Git.

---

# Configuration Backend

Accéder au dossier backend :

```bash
cd backend

Installer les dépendances :

npm install

Créer un fichier .env :

Démarrer le serveur :

npm start

Le backend sera disponible sur :

http://localhost:5000
