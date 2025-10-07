# FixMyStuff

FixMyStuff est une plateforme qui met en relation des particuliers ayant des objets à réparer et des professionnels qualifiés capables d'intervenir rapidement. Ce dépôt documente la vision produit, l'architecture technique et les premières spécifications fonctionnelles de l'application.

Une première implémentation d'un **système de comptes** est disponible dans ce dépôt. Elle propose :

- L'inscription et la connexion par email/mot de passe pour les particuliers et les professionnels.
- Un point d'entrée OAuth Google (activable en ajoutant vos clés) pour s'authentifier sans mot de passe.
- Un stockage persistant des comptes dans une base SQLite locale.
- Une interface web minimaliste permettant de créer un compte, se connecter et visualiser son état de session.

## Démarrage rapide

### Prérequis

- Node.js 18+

### Installation

```bash
npm install
cp .env.example .env
```

Modifiez `.env` pour définir `SESSION_SECRET` et, si besoin, vos identifiants Google OAuth (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`). Renseignez `BASE_URL` avec l'URL publique de l'application (par défaut `http://localhost:3000`).

### Lancer l'application

```bash
npm start
```

Le serveur Express démarre sur `http://localhost:3000` et sert la landing page incluant le système de comptes. La base SQLite est créée automatiquement dans le dossier `data/`.

## Vision

L'application vise à simplifier la réparation d'objets du quotidien (électroménager, électronique, ameublement, etc.) en offrant :

- Une expérience fluide pour les particuliers : création rapide d'une demande, suivi du dossier, paiement sécurisé.
- Une visibilité accrue pour les professionnels : profils détaillés, gestion d'agenda, historique des interventions.
- Une mise en relation transparente basée sur la géolocalisation, les évaluations et les spécialités.

## Fonctionnalités principales

1. **Création de demandes**
   - Formulaire guidé avec description du problème, photos et disponibilité.
   - Estimation automatique du coût basée sur des grilles tarifaires.

2. **Matching intelligent**
   - Algorithme qui propose les professionnels pertinents selon : localisation, compétences, notes, disponibilité.
   - Notifications en temps réel via email et push.

3. **Espace professionnel**
   - Gestion de profil (certifications, tarifs, zones d'intervention).
   - Agenda synchronisé et gestion des devis.
   - Messagerie sécurisée avec les clients.

4. **Espace client**
   - Suivi du statut de la demande et des interventions.
   - Paiement en ligne avec séquestre jusqu'à validation.
   - Historique et évaluations.

5. **Support & médiation**
   - Chat support pour les litiges.
   - Garantie de satisfaction et suivi post-intervention.

## Architecture proposée

- **Front-end** : application web responsive (React/Next.js) + application mobile (React Native) pour les notifications terrain.
- **Back-end** : API RESTful en Node.js (NestJS) ou Python (FastAPI) avec authentification JWT et RBAC.
- **Base de données** : PostgreSQL pour les données relationnelles, Redis pour la mise en cache et les files d'attente.
- **Stockage** : S3-compatible pour les médias (photos, documents).
- **Infrastructure** : déploiement containerisé (Docker + Kubernetes) avec CI/CD GitHub Actions.
- **Services tiers** :
  - Stripe pour les paiements.
  - SendGrid / Firebase Cloud Messaging pour les notifications.
  - Mapbox pour la cartographie et la géolocalisation.

## Roadmap initiale

1. **MVP (6 semaines)**
   - Authentification (email, OAuth).
   - Création de demande + upload de photos.
   - Matching manuel par l'équipe support (pour valider les process).
   - Tableau de bord professionnel simplifié.

2. **Automatisation (3 mois)**
   - Algorithme de matching automatisé.
   - Paiement sécurisé et séquestre.
   - Notifications en temps réel.

3. **Scale-up (6 mois)**
   - Applications mobiles natives (React Native).
   - Marketplace complète avec évaluations, promotions, abonnements pro.
   - Support multi-pays et multi-langues.

## Prochaines étapes

- Finaliser le cahier des charges fonctionnel détaillé.
- Prototyper l'UI/UX avec Figma.
- Lancer la conception de l'API (schémas de données, endpoints, tests).
- Définir les exigences légales (assurances, garantie, RGPD).

## Contribution

Les contributions sont les bienvenues ! Ouvrez une issue pour proposer une nouvelle fonctionnalité ou signaler un problème. Merci de respecter la charte de contribution et les bonnes pratiques de code.
