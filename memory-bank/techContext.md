# Tech Context: Tesera

## Technologies Used
- Next.js (App Router)
- React
- TypeScript
- TailwindCSS
- shadcn/ui
- Framer Motion
- Zustand
- TanStack Query
- FastAPI
- Python
- PostgreSQL
- SQLAlchemy
- Redis
- Celery
- Docker

## Development Setup
The project will be structured into distinct directories for frontend and backend.
- `frontend/` - Next.js application
- `backend/` - FastAPI application

## Technical Constraints
- The platform is aimed at businesses only; consumer flows should not be implemented.
- The UI must strictly follow design rules: strong visual consistency, centralized theme tokens, minimal cognitive load.

## Dependencies
- Frontend: `next`, `react`, `framer-motion`, `lucide-react`, `tailwindcss`, `clsx`, `tailwind-merge`.
- Backend: `fastapi`, `uvicorn`, `sqlalchemy`, `psycopg2-binary`, `celery`, `redis`, `pydantic`.

## Code Quality Rules
- Type-safe architecture.
- Scalable structure.
- Production-ready conventions.
- Clean naming and avoid spaghetti code.
- Reusable abstractions and separation of concerns.
