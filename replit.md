# Discovery Flights Flex

## Overview

Discovery Flights Flex is a web application that helps users discover unexpected travel destinations worldwide based on flexible availability patterns and budget constraints. Unlike traditional flight search engines that require specific dates and destinations, this application enables exploration through:

- Budget-based destination discovery (€50-€5000)
- Flexible availability patterns (weekends, 1 week, 2 weeks, custom)
- Intelligent scoring of 40+ lesser-known global destinations
- Real-time flight search via Amadeus API
- Email alerts for price drops and new flight availability

The core value proposition is inspiration and discovery rather than simple price comparison.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript
- Vite as build tool and dev server
- Wouter for client-side routing
- TanStack Query (React Query) for server state management
- Radix UI + shadcn/ui component library
- Tailwind CSS with custom design tokens

**Design System:**
- Material Design principles adapted for flight search
- Inter font family throughout
- Custom color system with CSS variables for theming
- Support for light/dark modes
- Responsive grid layouts optimized for data-heavy interfaces

**State Management:**
- React Query for API data caching and synchronization
- React hooks (useState, useForm) for local component state
- Multi-step form flow: search → destination discovery → flight results

**Key UI Components:**
- SearchForm: Origin, budget, pattern configuration
- DestinationDiscovery: Display scored destinations with selection (max 5)
- FlightResults: Real-time flight offers with booking links
- SavedSearches: Alert management and search history

### Backend Architecture

**Runtime & Framework:**
- Node.js with Express
- TypeScript for type safety
- ESM module system

**API Design:**
- RESTful endpoints
- Session-based request tracking
- Structured error handling with HTTP status codes

**Core API Endpoints:**
- `GET /api/destinations` - Static destination scoring based on criteria
- `GET /api/flights` - Real-time flight search via Amadeus
- `POST /api/searches` - Save search with alert preferences
- `GET /api/searches` - Retrieve saved searches
- `DELETE /api/searches/:id` - Remove saved search
- `POST /api/alerts` - Create price/availability alerts

**Business Logic Modules:**
- `date-patterns.ts` - Generate date ranges from flexible patterns (weekend, 1-week, 2-week, custom)
- `destinations-data.ts` - Static dataset of 40+ destinations with uniqueness scores, coordinates, tags
- `amadeus-client.ts` - Wrapper for Amadeus Flight Offers API with caching
- `email-service.ts` - Email alerts via Resend API

**Cost Optimization Strategy:**
Two-stage architecture to minimize expensive API calls:
1. **Stage 1 (Free)**: Score destinations from static dataset based on distance, budget compatibility, uniqueness
2. **Stage 2 (Selective)**: User selects 3-5 destinations, then perform limited Amadeus API calls (sample dates to reduce volume)
3. **Caching**: 1-hour cache on flight results to prevent redundant API requests

### Data Storage

**ORM & Database:**
- Drizzle ORM for type-safe database operations
- PostgreSQL dialect configured (via @neondatabase/serverless)
- Schema defined in `shared/schema.ts`

**Data Models:**
- `searches` - User search configurations with pattern, origin, budget, email
- `alerts` - Email notification triggers linked to searches
- `priceHistory` - Historical price tracking for trend detection
- `flightOffers` - Cached flight results

**Storage Abstraction:**
- `IStorage` interface in `server/storage.ts`
- `MemStorage` implementation for in-memory development/testing
- Database implementation via Drizzle for production

### External Dependencies

**Third-Party APIs:**

1. **Amadeus Flight Offers API** (Primary flight data)
   - Real-time flight availability and pricing
   - Affiliate booking link generation
   - Credentials: `AMADEUS_API_KEY`, `AMADEUS_API_SECRET`
   - Client library: `amadeus` npm package
   - Cost mitigation: Selective querying, date sampling, 1-hour cache

2. **Resend** (Email delivery)
   - Transactional emails for flight alerts
   - Welcome emails for new searches
   - Credentials: `RESEND_API_KEY`
   - Triggers: Price drops >10%, new matching flights

**Static Data Sources:**
- OpenFlights airport/route data (referenced but not directly integrated)
- Hand-curated destination dataset with uniqueness scoring
- Airport coordinate mappings for distance calculations

**Development Tools:**
- Replit-specific plugins for hot reload and error overlay
- Drizzle Kit for database migrations
- ESBuild for production bundling

**Database Service:**
- Neon serverless PostgreSQL (via `@neondatabase/serverless`)
- Connection via `DATABASE_URL` environment variable
- Migration directory: `./migrations`

**CSS & Styling:**
- PostCSS with Tailwind CSS and Autoprefixer
- Google Fonts CDN for Inter font family