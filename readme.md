# Hotel Management System

## Overview
This project is a comprehensive hotel management system designed to streamline hotel operations. It provides a multi-role, integrated platform for managing guest services, room/hall, restaurant/bar operations, inventory, staff, tasks, maintenance, finance, and vendor management. The system aims to enhance efficiency across all hotel departments.

## User Preferences
I prefer detailed explanations and an iterative development approach. Please ask before making major changes. Do not make changes to the `shared/` folder unless absolutely necessary and with prior approval. Do not modify the core authentication logic in `server/auth.ts` without explicit instruction.

## System Architecture
The system is a full-stack application built with React and TypeScript for the frontend, and Express.js with Node.js for the backend. PostgreSQL is used as the primary database, managed with Drizzle ORM.

**Frontend:**
-   **Framework**: React 18 with Vite.
-   **Styling**: TailwindCSS, shadcn/ui, and Radix UI.
-   **Routing**: Wouter.
-   **State Management**: TanStack Query.

**Backend:**
-   **Framework**: Express.js.
-   **Authentication**: Passport.js with multi-role support (17 distinct roles).
-   **Database ORM**: Drizzle ORM for type-safe PostgreSQL interactions.

**Key Features:**
-   **Comprehensive Management Modules**: Guest/customer, room/hall, restaurant/bar operations, inventory, staff, task assignment, maintenance, financial, and vendor management.
-   **UI/UX**: Role-specific dashboards focusing on functionality and clarity.
-   **API Design**: All API routes are prefixed with `/api`.
-   **Database Management**: Drizzle Kit for schema migrations; manual SQL changes are prohibited.
-   **Unified Development Server**: Single server on port 5000 for both frontend and backend.
-   **Hierarchical Leave Approval System**: Multi-level workflow with subordinate filtering and role-based access.
-   **Room Reservation & Check-in/Check-out System**: Includes double-booking prevention and automatic cleaning queue integration.
-   **Restaurant Billing System**: Features multi-table selection, cascading tax, split bills, multiple payment methods, and audit trails.
-   **Immutable Financial System**: Transactions are permanent with void-only functionality requiring justification and approval.
-   **Enterprise-Grade Security**: Production-ready API authentication/authorization with hotel ownership verification.
-   **Dual Reporting System**: Separate dashboards for financial analytics and complete operational transparency.
-   **Security Hardening**: Includes fixes for null byte injection, authorization bypass, input validation (SQL injection, XSS, type coercion), secure financial transactions, maintenance request reassignment security, and room status manipulation prevention with audit logging.
-   **Password Security**: Passwords can only be changed via a dedicated reset endpoint, preventing direct modification via user update routes.

## External Dependencies
-   **PostgreSQL**: Relational database.
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

## Replit Environment Setup (October 12, 2025)

### Fresh Clone Setup - Completed ✅
The project has been successfully imported from GitHub and configured to run in the Replit environment:

1. **Dependencies Installed**: ✅
   - All Node.js packages installed via npm (507 packages)
   - TypeScript, Vite, Express, Drizzle ORM, and all UI libraries ready
   - No missing dependencies

2. **Database**: ✅ PostgreSQL database configured and seeded with test data
   - Database URL: Available via environment variable `DATABASE_URL`
   - Schema pushed successfully using Drizzle Kit
   - 17 distinct user roles (super_admin, owner, manager, etc.)
   - Test hotel with rooms, halls, restaurant tables, and menu items
   - Sample users, guests, vendors, and financial transactions
   - 20 international guests, 6 rooms, 7 halls, 13 menu items, 10 restaurant tables

3. **Development Workflow**: ✅ Configured to run `npm run dev` on port 5000
   - Frontend and backend served from single Express server
   - Vite dev server configured with HMR for Replit proxy environment
   - Vite configured with `allowedHosts: true` in server/vite.ts for Replit proxy
   - WebSocket support for real-time updates on `/ws` path
   - Server binds to 0.0.0.0:5000 for Replit compatibility
   - Workflow "Server" running and verified working

4. **Deployment**: ✅ Configured for autoscale deployment
   - Build: `npm run build` (compiles Vite frontend + esbuild backend)
   - Run: `npm start` (production server)
   - Deployment target: autoscale (stateless web app)

5. **Git Configuration**: ✅
   - .gitignore file created for Node.js project
   - Excludes node_modules, dist, .env files, migrations, and IDE configs

### Scripts Available
- `npm run dev` - Development server with hot reload
- `npm run build` - Production build
- `npm start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:seed` - Seed database with test data

### Test Credentials
- **Superadmin**: username `superadmin`, password `aef009750905865270b03eb27ceba80e`
- **Owner**: username `owner`, password `owner123`
- **Manager**: username `manager`, password `manager`
- **Waiter**: username `waiter`, password `waiter`
- **Barista**: username `barista`, password `barista`
- **Storekeeper**: username `store`, password `storekeeper`
- See seed script output for all test users

### Recent Updates

**October 12, 2025 - Production Readiness Optimization:**
- **Code Optimization**: Implemented React.lazy() code splitting for 100+ dashboard pages to reduce bundle size from 2.8MB
  - All dashboard pages now load on-demand with Suspense fallback
  - AuthPage remains eager-loaded for immediate login access
  - Significant reduction in initial bundle size for faster load times
- **Bug Fixes**: Fixed audit logging UUID issue - now correctly stores null instead of "unknown" string for unauthenticated events
- **Build Configuration**: Fixed Vite dev plugins to only load in development environment
  - Runtime error overlay, dev banner, and cartographer now excluded from production builds
  - Prevents dev-time overlays from being bundled into production
- **Security & Safety**: Enhanced .gitignore with production safety patterns
  - Added test file patterns (*.test.*, *.spec.*, __tests__, __mocks__)
  - Added certificate and key file patterns (*.pem, *.key, *.cert)
  - Added secrets directories and Replit runtime files
  - Removed migrations/ from ignore to ensure proper deployment
- **Code Quality**: Removed all client-side console statements from 8 files for cleaner production code
- **Tax Configuration**: Verified complete tax system with toggle switches and adjustable rates for VAT, Service Tax, and Luxury Tax

**October 12, 2025 - UI/UX Bug Fixes:**
- Fixed Security Head "View Vehicles" button to navigate to dedicated vehicle logs page at `/security-head/vehicles`
- Added Attendance Reports page for Owner role with full navigation integration at `/owner/attendance`
- Extended duty toggle functionality to management roles: Manager, Restaurant & Bar Manager, Housekeeping Supervisor, Finance, and Security Head can now clock in/out from their dashboards
- Fixed Manager's Attendance Report columns to display name and username separately with proper labels

**October 11, 2025 - Manager Role Enhancements:**
- Added "Leave Requests" navigation option for managers to submit leave requests to owner
- Leave requests follow the approval hierarchy: Manager → Owner

**Real-time Updates:**
- Front desk checkout now displays real-time updates for room service charges
- When services are added/removed to a guest's reservation, the payment summary updates instantly without manual refresh
- WebSocket events broadcast to front_desk, manager, and owner roles for room service charge changes

### Known Issues
- Vite HMR WebSocket may show connection warnings in browser console (fallback to localhost:undefined)
- This is cosmetic and doesn't affect application functionality
- The app's own WebSocket server on `/ws` works correctly for real-time updates
