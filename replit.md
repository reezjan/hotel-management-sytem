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
- 2025-10-04: Fixed Owner Inventory Showing Out of Stock When Stock Exists (Latest)
  - Fixed critical bug where owner saw "Out of Stock" for items that storekeeper showed as in stock
  - Root cause: Owner dashboard was reading `stockQty` (deprecated/unused field always at 0), while storekeeper reads `baseStockQty` (actual stock)
  - The database schema uses two active stock fields:
    - `baseStockQty` - Stock in base units (kg, liters, pieces, etc.)
    - `packageStockQty` - Stock in package units (sacks, boxes, etc.)
    - `stockQty` - Legacy field that's no longer used
  - Changed all owner inventory displays to use `baseStockQty` instead of `stockQty`
  - Updated stock display to show both base and package units: "2200.00 kg (55.00 Sack)"
  - Updated all inventory metrics (low stock, out of stock, items in stock) to use correct field
  - Affected files:
    - `client/src/pages/dashboard/owner/inventory-tracking.tsx`
    - `client/src/pages/dashboard/owner.tsx`
  - Owner now sees accurate stock levels matching what the storekeeper sees

- 2025-10-04: Fixed Owner Inventory Display - Missing Details and Incorrect Field
  - Fixed inventory value calculation using wrong field name (`price` → `costPerUnit`)
  - Root cause: Frontend was accessing non-existent `item.price` field, should be `item.costPerUnit`
  - Added missing inventory columns to owner's inventory tracking page:
    - Description - Item description for better identification
    - Cost per Unit - Shows NPR cost formatted to 2 decimal places
    - Storage Location - Shows where items are stored
  - Total inventory value now calculates correctly using costPerUnit
  - Affected file: `client/src/pages/dashboard/owner/inventory-tracking.tsx`
  - Owner can now see complete inventory details including costs and storage locations

- 2025-10-04: Fresh GitHub Import - Replit Environment Setup Completed
  - **Database Setup:**
    - Created PostgreSQL database using Replit's database tool
    - Environment variables configured automatically: DATABASE_URL, PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
    - Pushed database schema successfully using `npm run db:push`
    - Database seeded with initial data using `npm run db:seed`
  - **Initial Data Created:**
    - 17 role definitions (super_admin, owner, manager, front_desk, housekeeping_supervisor, housekeeping_staff, restaurant_bar_manager, waiter, kitchen_staff, bartender, barista, security_head, security_guard, surveillance_officer, finance, cashier, storekeeper)
    - Role creation permissions configured
    - Superadmin user created with username: `superadmin`, password: `aef009750905865270b03eb27ceba80e`
  - **Workflow Configuration:**
    - Removed old "Server" workflow to prevent conflicts
    - Configured "Start application" workflow on port 5000 with webview output type
    - Workflow command: `npm run dev` (runs Express server with integrated Vite dev server)
  - **Deployment Configuration:**
    - Deployment target: autoscale (for stateless web applications)
    - Build command: `npm run build`
    - Run command: `npm run start`
  - **Verification:**
    - Application running successfully on port 5000
    - Login page accessible and rendering correctly
    - Vite HMR connected and working
    - All existing configuration verified: host `0.0.0.0`, `allowedHosts: true` for Replit proxy support
  - **Notes:** All npm dependencies were already installed. The application was ready to run after database setup and workflow configuration.

- 2025-10-04: Fixed Inventory Endpoint Errors Across Multiple Dashboards
  - Fixed 500 errors when fetching inventory items in owner, kitchen, bar, and restaurant manager dashboards
  - Root cause: Multiple pages were calling non-existent `/api/hotels/current/inventory` endpoint
  - Solution: Updated all pages to use correct `/api/hotels/current/inventory-items` endpoint
  - Affected files:
    - `client/src/pages/dashboard/kitchen-staff.tsx`
    - `client/src/pages/dashboard/bartender.tsx`
    - `client/src/pages/dashboard/barista.tsx`
    - `client/src/pages/dashboard/restaurant-bar-manager.tsx`
    - `client/src/pages/dashboard/restaurant-bar-manager/inventory-tracking.tsx`
    - `client/src/pages/dashboard/owner/reports.tsx`
    - `client/src/pages/dashboard/owner.tsx`
    - `client/src/pages/dashboard/owner/inventory-tracking.tsx`
  - Also updated `/api/hotels/current/inventory/consumptions` to `/api/hotels/current/inventory-consumptions`
  - Inventory data now loads correctly without 500 errors across all dashboards

- 2025-10-04: Fixed Maintenance Request "Mark Resolved" Error
  - Fixed issue where housekeeping supervisors couldn't mark maintenance requests as resolved
  - Root cause: Frontend was calling `/api/hotels/current/maintenance-requests/:id` PUT endpoint which didn't exist
  - Solution: Added missing PUT route `/api/hotels/current/maintenance-requests/:id` in server/routes.ts
  - The route includes proper authentication, hotel context verification, and follows same pattern as other hotel-scoped endpoints
  - Affected file: `server/routes.ts` (added lines 865-886)
  - Mark resolved functionality now works correctly for housekeeping supervisors

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

- 2025-10-04: GitHub Project Import - Replit Environment Setup Completed (Latest)
  - **Database Setup:**
    - Created fresh PostgreSQL database using Replit's database tool
    - Environment variables configured automatically: DATABASE_URL, PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
    - Pushed database schema successfully using `npm run db:push`
    - Database seeded with initial data using `npm run db:seed`
  - **Initial Data Created:**
    - 17 role definitions (super_admin, owner, manager, front_desk, housekeeping_supervisor, housekeeping_staff, restaurant_bar_manager, waiter, kitchen_staff, bartender, barista, security_head, security_guard, surveillance_officer, finance, cashier, storekeeper)
    - Role creation permissions configured
    - Superadmin user created with username: `superadmin`, password: `aef009750905865270b03eb27ceba80e`
  - **Workflow Configuration:**
    - Removed old "Server" workflow to prevent conflicts
    - Configured "Start application" workflow on port 5000 with webview output type
    - Workflow command: `npm run dev` (runs Express server with integrated Vite dev server)
  - **Deployment Configuration:**
    - Deployment target: autoscale (for stateless web applications)
    - Build command: `npm run build`
    - Run command: `npm run start`
  - **Verification:**
    - Application running successfully on port 5000
    - Login page accessible and rendering correctly
    - Vite HMR connected and working
    - All existing configuration verified: host `0.0.0.0`, `allowedHosts: true` for Replit proxy support
  - **Notes:** All npm dependencies were already installed. The application was ready to run after database setup and workflow configuration.

## Development Notes
- The application uses a unified server on port 5000 for both frontend and backend
- Vite dev server is integrated with Express in development mode
- Hot module replacement (HMR) is enabled for frontend development
- All API routes are prefixed with `/api`
- The application uses PostgreSQL with Drizzle ORM for type-safe database operations
- Timezone is set to Asia/Kathmandu for the application
