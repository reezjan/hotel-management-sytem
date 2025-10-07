# Hotel Management System

## Overview
This project is a comprehensive hotel management system designed to streamline hotel operations. It features role-based dashboards for various staff members, including super admin, owner, manager, front desk, housekeeping, restaurant/bar management, security, and finance. The system aims to provide an efficient and integrated platform for managing all aspects of a hotel's daily operations, from guest services to inventory and financial reporting.

## Recent Changes (October 7, 2025)

### Restaurant Billing System - Comprehensive Cashier Functionality
Implemented a complete restaurant billing system with advanced features for cashier operations:

**Database Schema:**
- Added `restaurantBills` table to store all bill information (bill number, tables, orders, amounts, taxes, discounts, tips, split details)
- Added `billPayments` table to track multiple payments per bill with transaction references
- Proper relationships with cascade delete on bill payments
- Support for bill amendments with audit trail (amendedBy, amendedAt, amendmentNote)

**Backend Implementation:**
- Bill API routes: GET and POST `/api/hotels/current/bills`, PUT for amendments, GET by ID
- Atomic bill creation: Creates bill, payments, and financial transactions in one operation
- Automatic bill number generation (BILL-XXXXXXXX format)
- Updates KOT order status to 'served' when bill is finalized
- Date filtering and status filtering for bill history

**Frontend Features:**
1. **Multi-Table Selection**: Checkbox-based selection of multiple tables for combined billing
2. **Order Display**: Shows all approved/ready items from selected tables grouped by table
3. **Cascading Tax Calculation**: VAT → Service Tax → Luxury Tax applied in sequence
4. **Voucher/Discount**: Apply promotional codes with validation
5. **Tip/Gratuity**: Support for percentage or flat amount tips
6. **Split Bill Options**:
   - Equal split by number of people
   - Custom split with named amounts
7. **Multiple Payment Methods**: Add multiple partial payments (Cash, Card/POS, Fonepay) with references
8. **Payment Tracking**: Real-time calculation of total paid and remaining balance
9. **Bill Amendment**: Manager/Owner can amend bills with mandatory notes for audit trail
10. **Bill History**: Tabbed interface with date filtering and status filtering
11. **Professional Receipt Printing**: Formatted bill with all details, breakdown, and payment information

**User Flow:**
1. Cashier selects one or more tables with active orders
2. Reviews order items and calculates bill with taxes
3. Optionally applies voucher, adds tip, or sets split mode
4. Adds one or more payments until bill is fully paid
5. Processes bill → Creates bill record, payment records, and financial transactions
6. Can preview/print bill at any time
7. Manager can amend bills later with notes for corrections

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