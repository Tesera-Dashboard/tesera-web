# Tesera

Tesera is an AI-powered operations assistant platform designed for SMEs, cooperatives, boutique e-commerce businesses, and hybrid physical-online sellers.

## Overview

Tesera automates:
- Customer communication (WhatsApp, Chat, Email)
- Shipment management and tracking
- Inventory and stock tracking
- Workflow operations and task assignment
- Operational analytics

## Architecture

- **Frontend:** Next.js (App Router), TypeScript, TailwindCSS, shadcn/ui.
- **Backend:** FastAPI, Python, PostgreSQL, Redis, Celery.
- **AI Layer:** OpenAI-compatible APIs, agent-based workflows, tool calling, RAG.

### API Documentation
API documentation is available automatically once the backend is running:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Test Simulator (Mock Data)
Tesera includes a built-in interactive simulator to help you generate mock data and test the platform's features without manual data entry.

1. Navigate to **Test Simülatörü** from the sidebar (`/dashboard/test`).
2. **Toplu Veri (Seed):** Click this button to populate the database with random mock data (4 inventory items, 3 orders, 2 shipments). You can click this multiple times; it generates unique IDs each time.
3. **Rastgele Ürün Ekle:** Instantly adds a random product to your inventory with randomized stock and pricing.
4. **Sipariş Simülatörü:** Displays your current inventory. Click "Sipariş Et" next to any product to simulate a customer order for that item.
5. **Kargo Operasyonları:** Displays all active shipments. You can act as the carrier by updating their status to "Yolda" (In Transit), "Teslim Edildi" (Delivered), or trigger a "Gecikme" (Delay) to see how the UI reacts.

### Database Structure

Currently, the backend runs on **SQLite** (`tesera.db`) to enable rapid local development without requiring a Dockerized PostgreSQL setup. This can be easily swapped to PostgreSQL in production by modifying the `DATABASE_URL` in `.env` / `core/config.py`.

### Entity Relationship Diagram (ERD)

The platform is designed around a multi-tenant B2B architecture where every operational record is tied to a `Company`. Users authenticate to manage resources owned by their respective companies.

```mermaid
erDiagram
    COMPANY {
        UUID id PK
        String name
        DateTime created_at
        DateTime updated_at
    }
    
    USER {
        UUID id PK
        UUID company_id FK
        String email
        String full_name
        String hashed_password
        Boolean is_active
        Boolean is_verified
        DateTime created_at
        DateTime updated_at
    }
    
    ORDER {
        String id PK "e.g. ORD-1001"
        UUID company_id FK
        String customer
        String email
        String product
        Integer quantity
        Float amount
        String status
        String date
        String address
        String notes
    }
    
    INVENTORY_ITEM {
        String id PK "e.g. INV-001"
        UUID company_id FK
        String name
        String sku
        String category
        Integer stock
        Integer minStock
        Float price
        String status
        String lastRestocked
    }
    
    SHIPMENT {
        String id PK "e.g. SHP-1001"
        UUID company_id FK
        String orderId
        String carrier
        String trackingCode
        String status
        String origin
        String destination
        String estimatedDelivery
        Boolean isDelayed
        String delayReason
    }

    COMPANY ||--o{ USER : "has"
    COMPANY ||--o{ ORDER : "owns"
    COMPANY ||--o{ INVENTORY_ITEM : "owns"
    COMPANY ||--o{ SHIPMENT : "owns"
```

**Core Entities:**
- **Company:** Root tenant container. All operational data belongs to a company.
- **User:** Authenticated members. Bound to a specific `Company` and restricted to its data scope.
- **Order:** Represents customer purchase records, linked back to the owning company.
- **InventoryItem:** Products and stock tracking information, triggering reorder alerts based on `minStock`.
- **Shipment:** Logistic tracking and statuses for fulfilled orders.

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant FastAPI
    participant DB as SQLite DB

    Note over User, DB: Registration Flow
    User->>Frontend: Fills Company & Admin details
    Frontend->>FastAPI: POST /api/v1/auth/register
    FastAPI->>DB: Create Company & User
    FastAPI->>FastAPI: Generate Verification Token
    FastAPI-->>Frontend: 201 Created
    FastAPI-->>User: Sends Verification Email

    Note over User, DB: Email Verification Flow
    User->>Frontend: Clicks Link (/verify-email?token=...)
    Frontend->>FastAPI: POST /api/v1/auth/verify-email
    FastAPI->>DB: Set is_verified = True
    FastAPI-->>Frontend: 200 OK

    Note over User, DB: Login Flow
    User->>Frontend: Enters Email & Password
    Frontend->>FastAPI: POST /api/v1/auth/login
    FastAPI->>DB: Validate Credentials
    FastAPI-->>Frontend: Returns JWT Access Token
    Frontend->>Frontend: Saves Token (Cookie & LocalStorage)
    Frontend->>User: Redirects to /dashboard

    Note over User, DB: Forgot Password Flow
    User->>Frontend: Enters Email
    Frontend->>FastAPI: POST /api/v1/auth/forgot-password
    FastAPI->>FastAPI: Generate Reset Token
    FastAPI-->>User: Sends Reset Email
    User->>Frontend: Clicks Link (/reset-password?token=...)
    Frontend->>FastAPI: POST /api/v1/auth/reset-password
    FastAPI->>DB: Update hashed_password
    FastAPI-->>Frontend: 200 OK
```

## Project Structure

- `/frontend` - Next.js application
- `/backend` - FastAPI application
- `/docker` - Docker compose and configurations (Planned)
- `/memory-bank` - Project documentation and rules (Cline's memory)

## Development Setup

### Frontend

1. `cd frontend`
2. Copy `.env.example` to `.env.local`
3. `npm install`
4. `npm run dev`

### Backend

1. `cd backend`
2. Create a virtual environment: `python -m venv venv`
3. Activate it: `source venv/bin/activate`
4. Copy `.env.example` to `.env`
5. `pip install -r requirements.txt`
6. `uvicorn app.main:app --reload`

## License

Proprietary.
