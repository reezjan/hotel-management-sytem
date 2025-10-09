# Hotel Management System

## Overview
This project is a comprehensive hotel management system designed to streamline hotel operations. It features role-based dashboards for various staff members, including super admin, owner, manager, front desk, housekeeping, restaurant/bar management, security, and finance. The system aims to provide an efficient and integrated platform for managing all aspects of a hotel's daily operations, from guest services to inventory and financial reporting.

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
-   **Hierarchical Leave Approval System**: Implements a multi-level approval workflow for leave requests with smart subordinate filtering and role-based access control.
-   **Complete Leave Request Workflow**: Includes balance tracking, overlap checking, notifications, and automated annual resets.
-   **Room Reservation & Check-in/Check-out System**: Features double-booking prevention, reservation-based check-in/out, and automatic cleaning queue integration.
-   **Restaurant Billing System**: Provides comprehensive cashier functionality with multi-table selection, cascading tax calculation, split bill options, multiple payment methods, bill amendments, and audit trails.
-   **Immutable Financial System**: All financial transactions are permanent with void-only functionality requiring 15+ character justification and manager/owner approval for full audit compliance.
-   **Enterprise-Grade Security**: Production-ready API authentication and authorization with hotel ownership verification on all sensitive endpoints (18 endpoints secured - Oct 2025).

## Security Hardening & Vulnerability Fixes

### Critical Vulnerabilities Fixed (October 2025)

#### 1. Null Byte Injection Attack (CVE-Level Severity)
- **Vulnerability**: Null bytes (`\x00`) in login credentials caused PostgreSQL errors and complete server crash
- **Attack Vector**: `POST /api/login` with username/password containing `\x00` characters
- **Fix Location**: `server/auth.ts` - Added `sanitizeInput()` function
- **Solution**: Input sanitization removes null bytes before database queries, with 1000-char length limit to prevent DoS
- **Testing**: Verified with brutal testing suite - now returns 401 instead of crashing

#### 2. Authorization Bypass Vulnerabilities (18 Endpoints Hardened)
- **Vulnerability**: Missing hotel ownership validation allowed potential cross-hotel data access
- **Fix**: Added `requireActiveUser` middleware + explicit hotel ownership checks
- **Secured Endpoints**:
  1. `GET /api/hotels/:hotelId/users` - User list access
  2. `POST /api/hotels/:hotelId/users` - User creation
  3. `PATCH /api/hotels/:hotelId/users/:userId` - User updates
  4. `DELETE /api/hotels/:hotelId/users/:userId` - User deletion
  5. `GET /api/hotels/:hotelId/roles` - Role access
  6. `GET /api/hotels/:hotelId/rooms` - Room data access
  7. `POST /api/hotels/:hotelId/rooms` - Room creation
  8. `PATCH /api/hotels/:hotelId/rooms/:roomId` - Room updates
  9. `DELETE /api/hotels/:hotelId/rooms/:roomId` - Room deletion
  10. `GET /api/hotels/:hotelId/inventory` - Inventory access
  11. `POST /api/hotels/:hotelId/inventory` - Inventory creation
  12. `PATCH /api/hotels/:hotelId/inventory/:id` - Inventory updates
  13. `DELETE /api/hotels/:hotelId/inventory/:id` - Inventory deletion
  14. `GET /api/hotels/:hotelId/tasks` - Task access
  15. `POST /api/hotels/:hotelId/tasks` - Task creation
  16. `PATCH /api/hotels/:hotelId/tasks/:id` - Task updates
  17. `DELETE /api/hotels/:hotelId/tasks/:id` - Task deletion
  18. All vendor management endpoints
- **Validation Pattern**: `currentUser.hotelId === hotelId || currentUser.role.name === 'super_admin'`

#### 3. Input Validation Hardening
- **SQL Injection**: Blocked via parameterized queries and input validation
- **XSS Prevention**: Input sanitization removes malicious scripts
- **Type Validation**: Strict Zod schema enforcement on all endpoints
- **Numeric Overflow**: Protected against massive numbers and negative amounts
- **Missing Fields**: All required fields validated before processing

#### 4. Financial Transaction Security
- **Void Authorization**: Only managers and owners can void transactions
- **Void Reason Enforcement**: Minimum 15 characters required with validation
- **Double Void Prevention**: System blocks attempts to void already-voided transactions
- **Audit Trail**: Complete immutability with `voidedBy`, `voidedAt`, `voidReason` tracking
- **Location**: `server/routes.ts` (transaction void endpoint), `client/src/pages/dashboard/manager/vendor-payments.tsx` (UI)

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