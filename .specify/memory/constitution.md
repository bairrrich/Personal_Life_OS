# Personal Life OS Constitution

## Core Principles

### I. Offline-First Architecture
All data is stored locally in IndexedDB (via Dexie.js). The UI always works with the local database, ensuring instant response. Synchronization with the server occurs in the background when connectivity is available.

### II. Entity-Driven Data Model
Single universal `entities` table with flexible JSON `data` field. All domain objects (foods, transactions, exercises) are stored as entities with type discrimination. Relations are stored in a separate `relations` table for graph-like queries.

### III. Event Sourcing for Sync
All changes generate events stored in the `events` table. Events enable:
- Complete history of changes
- Rollback capability
- Reliable offline synchronization
- Conflict resolution via Last-Write-Wins strategy

### IV. Spec-Driven Development
Every feature starts with a specification:
1. Requirements & user stories (`spec.md`)
2. Technical plan (`plan.md`)
3. Actionable tasks (`tasks.md`)
4. Implementation with test coverage

### V. Test-First Implementation
- Unit tests for entity engine and sync logic
- Integration tests for API adapters
- E2E tests for critical user flows (add transaction, log food, start workout)

### VI. API Integration Layer
External APIs (Open Food Facts, Wger) are accessed through adapters that normalize responses to entity format. All API calls are cached to respect rate limits.

### VII. Component Architecture
Strict layering: `shared` → `entities` → `features` → `widgets` → `pages`
- **shared**: Universal UI components, hooks, utilities
- **entities**: Entity-specific components (FoodCard, TransactionForm)
- **features**: Self-contained business logic modules
- **widgets**: Dashboard-ready composite components
- **pages**: Next.js route pages

### VIII. PWA-First Deployment
- Service Worker for offline caching
- Background sync for queued operations
- Installable on all devices
- Responsive design (mobile-first)

## Technology Stack

| Component          | Technology                                    |
| ------------------ | --------------------------------------------- |
| Frontend           | Next.js 15 (App Router), React 19, TypeScript |
| Styling            | Tailwind CSS, shadcn/ui (Radix UI)            |
| Local DB           | IndexedDB + Dexie.js (with liveQuery)         |
| Sync Engine        | Custom event-based sync                       |
| Server             | Supabase (PostgreSQL, Auth, Realtime)         |
| PWA                | next-pwa, Service Worker, Background Sync     |
| Charts             | Recharts / ECharts                            |
| Forms & Validation | React Hook Form, Zod                          |
| Global State       | Zustand (UI state only, not for data)         |

## Development Workflow

### Spec-Kit Commands
- `/speckit.constitution` — Establish project principles (this file)
- `/speckit.specify` — Create requirements and user stories
- `/speckit.clarify` — Ask clarifying questions before planning
- `/speckit.plan` — Create technical implementation plan
- `/speckit.tasks` — Generate actionable task list
- `/speckit.implement` — Execute implementation
- `/speckit.analyze` — Cross-artifact consistency check
- `/speckit.checklist` — Generate quality checklists

### Git Workflow
- Feature branches: `feature/<name>`
- Bug fixes: `fix/<name>`
- Specs: `spec/<feature-name>`
- PR required for all merges to `main`
- Conventional Commits format

## Quality Gates

### Code Review Requirements
- All specs reviewed before implementation
- Tests required for new features
- Integration tests for API changes
- Accessibility compliance (WCAG 2.1 AA)

### Definition of Done
- [ ] Spec approved
- [ ] Tests pass (unit + integration)
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] PWA functionality verified

## Governance

This constitution supersedes all other development practices. Amendments require:
1. Discussion in project issues
2. Update to this document
3. Migration plan for existing code (if applicable)

**Version**: 1.0.0 | **Ratified**: 2026-03-11 | **Last Amended**: 2026-03-11
