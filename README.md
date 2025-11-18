# Discovery Flights Flex ✈️

Une application web innovante pour découvrir des destinations de voyage inattendues selon votre budget et vos disponibilités flexibles.

## 🎯 Concept

Contrairement aux comparateurs de vols traditionnels (Skyscanner, Kayak) qui nécessitent des dates et destinations précises, **Discovery Flights Flex** vous permet de :

- **Définir un budget** et un aéroport de départ
- **Spécifier un pattern de disponibilité** (week-end, 1 semaine, 2 semaines, personnalisé)
- **Découvrir 20 destinations inspirantes** scorées par originalité et pertinence
- **Sélectionner jusqu'à 5 destinations** pour voir les vols disponibles
- **Sauvegarder vos recherches** et recevoir des alertes email automatiques

## 🌟 Fonctionnalités MVP

### 1. Recherche Flexible
- Sélection de l'aéroport de départ (CDG, ORY, NCE, etc.)
- Budget configurable (50€ - 5000€)
- Patterns de disponibilité :
  - Week-end (Vendredi-Dimanche)
  - 1 semaine
  - 2 semaines
  - Durée personnalisée
- Jours de départ préférés (optionnel)
- Distance maximale (optionnel)

### 2. Découverte de Destinations
- **Scoring intelligent** basé sur :
  - Originalité/unicité de la destination
  - Distance depuis l'origine
  - Pertinence budgétaire
  - Popularité (inversée - favorise les destinations moins connues)
- Dataset de **40+ destinations** mondiales peu connues
- Affichage enrichi : distance, durée de vol estimée, score d'originalité

### 3. Recherche de Vols en Temps Réel
- Intégration **Amadeus Flight API**
- Génération automatique de dates selon le pattern choisi
- Échantillonnage intelligent (3 dates par destination) pour limiter les coûts API
- Affichage des meilleurs prix avec détails complets

### 4. Système d'Alertes
- Sauvegarde des recherches avec critères
- Alertes email via **Resend** pour :
  - Nouveaux vols correspondants
  - Baisses de prix (> 10%)
- Gestion des alertes actives/inactives

### 5. Optimisation des Coûts API
- **Approche hybride 2 étages** :
  1. **Étage 1** : Scoring avec dataset statique (gratuit)
  2. **Étage 2** : Appels API Amadeus uniquement pour destinations sélectionnées
- Cache de 1 heure pour éviter les appels redondants
- Limitation du nombre de destinations et dates vérifiées

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **React** avec **Wouter** pour le routing
- **TanStack Query** pour la gestion d'état et cache
- **Shadcn UI** + **Tailwind CSS** pour l'interface
- **React Hook Form** + **Zod** pour la validation
- Design system cohérent avec mode sombre

### Backend (Node.js + Express)
- **Express** avec TypeScript
- **Amadeus SDK** pour les recherches de vols
- **Resend** pour les emails transactionnels
- **date-fns** pour la manipulation de dates
- **MemStorage** pour le stockage (peut être remplacé par PostgreSQL)

### Services Externes
- **Amadeus Self-Service API** : Recherche de vols
- **Resend** : Envoi d'emails d'alerte

## 📦 Installation

### Prérequis
- Node.js 20+
- Compte Amadeus (gratuit) : https://developers.amadeus.com/
- Compte Resend (gratuit) : https://resend.com/

### Configuration

1. Cloner le projet et installer les dépendances :
```bash
npm install
```

2. Configurer les variables d'environnement dans Replit Secrets :
```env
AMADEUS_API_KEY=votre_client_id
AMADEUS_API_SECRET=votre_client_secret
RESEND_API_KEY=votre_resend_api_key
SESSION_SECRET=votre_secret_session
```

3. Lancer l'application :
```bash
npm run dev
```

L'application sera accessible sur http://localhost:5000

## 🎨 Design Guidelines

L'application suit un design Material Design avec :
- **Police** : Inter (moderne et lisible)
- **Couleurs** : Palette bleue professionnelle avec support dark mode
- **Composants** : Shadcn UI pour cohérence
- **Animations** : Subtiles et élégantes (hover-elevate, transitions fluides)

## 🔌 Endpoints API

### GET /api/destinations
Récupère les destinations scorées selon les critères.

**Query params:**
- `origin` : Code IATA de l'aéroport (ex: CDG)
- `budget` : Budget maximum en euros
- `maxDistance` : Distance maximale en km (optionnel)
- `pattern` : JSON du pattern de dates

**Response:** Array de destinations avec scores

### GET /api/flights
Recherche des vols pour les destinations sélectionnées.

**Query params:**
- `origin` : Code IATA origine
- `destinations` : JSON array des codes IATA
- `pattern` : JSON du pattern de dates
- `budget` : Budget maximum (optionnel)

**Response:** Array d'offres de vols

### POST /api/searches
Sauvegarde une recherche pour alertes.

**Body:**
```json
{
  "name": "Week-end à Lisbonne",
  "originAirport": "CDG",
  "budget": 300,
  "pattern": { "type": "weekend", "duration": 3 },
  "selectedDestinations": ["LIS", "OPO"],
  "email": "user@example.com",
  "isActive": true
}
```

### GET /api/searches
Liste toutes les recherches sauvegardées.

### DELETE /api/searches/:id
Supprime une recherche.

### POST /api/alerts
Crée une alerte de prix.

### GET /api/alerts
Liste les alertes (optionnel: filtre par searchId).

## 📊 Schéma de Données

### Search
- id, name, originAirport, budget
- pattern (JSON : type, duration, preferredDays)
- selectedDestinations (array IATA codes)
- email, isActive
- createdAt, updatedAt

### Alert
- id, searchId, destination
- currentPrice, targetPrice, priceChange
- flightDetails (JSON), sent
- createdAt

### PriceHistory
- id, searchId, destination
- price, currency, date
- recordedAt

## 🚀 Fonctionnalités Phase 2 (Futures)

- [ ] Filtres climat (température minimale)
- [ ] Filtres type de destination (plage, montagne, culture)
- [ ] Multi-aéroports de départ
- [ ] IA pour suggestions personnalisées
- [ ] Graphiques de tendance des prix
- [ ] Partage social des deals
- [ ] Système de notation des destinations
- [ ] Intégration booking direct

## 💰 Monétisation Potentielle

1. **Liens affiliés** : Commission sur les réservations
2. **Premium** : Alertes plus fréquentes, plus de destinations
3. **Partenariats** : Assurance voyage, cartes SIM, hôtels

## 🔧 Technologies

- **Frontend** : React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend** : Node.js, Express, TypeScript
- **APIs** : Amadeus, Resend
- **Tools** : TanStack Query, React Hook Form, Zod, date-fns

## 📝 License

MIT

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

---

**Bon voyage ! ✈️🌍**
