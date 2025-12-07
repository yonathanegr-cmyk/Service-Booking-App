# Service Booking App (Beedy)

## Overview
Beedy is a React and TypeScript-based service booking application for the Israeli market, connecting customers with home service providers. It features an AI-powered bidding system, smart data collection, real-time provider tracking, and PayPal Escrow payments, all with a fully functional RTL Hebrew interface. The project aims to provide a comprehensive, real-time service booking experience for users, professionals, and administrators.

## User Preferences
- Interface language: Hebrew (RTL)
- Primary audience: Israeli market

## System Architecture

### 5-Layer Service Booking Lifecycle
The application utilizes a unified, end-to-end architecture where User Client, Professional App, and Super Admin Dashboard share the same real-time data source.

*   **Layer 1: Database Types**: Defines core data structures like `JobStatus` (e.g., `searching`, `accepted`, `completed`), `Job` (containing status, location, service data, etc.), and `JobLog` for audit trails.
*   **Layer 2: Smart Matching**: Geo-aware professional matching based on categories, radius, and a weighted scoring system (proximity, rating, experience, verification, urgency).
*   **Layer 3: Job Service**: Handles CRUD operations for jobs with status validation, real-time provider location updates, and cache management for data consistency.
*   **Layer 4: State Management**: Uses React Context (`JobContext`, `BookingContext`, `OrderStore`) with SessionStorage persistence and Supabase real-time subscriptions for live updates across components. The **OrderStore** (`src/stores/OrderStore.tsx`) serves as the central hub for all order data, enabling unified order flow across all dashboards.
*   **Layer 5: Admin Visibility**: Provides a real-time monitoring dashboard for administrators, including live maps and technical logs.

### UI/UX Decisions
-   **Styling**: Tailwind CSS v4 with custom theming.
-   **UI Components**: Radix UI primitives for accessible, unstyled components.
-   **Maps**: Pigeon Maps with Mapbox provider for live tracking.
-   **Accessibility**: WCAG 2.1 AA compliant, including full RTL support with `dir="rtl"` and `lang="he"`.
-   **Address Validation**: Strict validation using autocomplete, GPS detection, or quick shortcuts.
-   **Visual Consistency**: Maintained across different sections like landing and map views.

### Technical Implementations
-   **Frontend**: React 18.3 with TypeScript, built using Vite 6.3.
-   **State Management**: Utilizes React Context with `sessionStorage` and Supabase real-time subscriptions.
-   **GPS Tracking**: `useGpsTracking` hook for real-time provider location updates.
-   **AI-powered Bidding System**: Enables real-time provider bids with guaranteed pricing and data collection.
-   **Professional Matching Algorithm**: Employs a weighted scoring system for optimal provider-job matching.
-   **Security Code Verification**: A 4-digit PIN for client/provider identity verification.
-   **Admin Action System**: Centralized system for managing user actions, including ban, refund, document review, reassign, and cancellation.
-   **Order Details Control Tower**: Admin interface with a vertical timeline, map, and detailed order information.

### Feature Specifications
-   **Landing Page**: Quick booking via service category selection.
-   **Smart Data Collection**: AI-powered problem analysis with media uploads.
-   **Bidding System**: Real-time provider bidding.
-   **User Live Tracking**: Full-screen map with provider location, ETA, and communication options.
-   **Pro Mission Controller**: Job management for professionals including status transitions and GPS tracking.
-   **Live Operations**: Admin dashboard for real-time job monitoring.
-   **Professional Authentication (ProAuth)**: Unified authentication component combining login and registration on a single page with tab toggle system. Features: (1) **Login Mode** - Email/password form, social logins (Google/Apple), demo account access, and benefits list. (2) **Registration Mode** - 4-step wizard with React Hook Form + Zod validation including Account Credentials (email/password/phone + social login), Identity (profile photo, name, bio, service area), Skills & Expertise (12 service categories, custom skills, hourly rate, experience), and Portfolio & Trust (portfolio images, certifications, availability). Visual identity: Teal-to-emerald gradient color scheme with Wrench icon (🔧). Features smooth animated transitions, step indicator with progress bar, mobile-responsive design, and full Hebrew RTL support.
-   **Pro Dashboard Command Center**: Comprehensive provider management with Smart Tab System (Opportunity Feed, My Schedule), Enriched Request Cards, Auction-Style Bidding System, and Execution State Machine. This includes features like real-time notifications, client messaging, quick notes, and detailed request information with AI analysis.
-   **ProSettings Enhancements**: Profile management, photo upload with advanced editing, vehicle details, service area configuration, notification settings, and **Professional Capabilities System** for skill-based matching.
-   **Professional Capabilities System**: Allows professionals to select specific skills within 6 service categories (plumbing, electrical, cleaning, beauty, locksmith, appliances), set proficiency levels (basic/intermediate/expert), and mark favorites. Features include category filters with counts (selected/total), search functionality, sidebar badge showing total selected capabilities, and **custom capability creation** allowing professionals to add their own unique skills. Custom capabilities are visually distinguished with green styling and can be deleted. This enables AI-powered request matching with the right professionals based on their declared skills.
-   **ProNotifications Page**: A full-featured notification center with filtering and interactive elements.
-   **ProFinance Features**: Quote generation, OCR expense scanning, and P&L report exports.
-   **ProMessages Real-time Chat**: Functional messaging system with auto-scroll and delivery status.
-   **ProResources Suppliers Page**: Directory of suppliers with search, filter, and map integration.
-   **ProActiveJob Completion Flow**: Guided job completion with summary, documentation, and celebratory animations.
-   **Quick Notes Task System**: Task management with add, toggle, delete functionalities.

### System Design Choices
-   **Environment Management**: Dynamic switching between DEV/PROD environments with visual indicators.
-   **Modular Component Structure**: Organized `components/` directory for better maintainability.
-   **PayPal Escrow**: 14-day hold for professional payouts to ensure service quality.
-   **Database Architecture**: Unified PostgreSQL/Supabase schema with detailed ERD and role-based security policies (RLS).

### Unified Order Flow System
The application now features a centralized order management system connecting all dashboards:

1. **OrderStore** (`src/stores/OrderStore.tsx`): Central React Context store managing all orders with:
   - CRUD operations: `createOrder`, `updateOrderStatus`, `cancelOrder`
   - Bidding system: `submitBid`, `acceptBid`, `getOrderOffers`
   - Role-based filtering: `getClientOrders`, `getProviderOrders`, `getAvailableRequests`, `getAdminOrders`
   - **Capability-based matching**: `getMatchedRequests()` returns jobs sorted by match score with professional capabilities
   - Real-time synchronization via `subscribe` mechanism
   - SessionStorage persistence for demo continuity

### Capability-Based Matching System
The system intelligently matches service requests with professional capabilities:

1. **CapabilityMatchingService** (`src/services/CapabilityMatchingService.ts`):
   - Maps service request subProblems (leak, clog, outlet, etc.) to professional capabilities (leak_repair, drain_cleaning, outlet_install, etc.)
   - Calculates match scores (0-100) based on:
     - Capability coverage (how many required skills the pro has)
     - Proficiency levels (basic: 60pts, intermediate: 80pts, expert: 100pts)
     - Urgency bonuses for emergency-capable professionals
     - Complexity multipliers for expert-level work
   - Cross-category support for AC/electrical/appliances overlap

2. **Match Score Display in ProRequestsManager**:
   - High match (≥70%) shows teal/emerald badge with percentage
   - Excellent match (≥80%) adds sparkle icon on profile
   - Matched capabilities shown as tags (e.g., "תיקון נזילות", "פתיחת סתימות")

3. **Request Sorting**: Professionals see requests sorted by match score (best matches first)

4. **Order Flow with Structured Data**:
   - **Landing Page** → User selects category → SmartDataCollection collects structured data (subProblem, complexity, urgency, media)
   - **SmartDataCollection** → Creates `orderBookingData` with all structured fields → Calls `createOrder()`
   - **OrderStore.createOrder()** → Maps structured data to `Job.serviceData`:
     - `booking.subProblem` → `serviceData.subcategory`
     - `booking.complexity` → `serviceData.complexity`
     - `booking.urgency` → `serviceData.urgencyLevel`
     - `booking.mediaUrls` → `serviceData.mediaUrls`
   - **CapabilityMatchingService** → `extractRequirementsFromJob()` reads structured fields directly (no text parsing needed)
   - **Pro Dashboard** → Professional sees requests sorted by match score → Submits bid

5. **Status Lifecycle**: `searching` → `pending_acceptance` → `accepted` → `en_route` → `arrived` → `in_progress` → `payment_pending` → `completed`

### Reusable Components
-   **JobDetailsCard**: A versatile component for displaying and editing booking details, supporting both read-only and editing modes with features like category selection, address input with autocomplete, GPS auto-detection, and booking type toggles.
-   **BidProposalModal**: Shared modal component for professional bid submissions, used by both ProOverview and ProRequestsManager. Features a compact, scrollable design with order info header, AI analysis section (teal/green gradient), photo gallery, client message, market insights with price range slider and competitor bids, and bid form. Supports existing bid editing with pre-fill and consistent RTL Hebrew support.

## External Dependencies

-   **Supabase**: Backend-as-a-Service for database and authentication.
-   **PayPal REST API**: Payment processing and escrow.
-   **Pigeon Maps**: OpenStreetMap-based mapping library.
-   **Mapbox**: Specific map functionalities and location services.
-   **Vite**: Frontend build tool.
-   **Tailwind CSS**: Utility-first CSS framework.
-   **Radix UI**: Unstyled, accessible UI component primitives.
-   **Sonner**: Toast notifications.
-   **Express.js**: Backend server for PayPal integration.