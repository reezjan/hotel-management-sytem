# Hotel Management System

## Overview

This is a comprehensive multi-role hotel management system designed to manage all aspects of hotel operations. It supports 15 distinct user roles with tailored interfaces and permissions, covering functions from Super Admin to front-line staff. The system centralizes management of room reservations, restaurant operations, housekeeping, security, finance, and administration. Key capabilities include role-based authentication, real-time duty status tracking, thermal printer integration, a KOT (Kitchen Order Ticket) system with inventory management, comprehensive audit logging, and support for multiple payment methods (cash, POS, Fonepay) with detailed financial tracking.

## Recent Changes

### October 2, 2025 - Storekeeper Inventory Management System Overhaul
- **Complete UI Rewrite**: Completely rewrote inventory-management.tsx to use proper schema fields (packageStockQty, baseStockQty, packageUnit, baseUnit) instead of incorrect currentQty field.
- **Multi-Tab Interface**: Implemented comprehensive tabbed interface with Inventory Items, Transaction History, and Low Stock Alert tabs for better organization.
- **Package/Base Unit System**: Added dual unit tracking system supporting items with package units (e.g., 40kg flour bags) and items with only base units (e.g., individual pens).
- **Unit Conversion Logic**: Implemented automatic conversion between package and base units based on baseUnitsPerPackage with critical fix preventing corruption of items without package units.
- **Stock Issuance Tracking**: Added Issue Stock feature tracking who takes items (issuedToUserId), which department receives them, quantities in both units, and notes for complete audit trail.
- **Transaction History**: Complete audit log showing all receive/issue transactions with user names, departments, quantities, and timestamps.
- **Stock Validation**: Implemented validation to prevent over-issuance based on available baseStockQty.
- **Maintenance Requests**: Created maintenance-requests.tsx page for storekeeper to send maintenance requests to hotel manager (not restaurant manager) with photo upload support.
- **Backend Routes**: Added GET/POST /api/hotels/current/inventory-transactions routes with proper hotel scoping and validation.
- **Critical Bug Fix**: Fixed package/base unit conversion bug where items without packageUnit were having packageStockQty incorrectly updated. Now items without package units only update baseStockQty and record qtyBase in transactions, preventing data corruption.
- **Navigation Updates**: Added Maintenance Requests link to storekeeper sidebar and routing in App.tsx.

### October 2, 2025 - Fresh GitHub Import Setup & Configuration
- **Database Provisioning**: Created new PostgreSQL database and successfully pushed complete schema with all 30+ tables.
- **Database Seeding**: Ran seed script to create all 17 user roles (including storekeeper and surveillance_officer) with proper role creation permissions.
- **Superadmin Account**: Created default superadmin account with credentials (username: superadmin, password: aef009750905865270b03eb27ceba80e).
- **Manager Permissions Fix**: Added 'storekeeper' to manager's allowed roles in server/routes.ts rolePermissions (line 1282), enabling managers to create storekeeper accounts. Also added 'surveillance_officer' to security_head permissions.
- **Navigation Configuration**: Verified all storekeeper sidebar navigation links are properly configured in constants.ts and sidebar.tsx with correct routing paths.
- **Workflow Setup**: Configured "Start application" workflow with webview output type on port 5000 for proper Replit iframe proxy support.
- **Application Testing**: Verified application runs successfully - login page loads, Vite HMR connected, Express server serving on port 5000.
- **Deployment Configuration**: Set up autoscale deployment target with build and production start scripts for publishing.
- **Clean Workflow**: Removed failed "Server" workflow, keeping only the working "Start application" workflow.

### October 1, 2025 - Complete Replit Environment Setup
- **Database Initialization**: Created PostgreSQL database and pushed complete schema with all 30+ tables for hotel management system.
- **Seed Data Configuration**: Successfully seeded database with all 16 user roles and default superadmin account (username: superadmin, password: aef009750905865270b03eb27ceba80e).
- **Application Deployment**: Configured workflow to run on port 5000 with webview output, application running successfully.
- **Vehicle Check-In System**: Confirmed vehicle log creation properly saves hotelId and recordedBy fields after validating request body.
- **Deployment Configuration**: Set up autoscale deployment with build and start scripts for production environment.
- **Staff Discipline & Attendance**: Complete attendance tracking system with duty status toggles, task assignment, leave request management, and audit logging for all staff members across all 15 roles.
- **Vehicle Logs Bug Fix**: Fixed critical route ordering issue where `/api/hotels/current/vehicle-logs` was being matched by `/api/hotels/:hotelId/vehicle-logs`, treating "current" as a parameter. Moved specific route before parameterized route to ensure correct matching. Vehicle logs now load successfully with 200 status.
- **Database Query Optimization**: Implemented database-level ordering using `.orderBy(desc(vehicleLogs.checkIn))` instead of JavaScript sorting for better performance.
- **Production Ready**: Application fully configured and tested in Replit environment with all features operational.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Framework**: React 18 with TypeScript.
- **UI Components**: Shadcn/ui built on Radix UI primitives for accessibility.
- **Styling**: Tailwind CSS with custom design tokens for theming.
- **Routing**: Wouter for lightweight client-side routing with role-based protected routes.
- **Design Philosophy**: Professional, modern, and intuitive interfaces with a focus on role-specific workflows.

### Technical Implementations
- **Backend**: Node.js with Express.js for REST API endpoints.
- **Language**: TypeScript with ES modules for both frontend and backend.
- **State Management**: React Query (TanStack Query) for server state management.
- **Authentication**: Passport.js with local strategy and session-based authentication using Express sessions and a PostgreSQL session store. Password hashing via Node.js crypto module (scrypt).
- **Database**: PostgreSQL (Neon serverless hosting) with Drizzle ORM for type-safe operations and migrations.
- **Real-time Features**: Duty status toggles, live task assignment, and attendance tracking.
- **Form Management**: React Hook Form with Zod for validation.
- **Date Handling**: `date-fns` for date and time manipulations.
- **Printing**: Browser-based HTML print format for thermal printer compatibility (supporting ESC/POS commands).

### Feature Specifications
- **Multi-Role System**: 15 distinct, hierarchical user roles with granular permission control and role creation.
- **Inventory Management**: Automatic stock deduction based on recipes and order processing.
- **Financial Tracking**: Comprehensive transaction recording, cascading tax calculation, voucher system, and multi-payment method support.
- **Audit Logging**: Soft-delete functionality and detailed audit trails.
- **Maintenance & Tasks**: Integrated task and maintenance request management with photo upload capabilities.
- **Billing System**: Dynamic billing with order quantity editing, voucher discounts, and multi-payment options.

### System Design Choices
- **Scalability**: Serverless PostgreSQL hosting.
- **Security**: Secure session management (HTTP-only cookies, CSRF protection), role-based access control, and custom password reset.
- **Data Integrity**: Foreign key constraints and role-based data isolation.
- **Development**: Vite for fast development and optimized builds.
- **Route Organization**: Critical requirement - specific routes (e.g., `/api/hotels/current/*`) must be defined BEFORE parameterized routes (e.g., `/api/hotels/:hotelId/*`) to prevent Express from treating literal strings as URL parameters.

## External Dependencies

### Database & Infrastructure
- **@neondatabase/serverless**: Serverless PostgreSQL hosting.
- **drizzle-orm**: Type-safe ORM for PostgreSQL.
- **connect-pg-simple**: PostgreSQL session store for Express.

### Authentication & Security
- **passport**: Authentication middleware.
- **express-session**: Session management middleware.

### UI & Styling
- **@radix-ui/react-***: Accessible UI primitives.
- **tailwindcss**: Utility-first CSS framework.
- **lucide-react**: Icon library.

### Development & Build Tools
- **vite**: Fast build tool.
- **typescript**: Static type checking.

### Form Management & Validation
- **react-hook-form**: Performant form handling.
- **zod**: Runtime type validation.

### Date & Time Handling
- **date-fns**: Date utility library.

### External Service Integrations
- **Thermal Printer Support**: Browser-based printing APIs for ESC/POS command compatibility.
- **Payment Processing**: Integration for cash, POS, and Fonepay payment methods.