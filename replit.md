# Hotel Management System

## Overview
This comprehensive multi-role hotel management system streamlines all aspects of hotel operations, supporting 15 distinct user roles from Super Admin to front-line staff. It centralizes management of room reservations, restaurant operations, housekeeping, security, finance, and administration. Key capabilities include role-based authentication, real-time duty status tracking, thermal printer integration, a KOT (Kitchen Order Ticket) system with inventory management, comprehensive audit logging, and support for multiple payment methods (cash, POS, Fonepay) with detailed financial tracking. The system also features a complete meal plan system (EP, BB, AP, MAP) with configurable pricing, and an overhauled storekeeper inventory management system with dual unit tracking, transaction history, and maintenance requests. The project aims to provide a robust, scalable, and intuitive solution for modern hotel management, enhancing operational efficiency and guest satisfaction.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes
- **October 3, 2025**: Added `zip` field to hotels table for thermal billing support. Fixed finance dashboard to fetch vendors from correct API route (`/api/hotels/current/vendors`). Fixed front desk to fetch hotel details from `/api/hotels/current` for proper thermal bill generation with all required information (hotel name, address, zip, phone, VAT no, and taxes).

## System Architecture

### UI/UX Decisions
- **Framework**: React 18 with TypeScript.
- **UI Components**: Shadcn/ui built on Radix UI primitives for accessibility.
- **Styling**: Tailwind CSS with custom design tokens.
- **Routing**: Wouter for lightweight client-side routing with role-based protected routes.
- **Design Philosophy**: Professional, modern, and intuitive interfaces focused on role-specific workflows.

### Technical Implementations
- **Backend**: Node.js with Express.js for REST API endpoints.
- **Language**: TypeScript for both frontend and backend.
- **State Management**: React Query (TanStack Query) for server state management.
- **Authentication**: Passport.js with local strategy, session-based authentication using Express sessions and a PostgreSQL session store. Password hashing via Node.js crypto module (scrypt).
- **Database**: PostgreSQL (Neon serverless hosting) with Drizzle ORM.
- **Real-time Features**: Duty status toggles, live task assignment, and attendance tracking.
- **Form Management**: React Hook Form with Zod for validation.
- **Date Handling**: `date-fns` for date and time manipulations.
- **Printing**: Browser-based HTML print formatting for thermal printer compatibility (ESC/POS).

### Feature Specifications
- **Multi-Role System**: 15 distinct, hierarchical user roles with granular permission control.
- **Meal Plan System**: Supports EP, BB, AP, MAP with configurable pricing and integration into guest check-in.
- **Inventory Management**: Automatic stock deduction, dual unit tracking, transaction history, low stock alerts, and maintenance requests.
- **Financial Tracking**: Comprehensive transaction recording, cascading tax calculation, voucher system, and multi-payment method support.
- **Audit Logging**: Soft-delete functionality and detailed audit trails.
- **Maintenance & Tasks**: Integrated task and maintenance request management with photo upload.
- **Billing System**: Dynamic billing with order quantity editing, voucher discounts, and multi-payment options, including accurate multi-day room and meal plan calculations and cascading tax integration.
- **Staff Management**: Attendance tracking, duty status toggles, task assignment, and leave request management.
- **Vehicle Management**: Vehicle check-in/check-out logging.

### System Design Choices
- **Scalability**: Serverless PostgreSQL hosting.
- **Security**: Secure session management (HTTP-only cookies, CSRF protection), role-based access control, and custom password reset.
- **Data Integrity**: Foreign key constraints and role-based data isolation.
- **Development**: Vite for fast development and optimized builds.
- **Route Organization**: Specific routes (e.g., `/api/hotels/current/*`) must be defined BEFORE parameterized routes (e.g., `/api/hotels/:hotelId/*`) to prevent conflicts.

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