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
-   **Dual Reporting System**: Separate financial reporting and hotel transparency dashboards with dedicated pages for financial analytics and complete operational transparency (Oct 2025).

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

#### 5. Maintenance Request Reassignment Security (October 2025)
- **Supervisor Approval Required**: Only managers, owners, security heads, and housekeeping supervisors can reassign maintenance requests
- **Assignment Verification**: Users can only update requests assigned to them (unless they're supervisors)
- **Audit Logging**: All reassignments are logged in the audit trail with previous/new assignee information
- **Protected Endpoints**:
  - `PUT /api/maintenance-requests/:id` - Maintenance request updates
  - `PUT /api/hotels/current/maintenance-requests/:id` - Hotel-scoped maintenance updates
- **Authorization Pattern**: `['manager', 'owner', 'security_head', 'housekeeping_supervisor'].includes(role)`
- **Audit Payload**: Tracks `previousAssignee`, `newAssignee`, `timestamp`, and `changedBy` for complete traceability

#### 6. Type Coercion Attack Prevention (October 2025) 
- **Vulnerability**: Server crashed when non-string types (numbers, objects, arrays) were sent as login credentials
- **Attack Vector**: `POST /api/login` with `{username: 123, password: 456}` or `{username: {}, password: []}`
- **Fix Location**: `server/auth.ts` - Enhanced `sanitizeInput()` function
- **Solution**: Added type checking to reject non-string inputs before processing, preventing `TypeError: input.replace is not a function`
- **Testing**: Comprehensive attack suite validates SQL injection, XSS, type coercion, and edge case protection

#### 7. Room Status Manipulation Prevention with Audit Logging (October 2025)
- **Authorization Control**: Only managers, owners, and housekeeping supervisors can change room status
- **Maintenance Reason Enforcement**: Changing status to 'maintenance' requires a mandatory reason
- **Audit Trail**: All room status changes are logged in `room_status_logs` table with:
  - Previous and new status
  - Timestamp of change
  - User who made the change
  - Reason for change (if provided)
- **Hotel Ownership Verification**: Users can only modify rooms in their own hotel
- **Accurate Logging**: Status changes are logged only AFTER successful database update to prevent false audit entries
- **Protected Endpoint**: `PUT /api/rooms/:id` - Room status updates with role-based access control
- **Database Schema**: `roomStatusLogs` table with foreign keys to rooms and users for complete traceability

#### 8. Password Change Authorization Vulnerability (October 2025)
- **Vulnerability**: Managers could change other users' passwords by sending `passwordHash` field in PUT requests
- **Attack Vector**: 
  - `PUT /api/users/:id` with `{passwordHash: "..."}` in request body
  - `PUT /api/hotels/current/users/:id` with `{passwordHash: "..."}` in request body
- **Risk**: Managers could bypass authentication by changing passwords of other users, including owner accounts
- **Fix Location**: `server/routes.ts` (lines 1265-1271 and 2316-2322)
- **Solution**: Added explicit `passwordHash` field blocking on both user update endpoints
- **Security Model**: Passwords can ONLY be changed via `/api/reset-password` endpoint which requires:
  - User authentication (req.user)
  - Current password verification
  - User can only change their own password
- **Error Response**: Returns 403 with message "Cannot change passwords through this endpoint. Use the password reset functionality."
- **Protected Endpoints**:
  - `PUT /api/users/:id` - User updates (general endpoint)
  - `PUT /api/hotels/current/users/:id` - Hotel-scoped user updates
- **Testing**: Verified managers and owners cannot inject passwordHash into user update requests

## Recent Updates

### Reporting System Restructure (October 2025)
The reporting system has been restructured to separate financial reporting from complete hotel transparency views:

**Changes Made:**
1. **Navigation Update**: Renamed "Reports" to "Financial Report" and added new "Report" menu item in owner navigation
2. **New Transparency Report Page** (`/owner/report`):
   - Complete hotel transparency with 6 comprehensive tabs:
     - **Financial Overview**: Profit & loss statement with revenue/expense breakdowns, payment methods analysis, and key metrics
     - **All Transactions**: Complete transaction history with full details (date, type, purpose, payment method, vendor, creator, amount, status)
     - **Rooms & Occupancy**: Real-time room availability, pricing, occupancy analysis, and revenue tracking
     - **Staff & HR**: Complete staff directory with roles, activity status, and on-duty information
     - **Maintenance Requests**: All maintenance history with photos and full details
     - **Vendors & Suppliers**: Complete vendor directory with payment history and contact information
   - Comprehensive CSV export functionality for complete transparency report
   - Full visibility into all hotel operations and data

3. **Financial Report Page** (`/owner/reports`):
   - Focused on financial reporting and analytics
   - Quick report generation (Financial, Occupancy, Staff reports)
   - Financial summary cards with key metrics
   - Recent activity summary with transactions and low stock alerts
   - Individual report exports for specific analysis

**Technical Implementation:**
- Created new `report.tsx` component with tabbed interface using shadcn/ui Tabs
- Simplified `reports.tsx` to focus on financial reporting only
- Updated routing in `App.tsx` to support both pages
- Maintained consistent data access patterns across both pages
- All changes reviewed and approved by architect with no security issues

**User Experience:**
- Clear separation of concerns: financial analytics vs. operational transparency
- Owners can now easily access comprehensive hotel data without mixing it with financial reports
- Both pages maintain the same date range filtering and export capabilities

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