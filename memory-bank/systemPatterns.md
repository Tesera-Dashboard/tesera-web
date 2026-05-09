# System Patterns: Tesera

## System Architecture
- **Frontend:** Next.js (latest App Router), TypeScript, TailwindCSS, shadcn/ui, Framer Motion.
- **State Management:** Zustand or TanStack Query.
- **Backend:** FastAPI (Python), PostgreSQL, SQLAlchemy, Redis, Celery/background workers.
- **Authentication:** JWT Authentication. Only company/business registration allowed.
- **AI Layer:** AI agent architecture, OpenAI-compatible APIs, RAG-ready structure, Tool calling, Workflow/action based agents, Notification agents.
- **Integration Layer:** REST API, Webhooks.

## Key Technical Decisions
- **Monorepo / Modular Structure:** Clean, modular architecture separating frontend, backend, and AI agent logic.
- **Component Design:** Centralized theme tokens, reusable shadcn/ui components (modals/forms/cards/tables). No random inconsistent components.
- **Data Fetching:** TanStack Query for server state, Zustand for client-side state.
- **Styling:** TailwindCSS with a strong centralized design system (spacing, typography, border radius). Dark/light mode support.

## Design Patterns in Use
- **Card-based Layouts:** For organizing dashboard information clearly.
- **Skeleton Loaders:** For managing loading states smoothly without layout shifts.
- **Separation of Concerns:** Keep API service layers distinct from UI components.
- **Agent Architecture:** Agents separated by domains (e.g., notification agents, workflow agents, communication agents).

## Component Relationships
- **UI Architecture:** Pages -> Layouts -> Features/Modules -> Core UI Components (shadcn).
- **Backend Architecture:** Routers -> Services -> Models/Schemas -> Database.
