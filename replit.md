# Hotel Management System

## Overview
A comprehensive hotel management system built with React, TypeScript, Express, and PostgreSQL. This application provides role-based dashboards for various hotel staff including super admin, owner, manager, front desk, housekeeping, restaurant/bar management, security, finance, and more.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Wouter (routing), TailwindCSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **UI Components**: Radix UI primitives, Lucide icons
- **State Management**: TanStack Query

## Project Structure
```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components and dashboards
│   │   ├── lib/         # Utility functions
│   │   └── hooks/       # Custom React hooks
├── server/              # Backend Express application
│   ├── index.ts        # Server entry point
│   ├── routes.ts       # API routes
│   ├── storage.ts      # Database access layer
│   ├── auth.ts         # Authentication setup
│   └── db.ts           # Database connection
├── shared/             # Shared types and schemas
│   └── schema.ts       # Drizzle schema definitions
└── attached_assets/    # Static assets
```

## Development Setup

### Environment Variables
The following environment variables are automatically configured:
- `DATABASE_URL` - PostgreSQL connection string
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` - Individual PostgreSQL credentials

### Running the Application
1. Install dependencies: `npm install`
2. Push database schema: `npm run db:push`
3. Seed the database: `npm run db:seed`
4. Start development server: `npm run dev`

The application will be available at http://localhost:5000

### Building for Production
1. Build: `npm run build`
2. Start: `npm run start`

## Database Management

### Schema Changes
- Modify schema in `shared/schema.ts`
- Push changes: `npm run db:push` (or `npm run db:push --force` if warned about data loss)
- Never manually write SQL migrations - use Drizzle Kit

### Seeding
Run `npm run db:seed` to populate the database with:
- All role definitions (17 roles)
- Role creation permissions
- A superadmin user for initial login

## Default Credentials
**Superadmin Account:**
- Username: `superadmin`
- Password: The password is displayed in the console output when running `npm run db:seed`

Note: For security, the password is not stored in this file. Run the seed command to see the login credentials.

## Features
- Multi-role authentication system
- Hotel setup and management
- **Guest/Customer Management** - Full CRUD operations for guest profiles with search functionality
- Room and hall management
- Restaurant and bar operations (KOT, billing, menu management)
- Inventory tracking and consumption
- Staff management and attendance
- Task assignment and tracking
- Maintenance request handling
- Financial management (transactions, payments, expenses)
- Vendor management
- Leave request system
- Vehicle logging
- Security and surveillance features

## Roles and Dashboards
- Super Admin - Full system access across hotels
- Owner - Hotel owner dashboard with financial overview
- Manager - Hotel operations management
- Front Desk - Guest check-in/out and reservations
- Housekeeping (Supervisor & Staff) - Room cleaning and maintenance
- Restaurant/Bar Manager - F&B operations
- Waiter - Order taking and billing
- Kitchen Staff - KOT management
- Bartender/Barista - Beverage service
- Security (Head & Guard) - Access control
- Surveillance Officer - Monitoring and vehicle logs
- Finance - Financial operations and reporting
- Cashier - Payment processing
- Storekeeper - Inventory management

## Recent Changes
- 2025-10-04: Fixed Task Assignment "Invalid Task Data" Error
  - Fixed issue where housekeeping supervisors and restaurant/bar managers couldn't assign tasks to staff
  - Root cause: Form was sending `dueDateTime` field which isn't in the database schema, causing validation to fail
  - Solution: Properly destructure form data to remove `dueDateTime` and map it to `dueDate` before API submission
  - Affected files: `housekeeping-supervisor/task-assignment.tsx` and `restaurant-bar-manager/task-assignment.tsx`
  - Task assignment now works correctly for both supervisors and managers

- 2025-10-04: Added Auto-Refresh for Real-Time-Like Updates
  - Added automatic polling (every 5 seconds) to housekeeping supervisor's staff tracking page
  - Added automatic polling to task assignment page for online staff status
  - Staff online/offline status now updates automatically without manual page refresh
  - Note: This is a polling solution; true real-time requires WebSocket implementation

- 2025-10-04: Improved Task Creation Error Handling
  - Enhanced error messages for task creation validation failures
  - Now shows detailed Zod validation errors instead of generic "Invalid task data"
  - Logs task creation errors to console for debugging
  - Helps identify specific field validation issues

- 2025-10-04: Fixed Role Permission Bug for Staff Creation
  - Fixed issue where housekeeping supervisors couldn't create housekeeping staff accounts
  - Root cause: Backend expected `role` (name) field but frontend sent `roleId` (number)
  - Solution: Added logic to retrieve role name from roleId when only roleId is provided
  - Added new `getRole(id: number)` method to storage interface for role lookup by ID
  - Staff creation now works correctly for all role hierarchies

- 2025-10-04: GitHub Project Import - Replit Environment Setup Completed
  - Created fresh PostgreSQL database and configured environment variables (DATABASE_URL, PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE)
  - All npm dependencies already present and verified working
  - Pushed database schema using Drizzle Kit (`npm run db:push`)
  - Seeded database with fresh data (`npm run db:seed`):
    - 17 roles created (super_admin, owner, manager, housekeeping, restaurant/bar staff, security, finance, etc.)
    - Role creation permissions configured
    - Superadmin user created (username: `superadmin`, password: `aef009750905865270b03eb27ceba80e`)
  - Configured "Start application" workflow on port 5000 with webview output
  - Removed old "Server" workflow to avoid conflicts
  - Configured deployment for autoscale (build: `npm run build`, run: `npm run start`)
  - Application verified running successfully - login page accessible at port 5000
  - Existing configuration confirmed working: host `0.0.0.0`, `allowedHosts: true` for Replit proxy

## Development Notes
- The application uses a unified server on port 5000 for both frontend and backend
- Vite dev server is integrated with Express in development mode
- Hot module replacement (HMR) is enabled for frontend development
- All API routes are prefixed with `/api`
- The application uses PostgreSQL with Drizzle ORM for type-safe database operations
- Timezone is set to Asia/Kathmandu for the application
