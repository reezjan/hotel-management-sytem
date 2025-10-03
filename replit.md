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
- 2025-10-03: GitHub Project Import - Replit Setup Completed
  - Created PostgreSQL database and configured environment variables
  - Installed all npm dependencies
  - Pushed database schema using Drizzle Kit
  - Seeded database with 17 roles and superadmin user (username: `superadmin`, password visible in seed output)
  - Configured "Start application" workflow on port 5000 with webview output
  - Removed duplicate "Server" workflow
  - Configured deployment for autoscale with build and start commands
  - Verified application is running successfully with login page accessible
  - Application properly configured with host `0.0.0.0` and `allowedHosts: true` for Replit proxy compatibility

## Development Notes
- The application uses a unified server on port 5000 for both frontend and backend
- Vite dev server is integrated with Express in development mode
- Hot module replacement (HMR) is enabled for frontend development
- All API routes are prefixed with `/api`
- The application uses PostgreSQL with Drizzle ORM for type-safe database operations
- Timezone is set to Asia/Kathmandu for the application
