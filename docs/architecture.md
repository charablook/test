# Architecture FixMyStuff

## Contexte

Cette note détaille une architecture de référence pour lancer rapidement l'application FixMyStuff tout en conservant une base robuste pour évoluer.

## Composants principaux

### 1. Front-end
- **Technologies** : Next.js pour le web, React Native pour mobile.
- **Fonctionnalités clés** :
  - Dashboard client et professionnel.
  - Formulaires dynamiques pour la création de demandes.
  - Intégration temps réel avec les notifications (WebSocket/Push).

### 2. API Gateway & Back-end
- **Framework** : NestJS (Node.js) pour bénéficier d'une structure modulaire et de TypeScript.
- **Services** :
  - Authentification et gestion des rôles (JWT + OAuth 2.0).
  - Gestion des demandes et des missions.
  - Système de devis et paiements.
  - Service de notifications.
- **Patterns** : architecture hexagonale avec séparation domaine/application/infrastructure.

### 3. Base de données
- **PostgreSQL** : schéma relationnel (utilisateurs, demandes, missions, transactions, évaluations).
- **Pratiques** : migrations versionnées via Prisma ou TypeORM.
- **Indexation** : index géospatiaux (PostGIS) pour les recherches par localisation.

### 4. Asynchrone & Temps réel
- **Redis** : files BullMQ pour la gestion des jobs (envoi d'emails, matching, rappels).
- **WebSockets** : passerelle pour notifications en direct.

### 5. Stockage et médias
- **S3** : stockage des photos, devis, factures.
- **Traitement** : lambda pour redimensionnement et anonymisation des documents sensibles.

### 6. Observabilité
- **Logging** : Winston + ELK/Datadog.
- **Metrics** : Prometheus + Grafana.
- **Tracing** : OpenTelemetry.

## Sécurité
- Conformité RGPD (cryptage at-rest & in-transit).
- Gestion des consentements pour le partage des données.
- Audit trail sur toutes les modifications de missions.
- Politiques IAM minimales pour l'infrastructure cloud.

## Déploiement
- **CI/CD** : GitHub Actions avec pipelines lint/test/build/deploy.
- **Infrastructure** : Kubernetes (EKS/GKE) ou Render/Heroku pour le MVP.
- **IaC** : Terraform pour la reproductibilité.

## Scalabilité future
- Découpage en microservices par domaines (auth, matching, paiement) lorsque la charge l'exige.
- Mise en cache des recherches et profils.
- Support d'un moteur de recommandation basé sur le machine learning.

## Prochaines étapes techniques
1. Définir les schémas de données initiaux.
2. Établir la matrice des permissions.
3. Mettre en place l'environnement de développement (Docker Compose).
4. Rédiger la charte qualité (tests, revues de code, guidelines).
