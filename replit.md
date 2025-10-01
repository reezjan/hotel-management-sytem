# Hotel Management System

## Overview

This is a comprehensive multi-role hotel management system built with a modern full-stack architecture. The application supports 15 distinct user roles with unique interfaces and permissions, from Super Admin to front-line staff. It provides complete hotel operations management including room reservations, restaurant operations, housekeeping, security, finance, and administrative functions.

The system features role-based authentication, real-time duty status tracking, thermal printer integration, KOT (Kitchen Order Ticket) system with inventory management, and comprehensive audit logging with soft-delete functionality. It supports multiple payment methods (cash, POS, Fonepay) and provides detailed financial tracking across all hotel operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing with role-based protected routes
- **State Management**: React Query (TanStack Query) for server state management and caching
- **UI Components**: Shadcn/ui component library built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for REST API endpoints
- **Language**: TypeScript with ES modules for type safety and modern JavaScript features
- **Authentication**: Passport.js with local strategy and session-based authentication
- **Session Management**: Express sessions with PostgreSQL session store for persistence
- **Password Security**: Node.js crypto module with scrypt for secure password hashing

### Database Architecture
- **Database**: PostgreSQL with Neon serverless hosting for scalability
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema Design**: Comprehensive schema supporting 15 user roles, hotels, rooms, restaurants, inventory, financial transactions, and audit logging
- **Data Integrity**: Foreign key constraints, soft-delete functionality, and role-based data isolation

### Authentication & Authorization
- **Multi-Role System**: 15 distinct user roles with hierarchical permissions and role creation capabilities
- **Session Security**: Secure session management with HTTP-only cookies and CSRF protection
- **Role-Based Access**: Protected routes and API endpoints based on user roles and permissions
- **Password Management**: Custom password reset system with security questions

### Real-Time Features
- **Duty Status**: Real-time online/offline status toggles for all staff members
- **Task Management**: Live task assignment and status updates for operational staff
- **Attendance Tracking**: Real-time duty status monitoring and attendance logging

## External Dependencies

### Database & Infrastructure
- **@neondatabase/serverless**: Serverless PostgreSQL hosting with connection pooling
- **drizzle-orm**: Type-safe ORM for PostgreSQL with migration support
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Authentication & Security
- **passport**: Authentication middleware with local strategy support
- **bcryptjs**: Password hashing library for secure credential storage
- **express-session**: Session management middleware with security features

### UI & Styling
- **@radix-ui/react-***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework with custom design system
- **class-variance-authority**: Type-safe variant handling for component styling
- **lucide-react**: Icon library with consistent design language

### Development & Build Tools
- **vite**: Fast build tool with HMR and optimized production builds
- **typescript**: Static type checking for enhanced developer experience
- **@replit/vite-plugins**: Replit-specific development tools and error handling

### Form Management & Validation
- **react-hook-form**: Performant form handling with minimal re-renders
- **@hookform/resolvers**: Integration between React Hook Form and Zod validation
- **zod**: Runtime type validation and schema parsing

### Date & Time Handling
- **date-fns**: Modern date utility library for consistent date formatting and manipulation

### External Service Integrations
- **Thermal Printer Support**: Browser-based printing APIs with ESC/POS command support for 200+ printer models
- **Payment Processing**: Integration ready for cash, POS, and Fonepay payment methods
- **Inventory Management**: Automatic stock deduction based on recipe ingredients and order processing

## Recent Changes

### October 1, 2025 - Billing System Enhancement and Navigation Fixes
- **Sidebar Navigation**: Added complete navigation path mappings for kitchen_staff, bartender, barista, and cashier roles with subpages (duty status, tasks, KOT orders, maintenance, billing)
- **Cashier Navigation Items**: Added sidebar menu items for cashier role (Dashboard, Duty Status, My Tasks, Table Billing, Maintenance Reports)
- **Waiter Billing Rewrite**: Complete rewrite with proper order fetching from KOT orders, menu item price lookup, approval status filtering (only approved/ready orders), cascading tax calculation, thermal printer format, and payment processing with transaction recording
- **Cashier Table Billing**: New dedicated billing page with order quantity editing, voucher discount support, cascading tax calculation, thermal printer format, and multi-payment method support (Cash/POS/Fonepay)
- **Tax Calculation Fix**: Corrected tax sorting logic to use canonical database values ('vat', 'service_tax', 'luxury_tax') instead of display names for reliable cascading tax application
- **Order Status Flow**: Implemented proper order lifecycle - bills only show approved/ready items, and orders are marked as 'served' after successful payment
- **Thermal Printer Format**: Browser-based HTML print format with monospace font and proper styling for compatibility with thermal printers (works with any printer with installed drivers)
- **Known Limitations**: 
  - Client-side tax calculation requires server-side validation (backend task)
  - Thermal printer format uses HTML/CSS approach (browser-standard) rather than raw ESC/POS commands
  - Voucher redemption is client-initiated and should be validated server-side

### October 1, 2025 - Fresh GitHub Import and Replit Setup
- **GitHub Clone**: Successfully cloned hotel management system from GitHub repository
- **Dependencies Installation**: Installed all npm packages (499 packages) successfully in 31 seconds
- **Database Configuration**: Verified DATABASE_URL and SESSION_SECRET environment variables already configured
- **Schema Migration**: Pushed complete database schema with all tables using drizzle-kit
- **Database Seeding**: Created all 15 roles, role creation permissions, and superadmin user (username: superadmin, password: aef009750905865270b03eb27ceba80e)
- **Workflow Configuration**: Configured development server workflow on port 5000 with webview output
- **Server Verification**: Verified server running successfully with login page displaying correctly
- **Deployment Configuration**: Configured autoscale deployment with npm build and start scripts
- **Vite Configuration**: Confirmed host 0.0.0.0:5000 and allowedHosts: true for Replit proxy compatibility
- **Application Status**: Fully operational and ready for development

### September 30, 2025 - Cashier Maintenance & Cash Deposit Fixes
- **Maintenance Photo Upload**: Fixed cashier maintenance request photo field to use identical file upload implementation as waiter - now uses file input with FileReader for base64 conversion and image preview instead of URL text input
- **Cash Deposit Amount Precision**: Improved cash deposit amount formatting to use `.toFixed(2)` for proper numeric precision matching database schema numeric(14, 2) constraint - ensures reliable data storage

### September 30, 2025 - Cashier Bug Fixes and Enhancements
- **Maintenance Request Form Enhancement**: Updated cashier maintenance request form to match waiter implementation with all required fields (title, location, description, priority, photo) for consistency across roles
- **Cash Deposit Validation**: Improved cash deposit transaction validation with better amount parsing and error handling - added checks for NaN values and negative amounts
- **Voucher Validation Improvements**: Enhanced voucher validation with better error messages, trimmed input handling, and clearer user feedback indicating that vouchers must be created by Manager first
- **Error Message Clarity**: Added detailed error messages throughout cashier dashboard to help users understand validation failures and system requirements

### September 30, 2025 - Cashier Role Critical Fixes
- **Transaction Type Mismatch**: Fixed Zod validation error where numeric amounts were sent as numbers instead of strings - now properly converting with .toString() and .toFixed(2)
- **Security Enhancement**: Added hotel scoping and authentication enforcement to /api/transactions endpoint - now prevents cross-hotel data manipulation by setting hotelId and createdBy server-side from authenticated user
- **Hotel Phone Field**: Added phone field to hotels table schema for bill printing support (access to hotel contact information on receipts)
- **Maintenance Request Endpoint**: Corrected cashier maintenance requests to use /api/hotels/current/maintenance-requests (same as waiter) with server-side field injection
- **Cash Deposit Functionality**: Fixed transaction creation for cash deposit requests - properly formatted amounts now successfully stored in database
- **Bill Printing**: Thermal printer receipts now display hotel name, address, phone, VAT details from database instead of placeholder data

### September 30, 2025 - Cashier Dashboard Enhancement
- **Dynamic Billing System**: Complete rewrite of cashier interface with professional billing capabilities
- **Tax Calculations**: Implemented proper accounting practice - exclude taxes first, apply discounts to base amount, then recompute taxes with proper rounding
- **Voucher System**: Added voucher code validation with atomic server-side redemption to prevent race conditions and concurrent usage issues
- **Amenities Billing**: Walk-in customer support for amenities (halls, pools, services) with dual pricing (in-house vs walk-in rates)
- **Cash Deposit Requests**: Finance department integration for cash deposit requests with amount tracking
- **Task Management**: Enhanced task interface with priority-based color coding (high=red, medium=yellow, low=green) and status tracking
- **Maintenance Requests**: Integrated maintenance request functionality directly in cashier dashboard
- **Thermal Printer**: Browser-compatible print format supporting standard bill layout for all thermal printer models
- **Payment Methods**: Multiple payment method support (Cash, POS, Fonepay) with proper transaction recording
- **API Alignment**: Fixed all endpoints to use consistent `/api/hotels/current/*` pattern for better data isolation

### September 30, 2025 - Fresh GitHub Import and Replit Setup
- **GitHub Import**: Successfully cloned and configured hotel management system from GitHub repository
- **Dependencies Installation**: Installed all npm packages (499 packages) successfully
- **Database Setup**: PostgreSQL database already provisioned with DATABASE_URL configured
- **Schema Migration**: Pushed complete database schema with all 30+ tables using drizzle-kit
- **Database Seeding**: Created all 15 roles, role creation permissions, and superadmin user
- **Workflow Configuration**: Configured development server workflow on port 5000 with webview output
- **Server Verification**: Verified server running successfully on port 5000 (both frontend and backend)
- **Authentication Testing**: Tested and confirmed superadmin login works correctly via API
- **Deployment Configuration**: Configured autoscale deployment with build command and production start script
- **Vite Configuration**: Already configured with host 0.0.0.0:5000 and allowedHosts: true for Replit proxy compatibility
- **Environment Variables**: DATABASE_URL and SESSION_SECRET already configured
- **Timezone**: Server configured to use Asia/Kathmandu timezone

### Default Superadmin Credentials
- **Username**: `superadmin`
- **Password**: `aef009750905865270b03eb27ceba80e`

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (configured)
- `SESSION_SECRET`: Session encryption key (configured)

## Development Workflow

### Running the Application
```bash
npm run dev
```
The application runs on port 5000 and serves both the frontend and backend API.

### Database Management
```bash
# Push schema changes to database
npm run db:push

# Seed initial data (roles, permissions, superadmin)
npm run db:seed
```

### Building for Production
```bash
npm run build
npm start
```

## Pending Improvements

### Future Enhancements (Low Priority)
- **Enhanced Order Management**: 
  - Real-time KOT updates with WebSocket integration
  - Edit and delete order capabilities
  - Print order tickets directly from waiter interface
- **Advanced Analytics**: 
  - Role-based performance dashboards
  - Revenue tracking and forecasting
  - Inventory usage analytics
- **Integration Features**:
  - SMS notifications for task assignments
  - Email reporting for daily summaries
  - Third-party payment gateway integration (beyond Fonepay)