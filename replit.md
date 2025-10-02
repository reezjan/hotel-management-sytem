# Hotel Management System

## Overview

This is a comprehensive multi-role hotel management system designed to manage all aspects of hotel operations. It supports 15 distinct user roles with tailored interfaces and permissions, covering functions from Super Admin to front-line staff. The system centralizes management of room reservations, restaurant operations, housekeeping, security, finance, and administration. Key capabilities include role-based authentication, real-time duty status tracking, thermal printer integration, a KOT (Kitchen Order Ticket) system with inventory management, comprehensive audit logging, and support for multiple payment methods (cash, POS, Fonepay) with detailed financial tracking. The system also includes a complete meal plan system (EP, BB, AP, MAP) with configurable pricing, and an overhauled storekeeper inventory management system with dual unit tracking, transaction history, and maintenance requests.

## Recent Changes (October 2025)

### Front Desk Enhancements - Complete Professional Overhaul
- **TypeScript Type Safety**: Added comprehensive type definitions for all queries using proper Room, Task, RoomServiceOrder, MealPlan, Voucher, MenuItem, and MenuCategory types from shared schema.
- **Data Isolation Fix**: Updated all react-query hooks to use dynamic hotel ID from authenticated user context instead of hardcoded values, ensuring proper multi-tenant data isolation with `enabled` guards.
- **Navigation Simplification**: Removed non-existent front desk sub-pages (duty, tasks, checkin) from sidebar to fix 404 errors and improve user experience.

### Professional Check-in System
- **Enhanced Check-in Form**: Added nationality field for guest registration with proper form validation.
- **Room Type & Price Display**: Fixed room type and pricing fetching to show accurate information during check-in/checkout.
- **Meal Plan Integration**: Fully integrated meal plan selection with per-person pricing and automatic total calculation.

### Professional Checkout System
- **Comprehensive Checkout Dialog**: Implemented professional checkout flow with:
  - Guest and room information display
  - Room type and pricing integration
  - Meal plan cost integration
  - Voucher discount system with real-time validation (date range and usage limits)
  - Automatic discount calculation (percentage or fixed amount)
  - Payment method selection (cash, POS, Fonepay)
  - Payment summary breakdown with tax calculations
  - Transaction recording and voucher usage tracking
- **Query Key Consistency**: All room, voucher, and transaction mutations properly invalidate caches using structured query keys for reliable data refresh.

### New Front Desk Features
- **Maintenance Request System**: Front desk can now send maintenance requests directly to the manager with priority levels (low, medium, high, urgent), location tracking, and detailed descriptions.
- **Food Ordering System**: Advanced food ordering with:
  - Search functionality by food name
  - Category-based filtering with all menu categories
  - Real-time menu item display with prices
  - Quantity management with increment/decrement controls
  - Order total calculation
  - Direct integration with room billing
  - Items automatically added to room service orders
- **Cash Deposit Requests**: Front desk can send cash deposit requests to finance department with:
  - Amount specification
  - Payment method selection (cash, POS, Fonepay)
  - Purpose/reason documentation
  - Automatic transaction creation

### Thermal Printer Integration
- **Professional Receipt Format**: Implemented thermal printer-compatible HTML receipts optimized for 80mm paper width with:
  - Check-in receipts with guest details, room info, nationality, meal plan breakdown
  - Check-out receipts with stay summary, room charges, meal plan costs
  - Bill receipts with itemized charges
  - ESC/POS compatible formatting for all thermal printer models
  - Proper page sizing (@page margin: 0, size: 80mm auto)
  - Monospace font for consistent alignment
  - Professional layout with hotel branding

### Superadmin Setup
- **Default Credentials**: Configured superadmin user with:
  - Username: `superadmin`
  - Password: `aef009750905865270b03eb27ceba80e`
  - Full system access for hotel management

### Database & Infrastructure
- **PostgreSQL Database**: Provisioned and configured Neon-backed PostgreSQL database with all required tables.
- **Schema Migration**: Successfully pushed all schema changes including rooms, vouchers, meal plans, menu items, maintenance requests, and transactions.
- **Seed Data**: Loaded all 17 roles and created superadmin user with proper permissions.

### Replit Environment Setup (October 2025)
- **Deployment Configuration**: Set up for autoscale deployment with production build and start scripts.
- **Development Workflow**: Configured `Server` workflow running `npm run dev` on port 5000 with webview output.
- **Host Configuration**: Vite configured with `allowedHosts: true` and `host: 0.0.0.0` to work with Replit's proxy environment.
- **Database Integration**: PostgreSQL database provisioned with environment variables (DATABASE_URL, PGPORT, etc.) automatically configured.
- **Port Configuration**: Both frontend (Vite) and backend (Express) run on port 5000 as required by Replit.
- **Initial Setup Complete**: Dependencies installed, database schema pushed, seed data loaded, application running successfully.

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
- **Meal Plan System**: Supports EP, BB, AP, MAP with configurable pricing and integration into guest check-in.
- **Inventory Management**: Automatic stock deduction based on recipes and order processing, dual unit tracking (package/base), transaction history, low stock alerts, and maintenance requests.
- **Financial Tracking**: Comprehensive transaction recording, cascading tax calculation, voucher system, and multi-payment method support.
- **Audit Logging**: Soft-delete functionality and detailed audit trails.
- **Maintenance & Tasks**: Integrated task and maintenance request management with photo upload capabilities.
- **Billing System**: Dynamic billing with order quantity editing, voucher discounts, and multi-payment options.
- **Staff Management**: Complete attendance tracking, duty status toggles, task assignment, and leave request management.
- **Vehicle Management**: Vehicle check-in/check-out logging with detailed tracking.

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