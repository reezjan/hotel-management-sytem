# Hotel Management System

## Overview
This project is a comprehensive hotel management system designed to streamline hotel operations. It features role-based dashboards for various staff members, including super admin, owner, manager, front desk, housekeeping, restaurant/bar management, security, and finance. The system aims to provide an efficient and integrated platform for managing all aspects of a hotel's daily operations, from guest services to inventory and financial reporting.

## Recent Changes (October 7, 2025)

### Hall Bookings - Dynamic Pricing with Manual Override
Implemented dynamic pricing functionality for hall bookings with manual override capability:

**Frontend Enhancements:**
- Added `numberOfPeople` and `hallBasePrice` fields to booking forms (both create and edit)
- Implemented auto-population of hall base price when a hall is selected
- Added dynamic balance calculation that updates automatically when total or advance payment changes
- Balance due field is read-only and auto-calculated in both forms
- Front desk can manually override the total amount for custom pricing scenarios

**Schema Updates:**
- `hallBookings` table already includes `numberOfPeople` (integer) and `hallBasePrice` (numeric) columns
- Updated Zod insert schema to properly validate and transform these fields
- All fields properly persist to PostgreSQL database

**User Flow:**
1. Front desk selects a hall → base price auto-populates
2. Enters number of people → can be used for pricing calculations
3. Total amount is editable by front desk (manual override capability)
4. Advance payment entry → balance due automatically recalculates
5. Balance due is always read-only and auto-calculated (total - advance)

## User Preferences
I prefer detailed explanations and an iterative development approach. Please ask before making major changes. Do not make changes to the `shared/` folder unless absolutely necessary and with prior approval. Do not modify the core authentication logic in `server/auth.ts` without explicit instruction.

## System Architecture
The system is built as a full-stack application using React and TypeScript for the frontend, and Express.js with Node.js for the backend. PostgreSQL is used as the primary database, managed with Drizzle ORM for type-safe interactions.

**Frontend:**
-   **Framework**: React 18 with Vite for fast development.
-   **Styling**: TailwindCSS for utility-first styling, complemented by shadcn/ui and Radix UI primitives for accessible and customizable UI components.
-   **Routing**: Wouter for lightweight client-side routing.
-   **State Management**: TanStack Query for data fetching, caching, and state synchronization.

**Backend:**
-   **Framework**: Express.js handles API routes and server logic.
-   **Authentication**: Passport.js with a local strategy secures the application, providing multi-role authentication.
-   **Database ORM**: Drizzle ORM ensures type-safe database operations with PostgreSQL.

**Key Features:**
-   **Multi-role Authentication**: Supports 17 distinct roles with tailored dashboards and permissions.
-   **Comprehensive Management Modules**: Includes guest/customer, room/hall, restaurant/bar operations, inventory, staff, task assignment, maintenance, financial, and vendor management.
-   **UI/UX**: Focuses on clean, functional dashboards tailored to specific user roles.
-   **API Design**: All API routes are prefixed with `/api`.
-   **Database Management**: Drizzle Kit is used for schema migrations, prohibiting manual SQL changes.
-   **Unified Development Server**: A single server on port 5000 serves both frontend and backend in development, with Vite HMR enabled.

## External Dependencies
-   **PostgreSQL**: Relational database for all application data.
-   **Vite**: Frontend build tool.
-   **Wouter**: Frontend routing library.
-   **TailwindCSS**: CSS framework.
-   **shadcn/ui & Radix UI**: UI component libraries.
-   **TanStack Query**: Data fetching and state management.
-   **Express.js**: Backend web framework.
-   **Node.js**: JavaScript runtime.
-   **Drizzle ORM**: TypeScript ORM for PostgreSQL.
-   **Passport.js**: Authentication middleware.
-   **Lucide icons**: Icon library.