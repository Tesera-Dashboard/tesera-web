# Tesera — AI-Powered Operations Platform

> **Tesera** is a full-stack, AI-powered operations management platform built for SMEs, agricultural cooperatives, boutique e-commerce businesses, and hybrid physical-online sellers. It centralises order management, inventory tracking, shipment logistics, AI-driven insights, automated workflows, and a real-time notification system into a single, cohesive dashboard.

---

## 🔗 Links

| | |
|---|---|
| 🌐 **Live Demo** | [LIVE_DEMO_URL] |
| 🎥 **Demo Video** | [VIDEO_URL] |
| 📊 **Presentation** | [PRESENTATION_URL] |
| 📖 **API Docs (Swagger)** | `http://localhost:8000/docs` |
| 📖 **API Docs (ReDoc)** | `http://localhost:8000/redoc` |

---

## ✨ Features

### Core Modules
- **Order Management** — Create, track, filter, and update customer orders with real-time status transitions and automatic notification triggers.
- **Inventory Management** — Full product lifecycle management (create, edit, delete), CSV import/export, low-stock and critical-stock alerts.
- **Shipment Tracking** — End-to-end shipment lifecycle with carrier assignment, delay detection, and status-change notifications.
- **Analytics & Insights** — Interactive charts (order trends, inventory by category, shipment status distribution, revenue over time) powered by Recharts.

### Intelligence Layer
- **AI Assistant (Gemini + OpenAI)** — Conversational assistant at `/dashboard/ai-assistant`. Gemini 1.5 Flash primary, GPT-4o Mini fallback. Full chat history persistence, markdown rendering, and conversation management.
- **AI Recommendations** — Live contextual recommendations on the dashboard overview, analysing current company data and routing action buttons to the relevant module.
- **AI Predictions** — Dedicated analytics sidebar with business summary, performance analysis, forecasts, and profit/loss predictions with regenerate functionality.

### Automation & Notifications
- **Workflow Builder** — Visual agent workflow builder at `/dashboard/workflows`. Supports manual, scheduled, webhook, and event triggers. Step types: Send Notification, Update Inventory, Create Order, AI Action, Delay.
- **Notification Center** — Full notification lifecycle (view, mark-read, bulk-delete) at `/dashboard/notifications`. Priority-coded badges (Info, Warning, Error, Success) with type icons per module.
- **Real-time Topbar Notifications** — Notification dropdown with live badge, auto-refresh every 30 seconds, immediate UI updates.

### Platform
- **Authentication System** — JWT-based auth, Bcrypt hashing, email verification (SMTP), password reset, route protection for unverified users.
- **Onboarding Flow** — 8-step interactive onboarding for new users covering all core modules with progress tracking.
- **Settings** — Unified settings page (Profile, Preferences, Billing) with sidebar customisation, drag-and-drop reordering, theme toggle, and subscription management.
- **Integrations** — Marketplace integrations page (Trendyol, Hepsiburada, Amazon — *Coming Soon*).
- **Test Simulator** — Developer tool at `/dashboard/test` with 7 modules: bulk seed, random product/shipment generators, order simulator, carrier interface, DB clear, AI chat test, workflow test, notification test.

---

## 📸 Screenshots

> All screens are fully responsive — shown side-by-side on mobile (iPhone 15 Pro Max) and desktop (Pro Display XDR).

<table>
  <tr>
    <td align="center" width="50%">
      <b>Dashboard Overview</b><br/>
      Real-time KPIs, order trends chart, recent orders table, AI recommendations, and live notifications panel.
      <br/><br/>
      <img src="dashboard-screens/1.png" alt="Dashboard Overview" width="100%"/>
    </td>
    <td align="center" width="50%">
      <b>AI Assistant</b><br/>
      Conversational AI powered by Gemini 1.5 Flash with chat history, starter prompts, and markdown rendering.
      <br/><br/>
      <img src="dashboard-screens/2.png" alt="AI Assistant" width="100%"/>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <b>Order Management</b><br/>
      Full order table with status badges, customer info, filters, and inline actions.
      <br/><br/>
      <img src="dashboard-screens/3.png" alt="Order Management" width="100%"/>
    </td>
    <td align="center" width="50%">
      <b>Inventory Management</b><br/>
      Product table with low-stock and critical-stock alerts, CSV import/export, edit/delete actions.
      <br/><br/>
      <img src="dashboard-screens/4.png" alt="Inventory Management" width="100%"/>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <b>Shipment Tracking</b><br/>
      Shipment list with carrier info, tracking codes, delay warnings, and status management.
      <br/><br/>
      <img src="dashboard-screens/5.png" alt="Shipment Tracking" width="100%"/>
    </td>
    <td align="center" width="50%">
      <b>Workflow Builder</b><br/>
      Card-based agent workflow builder with trigger types, step management, and active/inactive toggling.
      <br/><br/>
      <img src="dashboard-screens/6.png" alt="Workflow Builder" width="100%"/>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <b>Analytics & AI Predictions</b><br/>
      Order trends, inventory by category, shipment status charts, and AI-generated business predictions sidebar.
      <br/><br/>
      <img src="dashboard-screens/7.png" alt="Analytics" width="100%"/>
    </td>
    <td align="center" width="50%">
      <b>Notification Center</b><br/>
      Full notification lifecycle with priority badges, mark-as-read, bulk delete, and type icons per module.
      <br/><br/>
      <img src="dashboard-screens/8.png" alt="Notification Center" width="100%"/>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <b>Integrations</b><br/>
      Marketplace integrations page with Trendyol, Hepsiburada, and Amazon cards (Coming Soon).
      <br/><br/>
      <img src="dashboard-screens/9.png" alt="Integrations" width="100%"/>
    </td>
    <td align="center" width="50%">
      <b>Team Management</b><br/>
      Team module coming soon page with feature preview cards.
      <br/><br/>
      <img src="dashboard-screens/10.png" alt="Team Management" width="100%"/>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <b>Settings — Profile & Company</b><br/>
      Unified settings with profile info, company details, profile completion indicator, and danger zone.
      <br/><br/>
      <img src="dashboard-screens/11.png" alt="Settings" width="100%"/>
    </td>
    <td align="center" width="50%">
      <b>Test Simulator Panel</b><br/>
      Developer tool with 8 modules for seeding data, simulating orders/carriers, and testing AI/notifications.
      <br/><br/>
      <img src="dashboard-screens/12.png" alt="Test Simulator" width="100%"/>
    </td>
  </tr>
</table>

---

## 🏗️ Architecture

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), TypeScript, TailwindCSS, shadcn/ui v4, Framer Motion |
| **Backend** | FastAPI, Python, SQLAlchemy, SQLite (dev) / PostgreSQL (prod) |
| **AI Layer** | Google Gemini 1.5 Flash (primary), OpenAI GPT-4o Mini (fallback) |
| **Charts** | Recharts |
| **Auth** | JWT + Bcrypt + SMTP email verification |
| **UI Components** | Lucide Icons, react-markdown, remark-gfm, Tailwind Typography |

---

## 🗄️ Database Structure

Currently, the backend runs on **SQLite** (`tesera.db`) for rapid local development. Swap to PostgreSQL in production by updating `DATABASE_URL` in `.env` / `core/config.py`.

### Entity Relationship Diagram (ERD)

The platform uses a **multi-tenant B2B architecture** — every operational record is scoped to a `Company`. Users authenticate to manage resources belonging exclusively to their company.

```mermaid
erDiagram
    COMPANY {
        UUID id PK
        String name
        String tax_number
        String address
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

    USER_SETTINGS {
        UUID id PK
        UUID user_id FK
        String theme
        JSON sidebar_order
        JSON sidebar_enabled
        Boolean notifications_enabled
        Boolean onboarding_completed
    }

    SUBSCRIPTION {
        UUID id PK
        UUID company_id FK
        String plan
        String status
        DateTime trial_ends_at
        DateTime cancelled_at
        DateTime created_at
    }

    ORDER {
        String id PK
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
        String id PK
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
        String id PK
        UUID company_id FK
        String orderId FK
        String carrier
        String trackingCode
        String status
        String origin
        String destination
        String estimatedDelivery
        Boolean isDelayed
        String delayReason
    }

    WORKFLOW {
        UUID id PK
        UUID company_id FK
        String name
        String description
        String trigger_type
        JSON trigger_config
        Boolean is_active
        DateTime created_at
        DateTime updated_at
    }

    WORKFLOW_STEP {
        UUID id PK
        UUID workflow_id FK
        String name
        String description
        String step_type
        JSON step_config
        Integer order
        DateTime created_at
    }

    NOTIFICATION {
        UUID id PK
        UUID company_id FK
        UUID user_id FK
        String title
        String message
        String type
        String priority
        JSON meta_data
        Boolean is_read
        DateTime read_at
        DateTime created_at
    }

    AI_CONVERSATION {
        UUID id PK
        UUID company_id FK
        UUID user_id FK
        String title
        DateTime created_at
        DateTime updated_at
    }

    AI_MESSAGE {
        UUID id PK
        UUID conversation_id FK
        String role
        String content
        DateTime created_at
    }

    COMPANY ||--o{ USER : "has"
    COMPANY ||--o{ ORDER : "owns"
    COMPANY ||--o{ INVENTORY_ITEM : "owns"
    COMPANY ||--o{ SHIPMENT : "owns"
    COMPANY ||--o{ WORKFLOW : "owns"
    COMPANY ||--o{ NOTIFICATION : "receives"
    COMPANY ||--o{ AI_CONVERSATION : "has"
    COMPANY ||--o{ SUBSCRIPTION : "has"
    USER ||--|| USER_SETTINGS : "configures"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ AI_CONVERSATION : "starts"
    AI_CONVERSATION ||--o{ AI_MESSAGE : "contains"
    WORKFLOW ||--o{ WORKFLOW_STEP : "contains"
    ORDER ||--o{ SHIPMENT : "fulfilled by"
```

---

## 📐 Use Case Diagrams

### Order Management

```mermaid
graph TD
    A((Company User)) --> B[View Orders List]
    A --> C[Create New Order]
    A --> D[Filter & Search Orders]
    A --> E[Update Order Status]
    A --> F[Delete Order]
    A --> G[Simulate Order via Test Simulator]

    C --> H{Triggers}
    E --> H
    H --> I[/Create Notification\]
    H --> J[/Trigger Workflow Event\]

    style A fill:#fa7f05,color:#fff,stroke:#fa7f05
    style H fill:#35ada3,color:#fff,stroke:#35ada3
    style I fill:#e0f7f5,stroke:#35ada3
    style J fill:#e0f7f5,stroke:#35ada3
```

### Inventory Management

```mermaid
graph TD
    A((Company User)) --> B[View Inventory List]
    A --> C[Add New Product]
    A --> D[Edit Product]
    A --> E[Delete Product]
    A --> F[Import CSV]
    A --> G[Export CSV]
    A --> H[Filter by Category / Status]

    C --> I{Stock Check}
    D --> I
    I -->|stock <= minStock| J[/Low Stock Warning Notification\]
    I -->|stock <= 0| K[/Critical Stock Notification\]
    C --> L[/New Inventory Notification\]

    style A fill:#fa7f05,color:#fff,stroke:#fa7f05
    style I fill:#35ada3,color:#fff,stroke:#35ada3
    style J fill:#fff3e0,stroke:#fa7f05
    style K fill:#fdecea,stroke:#e53935
    style L fill:#e0f7f5,stroke:#35ada3
```

### Workflow Builder

```mermaid
graph TD
    A((Company User)) --> B[View Workflows]
    A --> C[Create Workflow]
    A --> D[Edit Workflow]
    A --> E[Delete Workflow]
    A --> F[Activate / Deactivate Workflow]
    A --> G[Add Step to Workflow]
    A --> H[Remove Step from Workflow]
    A --> I[Test via Test Simulator]

    C --> J{Trigger Type}
    J --> K[Manual]
    J --> L[Scheduled]
    J --> M[Webhook]
    J --> N[Event]

    G --> O{Step Type}
    O --> P[Send Notification]
    O --> Q[Update Inventory]
    O --> R[Create Order]
    O --> S[AI Action]
    O --> T[Delay]

    C --> U[/Workflow Created Notification\]
    D --> V[/Workflow Updated Notification\]
    E --> W[/Workflow Deleted Notification\]

    style A fill:#fa7f05,color:#fff,stroke:#fa7f05
    style J fill:#35ada3,color:#fff,stroke:#35ada3
    style O fill:#35ada3,color:#fff,stroke:#35ada3
```

### Notification Center

```mermaid
graph TD
    SYS((System / Modules)) --> A[Orders Module]
    SYS --> B[Inventory Module]
    SYS --> C[Shipments Module]
    SYS --> D[Workflows Module]
    SYS --> E[AI Assistant]

    A --> F[/Create Notification\]
    B --> F
    C --> F
    D --> F
    E --> F

    F --> G[(Notification Store)]

    USR((Company User)) --> H[View Notification Center]
    USR --> I[Mark Single as Read]
    USR --> J[Mark All as Read]
    USR --> K[Delete Single Notification]
    USR --> L[Delete All Notifications]
    USR --> M[View Topbar Badge & Dropdown]

    G --> H
    G --> M

    style SYS fill:#35ada3,color:#fff,stroke:#35ada3
    style USR fill:#fa7f05,color:#fff,stroke:#fa7f05
    style G fill:#f5f5f5,stroke:#999
    style F fill:#e0f7f5,stroke:#35ada3
```

### Shipment Tracking

```mermaid
graph TD
    A((Company User)) --> B[View Shipments List]
    A --> C[Create Shipment]
    A --> D[Update Shipment Status]
    A --> E[Check Delay Status]
    A --> F[Filter Shipments]
    A --> G[Simulate Carrier Update via Test Simulator]

    C --> H[/New Shipment Notification\]
    D --> I{Status Changed?}
    I --> J[/Status Change Notification\]
    E --> K{Is Delayed?}
    K -->|Yes| L[/Delay Warning Notification\]

    style A fill:#fa7f05,color:#fff,stroke:#fa7f05
    style I fill:#35ada3,color:#fff,stroke:#35ada3
    style K fill:#35ada3,color:#fff,stroke:#35ada3
    style H fill:#e0f7f5,stroke:#35ada3
    style J fill:#e0f7f5,stroke:#35ada3
    style L fill:#fff3e0,stroke:#fa7f05
```

---

## 🔐 Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant FastAPI
    participant DB as SQLite DB
    participant SMTP as Email Server

    Note over User, SMTP: Registration Flow
    User->>Frontend: Fills Company & Admin details
    Frontend->>FastAPI: POST /api/v1/auth/register
    FastAPI->>DB: Create Company & User (is_verified=false)
    FastAPI->>FastAPI: Generate Verification Token
    FastAPI-->>Frontend: 201 Created
    FastAPI-->>SMTP: Send HTML Verification Email

    Note over User, SMTP: Email Verification Flow
    User->>Frontend: Clicks Link (/verify-email?token=...)
    Frontend->>FastAPI: POST /api/v1/auth/verify-email
    FastAPI->>DB: Set is_verified = True
    FastAPI-->>Frontend: 200 OK
    Frontend->>User: Redirect to /onboarding

    Note over User, SMTP: Login Flow
    User->>Frontend: Enters Email & Password
    Frontend->>FastAPI: POST /api/v1/auth/login
    FastAPI->>DB: Validate Credentials & is_verified
    FastAPI-->>Frontend: Returns JWT Access Token
    Frontend->>Frontend: Saves Token (Cookie & LocalStorage)
    Frontend->>User: Redirects to /dashboard (or /onboarding if new)

    Note over User, SMTP: Forgot Password Flow
    User->>Frontend: Enters Email
    Frontend->>FastAPI: POST /api/v1/auth/forgot-password
    FastAPI->>FastAPI: Generate Reset Token
    FastAPI-->>SMTP: Send HTML Reset Email
    User->>Frontend: Clicks Link (/reset-password?token=...)
    Frontend->>FastAPI: POST /api/v1/auth/reset-password
    FastAPI->>DB: Update hashed_password
    FastAPI-->>Frontend: 200 OK
```

---

## 📁 Project Structure

```
tesera/
├── frontend/               # Next.js 15 (App Router) application
│   └── src/
│       ├── app/            # Route segments (landing, auth, dashboard)
│       ├── components/     # Reusable UI components & sections
│       ├── data/           # Static data & config
│       └── types/          # TypeScript type definitions
├── backend/                # FastAPI application
│   └── app/
│       ├── api/            # Route handlers (auth, orders, inventory, etc.)
│       ├── agents/         # AI agent logic
│       └── core/           # Config, DB, dependencies
├── docker/                 # Docker Compose configs (planned)
└── memory-bank/            # Project context & development rules
```

### Dashboard Routes

| Route | Module |
|---|---|
| `/dashboard` | Overview & KPIs |
| `/dashboard/orders` | Order Management |
| `/dashboard/inventory` | Inventory Management |
| `/dashboard/shipments` | Shipment Tracking |
| `/dashboard/ai-assistant` | AI Chat Assistant |
| `/dashboard/workflows` | Workflow Builder |
| `/dashboard/analytics` | Analytics & Charts |
| `/dashboard/notifications` | Notification Center |
| `/dashboard/integrations` | Marketplace Integrations |
| `/dashboard/team` | Team Management *(Coming Soon)* |
| `/dashboard/settings` | Settings (Profile, Preferences, Billing) |
| `/dashboard/test` | Developer Test Simulator |

---

## 🧪 Test Simulator

A built-in developer tool at `/dashboard/test` for generating mock data and testing all platform features without manual data entry.

| Module | Description |
|---|---|
| **1 — Bulk Seed** | Fills DB with randomised inventory, orders, and shipments |
| **2 — Random Product** | Instantly adds a random inventory product |
| **3 — Random Shipment** | Creates a random shipment for an existing order |
| **4 — Order Simulator** | Lists inventory and places customer orders per product |
| **5 — Carrier Interface** | Simulates carrier status updates and delay triggers |
| **6 — AI Assistant Test** | Verifies Gemini/OpenAI API connection inline |
| **7 — Workflow Test** | Generates sample workflows with test steps |
| **8 — Notification Test** | Creates sample notifications with random types/priorities |
| **Clear All** | Wipes all company data (inventory, orders, shipments, workflows, notifications, AI history) |

---

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- A Gemini API Key (`GEMINI_API_KEY`) and optionally an OpenAI key (`OPENAI_API_KEY`)
- SMTP credentials for email (Gmail supported via `USE_GMAIL_SMTP=true`)

### Frontend

```bash
cd frontend
cp .env.example .env.local   # configure NEXT_PUBLIC_API_URL
npm install
npm run dev                  # http://localhost:3000
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate     # Windows: venv\Scripts\activate
cp .env.example .env         # fill in secrets
pip install -r requirements.txt
uvicorn app.main:app --reload  # http://localhost:8000
```

> **Optional seed:** `python seed.py` — populates the database with demo data.

---

## 👥 Team

The people who built Tesera:

<table>
  <tr>
    <td align="center">
      <b>Yusuf Atas</b><br/>
      CEO & DevOps Engineer<br/>
      <a href="https://linkedin.com/in/yusuf-atas34">LinkedIn</a> · <a href="https://github.com/yusufatass">GitHub</a>
    </td>
    <td align="center">
      <b>Ulas Can Demirbag</b><br/>
      CTO & Fullstack Engineer<br/>
      <a href="https://www.linkedin.com/in/ulascandemirbag/">LinkedIn</a> · <a href="https://github.com/ulascan54">GitHub</a>
    </td>
    <td align="center">
      <b>Sedef Esra Kazan</b><br/>
      CBD & Business Development & Marketing<br/>
      <a href="https://www.linkedin.com/in/sedef-kazan-a90400332/">LinkedIn</a> · <a href="https://github.com/sedefkazan">GitHub</a>
    </td>
  </tr>
</table>

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License — Copyright (c) 2026 Tesera (Yusuf Atas, Ulas Can Demirbag, Sedef Esra Kazan)
```
