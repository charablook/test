# Architecture FixMyStuff

## Contexte

Cette note détaille une architecture de référence pour lancer rapidement l'application FixMyStuff tout en conservant une base robuste pour évoluer.

## Composants principaux

### MVP actuel (proof-of-concept)

- **Front-end** : landing page statique servie par Express (`public/index.html`) avec un script léger (`public/app.js`) gérant les formulaires d'inscription et de connexion.
- **Back-end** : serveur Node.js/Express (`server.js`) exposant une API REST minimaliste (`/api/register`, `/api/login`, `/api/session`, `/api/logout`) et les endpoints OAuth Google (`/auth/google`). Authentification gérée via `passport` (stratégies locale + Google) et `express-session`.
- **Base de données** : SQLite embarquée (pilote `sqlite3`) stockée dans `data/fixmystuff.db` pour conserver les utilisateurs, leurs rôles (particulier/professionnel) et le fournisseur d'authentification.
- **Sessions** : stockées en mémoire (implémentation Express par défaut) pour simplifier la mise en route. À remplacer par un store persistant (Redis, SQL) lors du passage en production.

Cette base offre un socle fonctionnel pour tester rapidement le parcours d'inscription/connexion tout en restant légère.

### Cible long terme

La vision cible reste orientée vers une architecture modulaire et scalable :

1. **Front-end**
   - Next.js pour le web, React Native pour mobile.
   - Interfaces riches (dashboard, formulaires dynamiques, notifications temps réel).

2. **API Gateway & Back-end**
   - Framework structurant (NestJS/FastAPI) et séparation claire domaine/application/infrastructure.
   - Services dédiés : authentification (JWT + OAuth 2.0), matching, devis/paiement, notifications.

3. **Base de données**
   - PostgreSQL avec migrations versionnées (Prisma/TypeORM) et extension PostGIS pour le géomatching.

4. **Asynchrone & Temps réel**
   - Redis + BullMQ pour les jobs, WebSockets ou Web Push pour les notifications instantanées.

5. **Stockage & médias**
   - Stockage objet compatible S3, traitements serverless pour l'optimisation des médias.

6. **Observabilité**
   - Stack de logs centralisée (ELK/Datadog), métriques (Prometheus/Grafana) et traçabilité (OpenTelemetry).

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
