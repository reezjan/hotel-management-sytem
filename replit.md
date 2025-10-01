# Hotel Management System

## Overview

This is a comprehensive multi-role hotel management system designed to manage all aspects of hotel operations. It supports 15 distinct user roles with tailored interfaces and permissions, covering functions from Super Admin to front-line staff. The system centralizes management of room reservations, restaurant operations, housekeeping, security, finance, and administration. Key capabilities include role-based authentication, real-time duty status tracking, thermal printer integration, a KOT (Kitchen Order Ticket) system with inventory management, comprehensive audit logging, and support for multiple payment methods (cash, POS, Fonepay) with detailed financial tracking.

## Recent Changes

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