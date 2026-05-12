# Progress: Tesera

## Current Status
**Phase 1 COMPLETE. Phase 2 COMPLETE.**
Frontend dev server running at http://localhost:3000

## What Works

### ✅ Phase 1 – Foundation
- Memory Bank initialized (all 5 core files)
- Next.js 16 (App Router) + TypeScript + TailwindCSS + shadcn/ui v4 + Framer Motion
- Tesera design system (brand tokens: warm indigo primary, calm neutrals, dark/light mode)
- Inter font, custom CSS utility classes (`gradient-text`, `hero-gradient`, `glow-border`, `glass-card`, `section-container`)
- Root layout with ThemeProvider + Sonner toasts
- **Landing Page** — 6 modular sections: Hero, Problem, Features (8 pillars), Pricing (4 plans), FAQ, CTA
- Responsive Navbar with sticky scroll-blur
- Footer with links
- Login page (company-first, no consumer accounts)
- Register page (company name first field)
- Backend scaffold: FastAPI main.py, requirements.txt, .env.example
- README.md documentation

### ✅ Phase 2 – Dashboard Shell
- Collapsible Sidebar (60 route group) with active-state routing
- Topbar with search, notifications badge, dark/light toggle, dynamic user avatar
- Dashboard layout (`(dashboard)/layout.tsx`) with full-height sidebar + scrollable main
- Dashboard Overview page: greeting, 4 StatCards, RecentOrders table, AIRecommendations card
- Reusable StatCard, RecentOrders, AIRecommendations components
- Placeholder pages for all 10 dashboard routes

### ✅ Phase 2.5 – Full Authentication System
- **Backend API (FastAPI)**: JWT-based auth, secure Bcrypt hashing, SQLite integration.
- **Database Schema**: `Company` and `User` models configured with `is_verified` flags.
- **Frontend Integration**: Hooked up `/login` and `/register` with live `fetch` API wrappers (`src/lib/auth.ts`).
- **Real Email SMTP**: Live automated email sender (`smtplib`) for Verification & Password Resets via `.env`.
- **Route Protection**: Unverified users are blocked from `/dashboard` and forcefully redirected to `/pending-verification`.
- **Auth UI Pages**: Added `/forgot-password`, `/reset-password`, `/verify-email`, and `/pending-verification` flows.

### ✅ Phase 2.6 – Branding & Re-styling
- **Color Palette Update**: Switched base theme to `#fa7f05` (Orange) for primary and `#35ada3` (Teal) for secondary.
- **Logo Integration (`next/image`)**: Completely replaced text-based logos with `logo.png` across all areas (Navbar, Footer, Sidebar, and Auth pages) with carefully adjusted max widths to accommodate horizontal layout.
- **Dynamic Sidebar**: Added `mini-logo.png` fallback that appears when the dashboard sidebar is collapsed.
- **Hero Enhancements**: Embedded large animated `mini-logo.png` into the Landing page hero section.
- **Backend Email Templates**: Restructured SMTP emails into modern HTML formats encapsulating the frontend's `logo.png` and `#fa7f05` brand color.
- **Landing Page Polish**: Upgraded the "Features" section by replacing default icons with high-quality custom illustrations (`object-contain`), transforming them into large, centered, modern UI cards with hover animations.

### ✅ Phase 2.7 – Full Turkish Localization
- **Landing Page**: Fully translated all static content to Turkish (Hero, Problem, Features, Pricing, FAQ, CTA, Footer).
- **Authentication Flow**: Translated all login, register, password reset, and email verification pages. Updated form labels, placeholders, and Sonner toast messages.
- **Backend Email Templates**: Localized the HTML bodies and subject lines for verification and password reset emails sent by FastAPI.
- **Dashboard & Components**: Translated the Sidebar, Topbar, page headers, tables (Recent Orders, Shipments, Inventory), and metric cards to Turkish.
- **Test Simulator**: Translated the entire Unified Test Simulator page and updated the `README.md` instructions accordingly.

## What's Left to Build

### 🚧 Phase 3 – Core Modules (Review & Refinement)
- [x] **ERD Verification**: Review existing Phase 3 models (Order, Inventory, Shipment) against the ERD.
- [x] **Backend & Mock Data**: Rebuilt SQLite tables to fully support multi-tenancy (`company_id`). Created a robust randomizing seed mechanism to prevent `IntegrityError` collisions.
- [x] **UI Consistency**: Standardized search and filter layouts across `/dashboard/orders`, `/dashboard/inventory`, and `/dashboard/shipments` into a single inline flex-row design.
- [x] **Inventory Management**: Upgraded `shadcn` Sheet to `ProductSheet` handling both "New Product" creation and "Edit Product". Added Edit/Delete icons to the Inventory table.
- [x] **Testing Simulators**:
    - Combined all testing tools into a **Unified Test Simulator** at `/dashboard/test`.
    - Features: Bulk Data Seeding, Random Product Generator, Random Shipment Generator, Order Simulator, Shipment Carrier interface, DB Clear (wipes all company inventory, orders, shipments, and AI chat history), and AI Chat Test with markdown rendering.
- [x] **Sidebar Enhancements**: Organized the sidebar into categorical groups (Core, Insights, Management, Dev Tools) with proper labels and updated icons (`FlaskConical` for testing).

### ✅ Phase 4 – AI Assistant (Gemini + OpenAI)
- [x] **Backend API**: `/api/v1/ai/chat` endpoint migrated to **Gemini** (`gemini-1.5-flash`) primary with **OpenAI** (`gpt-4o-mini`) fallback. Robust error handling for 401/402/429 rate limit and quota exhaustion.
- [x] **LLM Provider Config**: Replaced `GROK_API_KEY` with `GEMINI_API_KEY` in `config.py` and updated `.env.example`.
- [x] **Chat History Persistence**: New SQLAlchemy models `AIConversation` + `AIMessage`. Backend endpoints: `GET /ai/conversations`, `GET /ai/conversations/{id}`, `DELETE /ai/conversations/{id}`. Messages saved to DB per conversation; full history sent to LLM context.
- [x] **Frontend Chat UI**: Full conversational chat interface at `/dashboard/ai-assistant` with starter prompts, message bubbles, loading states, and clear conversation button.
- [x] **Conversation Sidebar**: Left sidebar showing past conversations (title + timestamp), load-on-click, new conversation button, delete confirmation dialog.
- [x] **Markdown Rendering**: AI responses rendered via `react-markdown` + `remark-gfm` with Tailwind Typography (`prose`) support for headings, lists, code blocks, links, and tables.
- [x] **Layout Fix**: Chat area uses full viewport height (`h-full -m-6`) to eliminate extra top/bottom padding and scroll.
- [x] **Test Simulator Integration**: Added **Module 5 – YZ Asistanı Testi** to the Unified Test Simulator for quickly verifying the API connection without navigating away.
- [x] **Dashboard AI Recommendations**: `GET /ai/recommendations` endpoint queries LLM with current company data and returns 3 actionable recommendations (type, message, action). Frontend `AIRecommendations` component fetches live suggestions with loading state, refresh button, and static fallback on error. Action buttons are fully clickable and route to the relevant dashboard pages: *Sipariş Ver* → Inventory, *Siparişleri Hazırla* → Orders, *Gecikme Nedenini Gör* → Shipments.

### ✅ Phase 4 – Agent Workflow Builder
- [x] **Backend Database Models**: Created `Workflow` and `WorkflowStep` SQLAlchemy models with multi-tenancy support (`company_id`). Workflow includes trigger types (manual, scheduled, webhook, event) and trigger config. WorkflowStep includes step type, step config, name, description, and order.
- [x] **Backend Schemas**: Added Pydantic schemas for `Workflow`, `WorkflowStep`, `WorkflowCreate`, and `WorkflowUpdate` with UUID and datetime field serializers for proper API response serialization.
- [x] **Backend API Routes**: Implemented full CRUD endpoints at `/api/v1/workflows` (GET list, GET by ID, POST create, PUT update, DELETE delete). All endpoints include UUID conversion from string to handle frontend requests properly.
- [x] **Frontend Types**: Created TypeScript types for `Workflow`, `WorkflowStep`, `WorkflowCreate`, and `WorkflowUpdate` in `frontend/src/types/workflow.ts`.
- [x] **Frontend Workflow Builder UI**: Built complete workflow management interface at `/dashboard/workflows` with:
  - Card-based workflow list display with trigger icons (Zap for manual, Clock for scheduled, Webhook for webhook)
  - Create workflow dialog with name, description, and trigger type selection
  - Edit workflow dialog with full editing capabilities (name, description, trigger type)
  - Toggle active/inactive functionality with "Başlat/Durdur" button
  - Delete workflow with confirmation dialog
  - Empty state with call-to-action
  - Turkish localization throughout
- [x] **Step Management**: Added comprehensive step creation/editing/deletion functionality:
  - Step creation form in both create and edit dialogs
  - Step types: Bildirim Gönder, Envanter Güncelle, Sipariş Oluştur, YZ Aksiyonu, Gecikme
  - Step list display with order numbers
  - Step deletion with trash icon button
  - Automatic order recalculation when steps are added/removed
- [x] **Test Simulator Integration**: Added **Module 6 – İş Akışı Testi** to the Unified Test Simulator at `/dashboard/test` for quickly generating sample workflows with test steps.
- [x] **Error Handling**: Added detailed error handling for all workflow operations (create, update, delete, toggle) with console logging and user-friendly toast messages showing actual backend error details.
- [x] **Module Integration**: Added automatic notification creation to all core modules:
  - **Orders**: Notification created when new order is received (success priority) + PUT endpoint creates notification when order status changes (info priority) + deadline check endpoint to create warning notifications when order delivery date is approaching
  - **Shipments**: Notification created when new shipment is created (success priority) + delay check endpoint to create warning notifications when shipment is past estimated delivery date + PUT endpoint creates notification when shipment status changes (info priority) + test update endpoint with status change notification
  - **Inventory**: Notification created when new item is added (success priority) + low stock check endpoint to create warning notifications when stock falls below threshold + PUT endpoint creates notification when inventory quantity decreases (warning priority) + automatic critical stock notification when stock <= minStock (error priority)
  - **Workflows**: Notification created when workflow is created/updated/deleted (success/info/warning priorities)
  - **Test**: Fixed test notification endpoint to require authentication for proper user association
- [x] **Backend Clear Function**: Updated test clear endpoint to also delete workflow data alongside inventory, orders, shipments, and AI chat history.

### ✅ Phase 4 – Notification Center
- [x] **Backend Database Model**: Created `Notification` SQLAlchemy model with multi-tenancy support (`company_id`, `user_id`). Includes title, message, type (order, shipment, inventory, workflow, system), priority (info, warning, error, success), meta_data for additional context, is_read flag, read_at timestamp, and created_at.
- [x] **Backend Schemas**: Added Pydantic schemas for `Notification`, `NotificationBase`, and `NotificationCreate` with UUID and datetime field serializers for proper API response serialization.
- [x] **Backend API Routes**: Implemented full CRUD endpoints at `/api/v1/notifications` (GET list with unread filter, GET by ID, POST create, PUT mark-read, PUT mark-all-read, DELETE delete). Includes `/unread-count` endpoint for badge display. All endpoints include UUID conversion from string to handle frontend requests properly.
- [x] **Frontend Types**: Created TypeScript types for `Notification` and `NotificationCreate` in `frontend/src/types/notification.ts`.
- [x] **Frontend Notification Center UI**: Built complete notification management interface at `/dashboard/notifications` with:
  - Card-based notification list display with type icons (Package for order, Truck for shipment, Workflow for workflow, AlertCircle for system)
  - Priority badges (Hata, Uyarı, Başarılı, Bilgi) with color coding
  - Unread notifications highlighted with left border accent
  - Mark as read functionality with button
  - Mark all as read functionality (shown when unread count > 0)
  - Delete notification with trash icon
  - Delete all notifications with danger alert modal (warning.png image)
  - Empty state with bell icon
  - Turkish localization throughout
- [x] **Navbar Notification Dropdown**: Added notification dropdown to dashboard topbar with:
  - Badge showing unread count (only when unread > 0)
  - Dropdown with recent notifications (last 5)
  - Auto-refresh every 30 seconds
  - Click to mark as read
  - "Tümünü Oku" button when unread count > 0 (immediate UI update)
  - "Tüm Bildirimleri Gör" link to notification center
  - Type icons matching notification center
  - Unread indicator dots
- [x] **Test Simulator Integration**: Added **Module 7 – Bildirim Testi** to the Unified Test Simulator at `/dashboard/test` for quickly generating sample notifications with random types.
- [x] **Backend Clear Function**: Updated test clear endpoint to also delete notification data alongside inventory, orders, shipments, workflows, and AI chat history.
- [x] **Error Handling**: Added detailed error handling for all notification operations with console logging and user-friendly toast messages showing actual backend error details.
- [x] **UI Components**: Created AlertModal and SuccessModal components with warning.png and success.png images for better user feedback
- [x] **Inventory Delete**: Replaced confirm() with AlertModal in inventory page for delete confirmation
- [x] **Real-time Notification Sync**: Added custom event system for immediate notification refresh across app (inventory updates, test simulator changes)
- [x] **Backend Fixes**: Fixed inventory PUT endpoint to use string IDs instead of UUID conversion, fixed SQLAlchemy JSON query for SQLite compatibility
- [x] **Backend API Routes**: Added `/api/v1/notifications/delete-all` DELETE endpoint for bulk deletion

### ✅ Phase 5 – Analytics & Insights
- [x] **Backend Analytics API**: Created `/api/v1/analytics` router with endpoints:
  - `/overview` - Returns overview stats (total orders, revenue, inventory, low stock, active shipments, delayed shipments, pending orders)
  - `/orders/trends` - Returns order trends over time (date, count, revenue) with configurable days parameter
  - `/inventory/by-category` - Returns inventory statistics grouped by category (total stock, item count, total value)
  - `/shipments/status` - Returns shipment status distribution
- [x] **Frontend Analytics Page**: Built complete analytics page at `/dashboard/analytics` with:
  - Line chart showing order trends (count and revenue) over last 30 days
  - Bar chart showing inventory by category (total stock and item count)
  - Pie chart showing shipment status distribution
  - Bar chart showing inventory value by category
  - Responsive charts using Recharts library
  - Loading states and error handling
  - Turkish localization
- [x] **Frontend Insights Dashboard**: Updated `/dashboard` overview page to show real-time KPIs:
  - Total orders with pending orders count
  - Critical stock items count
  - Active shipments with delayed count
  - Total revenue
  - Real-time data from analytics overview endpoint
  - Loading states with "..." placeholder
  - Added analytics chart section showing order trends (last 7 days)
  - Added notifications section showing recent notifications with icons and priority badges
  - Fixed data formatting with nullish coalescing for proper display
- [x] **Inventory Import/Export**: Added import and export functionality to inventory page:
  - "İçe Aktar" button opens Sheet with CSV format instructions
  - "Dışa Aktar" button exports inventory as CSV file
  - Sheet includes column descriptions, example CSV, and upload area
  - Turkish localization with natural cooperative product examples (reçel, bal, turşu)
- [x] **Test Simulator Enhancements**:
  - Turkish-ized all mock data with natural cooperative inventory items:
    - Categories: Reçel, Turşu, Bal, Zeytin, Süt Ürünleri, Kuru Gıda
    - Products: Ayva Reçeli, Çam Balı, Domates Turşusu, Siyah Zeytin, Beyaz Peynir, Tulum Peyniri, Nohut, Mercimek, Bulgur, Pirinç, etc.
    - Orders: Turkish customer names and addresses
    - Carriers: Yurtiçi Kargo, Aras Kargo
    - Statuses: İşleniyor, Kargoda, Teslim Edildi, Yolda
  - Replaced alert() with custom AlertModal for "Tümünü Sil" confirmation
  - Added SuccessModal for successful deletion feedback
  - Fixed shipment delay notification not being created when isDelayed changes
- [x] **Notification System Fixes**:
  - Added notification creation to order creation endpoint (type: "order")
  - Added notification creation to inventory creation endpoint (type: "inventory", priority: warning for low stock)
  - Added inventory icon (Box) to Topbar notification icons
  - Made loadData() calls async with await in test simulator for proper data refresh
  - Added debug console logs for notification-refresh event dispatching and receiving
  - Fixed notification count display to show "5+" when count exceeds 5 in both test simulator and topbar
- [x] **Inventory Import/Export**: Added import and export functionality to inventory page:
  - "İçe Aktar" button opens Sheet with CSV format instructions
  - "Dışa Aktar" button exports inventory as CSV file
  - Sheet includes column descriptions, example CSV, and upload area
  - Turkish localization with natural cooperative product examples (reçel, bal, turşu)
  - Added import mode selection (overwrite vs reset)
  - Added warning modal for reset option
  - Backend handles duplicate SKU skipping in overwrite mode
  - Backend deletes all inventory in reset mode
  - Fixed 422 error by bypassing fetchWithAuth for FormData upload
  - Made import sheet scrollable
- [x] **Integrations Page**: Created marketplace integrations UI:
  - Added 4 integration cards (Trendyol, Hepsiburada, Amazon, Diğer)
  - Used provided brand images for Trendyol, Hepsiburada, Amazon
  - All cards marked as "Yakında" (Coming soon)
  - Responsive grid layout with hover effects
  - Turkish descriptions for each integration
- [x] **Team Page**: Created team management coming soon page:
  - Added large ekip.png illustration
  - Coming soon badge and message
  - Feature cards: Ekip Üyeleri, Kişisel İş Akışları, Rol Yönetimi, İzinler
  - Turkish descriptions for each feature
- [x] **Sidebar Updates**: Added "Yakında" badges:
  - Added badges to Entegrasyonlar and Ekip navigation items
  - Small rounded badge with primary color styling
  - Only visible when sidebar is expanded
- [x] **Topbar Improvements**: Enhanced navigation and search:
  - Removed default "Panel" text, only show pageTitle when provided
  - Moved search bar from right to left
  - Added spacer to push right elements (notifications, theme, profile) to the right
  - Implemented endpoint search with dropdown:
    - Searches dashboard routes (12 pages)
    - Filters by label and URL
    - Shows dropdown with matching results
    - Enter key navigates to first result
  - Click navigates to selected route
  - Highlights current page in dropdown
  - Closes when clicking outside
- [x] **Settings Page**: Created unified settings page with three tabs:
  - Profile tab: User info display, profile completion percentage, company info (organization name, tax number, address), password reset and account deletion buttons
  - Settings tab: Theme setting display, sidebar item management (enable/disable status)
  - Billing tab: Pricing plans from landing page (Ücretsiz Deneme, Başlangıç, Büyüme, Kurumsal), free tier selected by default, other plans marked as "Yakında", trial days remaining display
- [x] **Settings Page Backend Integration**: Connected all settings tabs to backend API:
  - Profile tab: Editable company info form with save functionality, password reset dialog, account deletion dialog with confirmation
  - Settings tab: Theme toggle (light/dark) with immediate application and auto-save, notifications toggle with auto-save, label management (add/remove), sidebar item management (enable/disable with auto-save), drag-and-drop reordering within groups (Temel, İçgörüler, Yönetim, Geliştirici Araçları)
  - Topbar navigation to settings page with tab query params (profile, settings, billing)
- [x] **Backend Models**: Extended user and company models:
  - Added `tax_number` and `address` fields to Company model
  - Created UserSettings model (theme, sidebar_order, sidebar_enabled, notifications_enabled, labels)
  - Created Subscription model (plan, status, trial_ends_at, cancelled_at)
- [x] **Backend API**: Created settings API endpoints:
  - GET /settings/profile - User and company info with completion percentage
  - PUT /settings/profile/company - Update company information
  - GET /settings/user-settings - User theme, sidebar preferences, notifications, and labels
  - PUT /settings/user-settings - Update user settings
  - GET /settings/billing - Subscription info and days remaining
- [x] **Backend Auth API**: Added user management endpoints:
  - POST /auth/change-password - Change user password with current password verification
  - DELETE /auth/delete-account - Delete user account with cascading delete of company, subscriptions, and users
- [x] **Sidebar Settings Integration**: Connected sidebar to user settings:
  - Sidebar loads user settings from backend on mount
  - Sidebar items filtered based on sidebar_enabled array
  - Sidebar groups hidden if all items in group are disabled
  - Sidebar refreshes when settings are saved via custom event
  - Test Simulator (id: 12) added to Geliştirici Araçları group
- [x] **Topbar Settings Integration**: Connected topbar to user settings:
  - Notifications setting loaded from backend
  - Notifications polling only runs when notifications_enabled is true
  - Topbar refreshes notifications setting when settings are saved via custom event
  - Topbar navigation menu (Profil, Ayarlar, Faturalandırma) routes to settings page with appropriate tab
- [x] **Settings Page Cleanup**: Removed labels section from settings page and backend:
  - Removed labels state, UI section, handlers, and save/load logic from frontend settings page
  - Removed labels field from UserSettings model in backend
  - Removed labels from UserSettingsUpdate schema and API endpoints
  - Added warning.png image to account deletion modal in settings page
- [x] **Email Template Enhancement**: Increased email logo size from 40px to 120px and adjusted padding from 24px to 40px 24px for better visibility in verification and password reset emails
- [x] **Skeleton Loading Components**: Added design-appropriate skeleton loading to all data-fetching dashboard pages:
  - Dashboard overview: Stat cards, order trends chart, and notifications
  - Orders: Table skeleton with header and rows
  - Inventory: Table skeleton with header and rows
  - Shipments: Table skeleton with header and rows
  - Analytics: Chart skeletons for order trends, inventory by category, and shipment status
  - Notifications: Notification card skeletons with icon and text
  - Workflows: Workflow card skeletons with icon, title, and badges
  - AI Assistant: Conversation list skeleton with icon and text
- [x] **Backend Model Fix**: Added missing settings relationship to User model to fix SQLAlchemy mapper initialization error
- [x] **Onboarding Flow**: Created step-by-step onboarding page for newly registered users:
  - New `/onboarding` route with multi-step tutorial explaining app features
  - 8 steps covering: Welcome, Inventory, Orders, Shipments, Analytics, Workflows, Notifications, Settings
  - Each step has placeholder icon (love.png) to be replaced with custom designs later
  - 14-day free trial messaging prominently displayed
  - Progress bar showing completion percentage
  - Navigation buttons (Previous/Next/Skip) with smooth transitions
  - Feature preview cards at bottom showing main app capabilities
  - Updated pending-verification page to redirect to `/onboarding` instead of `/dashboard`
  - Updated verify-email page to redirect to `/onboarding` instead of `/login`
  - Turkish localization throughout
- [x] **Onboarding Database Tracking**: Added onboarding_completed field to UserSettings model to track completion status
- [x] **Onboarding Redirect Logic**: Updated login flow to check onboarding status and redirect new users to /onboarding
- [x] **Onboarding Visual Updates**: Replaced placeholder icons with landing page images, updated styling with white background, primary border, object-cover, and overflow-hidden
- [x] **Email SMTP Configuration**: Added Gmail SMTP support with USE_GMAIL_SMTP flag for local development
- [x] **Email Template Updates**: Changed email templates to use mini-logo.png with "Tesera" text in primary color
- [x] **Database Schema Fixes**: Changed UserSettings user_id from INTEGER to UUID to match User model
- [x] **Account Deletion Fix**: Updated delete-account endpoint to properly cascade delete all related data (notifications, AI conversations, workflows, orders, inventory, shipments, subscriptions)
- [x] **AI Chat Improvements**: Updated system instruction to prevent AI from asking clarifying questions and added conversation history summary to maintain context while optimizing token usage
- [x] **AI Predictions Feature**: Added AI-powered predictions endpoint and integrated it into analytics page with sticky sidebar showing business summary, performance analysis, forecasts, and profit/loss predictions with markdown support and regenerate button
- [x] **Error Message Translation**: Translated all user-facing error messages to Turkish in auth pages (login, register, forgot-password, reset-password, verify-email, pending-verification) and backend API endpoints
- [x] **AI Recommendations Fix**: Added missing route decorator to fix 404 error for AI recommendations endpoint

### Phase 6
- [ ] Docker Compose (frontend + backend + postgres + redis)
- [ ] CI/CD prep
- [ ] Final polish + onboarding flow
- [ ] Mobile polish

## Known Issues
- Lockfile warning in Next.js build (root lockfile conflict) — cosmetic, no action needed.

## Routes
- `/` — Landing page
- `/login` — Company login
- `/register` — Company registration
- `/forgot-password` — Password recovery
- `/reset-password` — Password reset form
- `/verify-email` — Email verification handler
- `/pending-verification` — Awaiting email verification screen
- `/dashboard` — Overview
- `/dashboard/orders` — Orders
- `/dashboard/inventory` — Inventory
- `/dashboard/shipments` — Shipments
- `/dashboard/ai-assistant` — AI Assistant
- `/dashboard/workflows` — Workflows
- `/dashboard/analytics` — Analytics
- `/dashboard/notifications` — Notifications
- `/dashboard/integrations` — Integrations
- `/dashboard/team` — Team
- `/dashboard/settings` — Settings
