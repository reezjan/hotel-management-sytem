import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  uuid, 
  timestamp, 
  boolean, 
  integer, 
  serial, 
  numeric, 
  jsonb,
  inet,
  index,
  unique
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Hotels Table
export const hotels = pgTable("hotels", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  zip: text("zip"),
  vatNo: text("vat_no"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  settings: jsonb("settings").default('{}')
});

// Roles Table
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").unique().notNull(),
  description: text("description")
});

// Role Creation Permissions Table
export const roleCreationPermissions = pgTable("role_creation_permissions", {
  id: serial("id").primaryKey(),
  creatorRole: text("creator_role").notNull(),
  createeRole: text("createe_role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Users Table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id, { onDelete: "cascade" }),
  roleId: integer("role_id").references(() => roles.id),
  username: text("username").notNull(),
  fullName: text("full_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  passwordHash: text("password_hash").notNull(),
  isActive: boolean("is_active").default(true),
  isOnline: boolean("is_online").default(false),
  lastLogin: timestamp("last_login", { withTimezone: true }),
  lastLogout: timestamp("last_logout", { withTimezone: true }),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  verification: jsonb("verification").default('{}')
});

// User Sessions Table
export const userSessions = pgTable("user_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  jwtToken: text("jwt_token"),
  deviceInfo: text("device_info"),
  ip: text("ip"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  lastSeen: timestamp("last_seen", { withTimezone: true }).defaultNow(),
  revokedAt: timestamp("revoked_at", { withTimezone: true })
});

// Audit Logs Table
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  userId: uuid("user_id").references(() => users.id),
  action: text("action").notNull(), // login, logout, create, update, delete, void, approve, etc.
  resourceType: text("resource_type").notNull(), // user, transaction, bill, inventory, etc.
  resourceId: text("resource_id"),
  details: jsonb("details"), // Store any additional context
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  success: boolean("success").default(true),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Guests Table
export const guests = pgTable("guests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  address: text("address"),
  city: text("city"),
  country: text("country"),
  idType: text("id_type"),
  idNumber: text("id_number"),
  nationality: text("nationality"),
  dateOfBirth: timestamp("date_of_birth", { withTimezone: true }),
  notes: text("notes"),
  currentReservationId: uuid("current_reservation_id"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true })
});

// Room Types Table
export const roomTypes = pgTable("room_types", {
  id: serial("id").primaryKey(),
  hotelId: uuid("hotel_id").references(() => hotels.id, { onDelete: "cascade" }),
  name: text("name"),
  description: text("description"),
  priceInhouse: numeric("price_inhouse", { precision: 12, scale: 2 }),
  priceWalkin: numeric("price_walkin", { precision: 12, scale: 2 })
});

// Rooms Table
export const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id, { onDelete: "cascade" }),
  roomNumber: text("room_number"),
  roomTypeId: integer("room_type_id").references(() => roomTypes.id),
  status: text("status").default('available'),
  currentReservationId: uuid("current_reservation_id"),
  isOccupied: boolean("is_occupied").default(false),
  occupantDetails: jsonb("occupant_details"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true })
});

// Room Status Logs Table
export const roomStatusLogs = pgTable("room_status_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: uuid("room_id").references(() => rooms.id),
  roomNumber: text("room_number"),
  previousStatus: text("previous_status"),
  newStatus: text("new_status"),
  reason: text("reason"),
  changedBy: uuid("changed_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Halls Table
export const halls = pgTable("halls", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  name: text("name"),
  capacity: integer("capacity"),
  priceInhouse: numeric("price_inhouse", { precision: 12, scale: 2 }),
  priceWalkin: numeric("price_walkin", { precision: 12, scale: 2 }),
  hourlyRate: numeric("hourly_rate", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Pools Table
export const pools = pgTable("pools", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  name: text("name"),
  priceInhouse: numeric("price_inhouse", { precision: 12, scale: 2 }),
  priceWalkin: numeric("price_walkin", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Services Table
export const services = pgTable("services", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  kind: text("kind"),
  name: text("name"),
  priceInhouse: numeric("price_inhouse", { precision: 12, scale: 2 }),
  priceWalkin: numeric("price_walkin", { precision: 12, scale: 2 })
});

// Inventory Items Table
export const inventoryItems = pgTable("inventory_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  sku: text("sku"),
  name: text("name").notNull(),
  description: text("description"),
  unit: text("unit"),
  stockQty: numeric("stock_qty", { precision: 12, scale: 3 }).default('0'),
  packageUnit: text("package_unit"),
  baseUnit: text("base_unit"),
  baseUnitsPerPackage: numeric("base_units_per_package", { precision: 12, scale: 3 }),
  packageStockQty: numeric("package_stock_qty", { precision: 12, scale: 3 }).default('0'),
  baseStockQty: numeric("base_stock_qty", { precision: 12, scale: 3 }).default('0'),
  reorderLevel: numeric("reorder_level", { precision: 12, scale: 3 }).default('0'),
  storageLocation: text("storage_location"),
  costPerUnit: numeric("cost_per_unit", { precision: 12, scale: 2 }).default('0'),
  departments: text("departments").array().default(sql`ARRAY[]::text[]`),
  measurementCategory: text("measurement_category").default('weight'),
  conversionProfile: jsonb("conversion_profile").default('{}'),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true })
});

// Inventory Consumptions Table
export const inventoryConsumptions = pgTable("inventory_consumptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  itemId: uuid("item_id").references(() => inventoryItems.id),
  qty: numeric("qty", { precision: 12, scale: 3 }).notNull(),
  unit: text("unit"),
  reason: text("reason"),
  referenceEntity: text("reference_entity"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Wastages Table
export const wastages = pgTable("wastages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  itemId: uuid("item_id").references(() => inventoryItems.id),
  qty: numeric("qty", { precision: 12, scale: 3 }).notNull(),
  unit: text("unit"),
  reason: text("reason").notNull(),
  recordedBy: uuid("recorded_by").references(() => users.id),
  status: text("status").default('pending_approval'),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  estimatedValue: numeric("estimated_value", { precision: 12, scale: 2 }),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Inventory Transactions Table
export const inventoryTransactions = pgTable("inventory_transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  itemId: uuid("item_id").references(() => inventoryItems.id),
  transactionType: text("transaction_type").notNull(),
  qtyPackage: numeric("qty_package", { precision: 12, scale: 3 }),
  qtyBase: numeric("qty_base", { precision: 12, scale: 3 }),
  issuedToUserId: uuid("issued_to_user_id").references(() => users.id),
  department: text("department"),
  notes: text("notes"),
  recordedBy: uuid("recorded_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Vendors Table
export const vendors = pgTable("vendors", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  name: text("name"),
  contact: jsonb("contact"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Transactions Table
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  txnType: text("txn_type").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  currency: text("currency").default('NPR'),
  paymentMethod: text("payment_method"),
  vendorId: uuid("vendor_id").references(() => vendors.id),
  purpose: text("purpose"),
  reference: text("reference"),
  details: jsonb("details"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  isVoided: boolean("is_voided").default(false),
  voidedBy: uuid("voided_by").references(() => users.id),
  voidedAt: timestamp("voided_at", { withTimezone: true }),
  voidReason: text("void_reason")
});

// Maintenance Requests Table
export const maintenanceRequests = pgTable("maintenance_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  reportedBy: uuid("reported_by").references(() => users.id),
  title: text("title").notNull(),
  location: text("location"),
  description: text("description"),
  photo: text("photo"),
  priority: text("priority").default('medium'),
  status: text("status").default('pending'),
  assignedTo: uuid("assigned_to").references(() => users.id),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  declinedBy: uuid("declined_by").references(() => users.id),
  declinedAt: timestamp("declined_at", { withTimezone: true }),
  declineReason: text("decline_reason"),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Maintenance Request Status History Table
export const maintenanceStatusHistory = pgTable("maintenance_status_history", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: uuid("request_id").references(() => maintenanceRequests.id, { onDelete: "cascade" }),
  previousStatus: text("previous_status"),
  newStatus: text("new_status").notNull(),
  changedBy: uuid("changed_by").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Tasks Table
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  createdBy: uuid("created_by").references(() => users.id),
  assignedTo: uuid("assigned_to").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default('pending'),
  priority: text("priority").default('medium'),
  dueDate: timestamp("due_date", { withTimezone: true }),
  context: jsonb("context"),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  completionNotes: text("completion_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Room Cleaning Queue Table
export const roomCleaningQueue = pgTable("room_cleaning_queue", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  roomId: uuid("room_id").references(() => rooms.id),
  roomNumber: text("room_number").notNull(),
  guestName: text("guest_name"),
  guestId: uuid("guest_id").references(() => guests.id),
  checkoutAt: timestamp("checkout_at", { withTimezone: true }).defaultNow(),
  status: text("status").default('pending'),
  taskId: uuid("task_id").references(() => tasks.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Restaurant Tables Table
export const restaurantTables = pgTable("restaurant_tables", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  name: text("name"),
  capacity: integer("capacity"),
  location: text("location"),
  status: text("status").default('available'),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Menu Categories Table
export const menuCategories = pgTable("menu_categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  name: text("name")
});

// Menu Items Table
export const menuItems = pgTable("menu_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  categoryId: uuid("category_id").references(() => menuCategories.id),
  name: text("name"),
  price: numeric("price", { precision: 12, scale: 2 }),
  description: text("description"),
  active: boolean("active").default(true),
  recipe: jsonb("recipe"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// KOT Orders Table
export const kotOrders = pgTable("kot_orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  tableId: uuid("table_id").references(() => restaurantTables.id),
  createdBy: uuid("created_by").references(() => users.id),
  status: text("status").default('open'),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// KOT Items Table
export const kotItems = pgTable("kot_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  kotId: uuid("kot_id").references(() => kotOrders.id, { onDelete: "cascade" }),
  menuItemId: uuid("menu_item_id"),
  description: text("description"),
  qty: integer("qty").default(1),
  unit: text("unit"),
  inventoryUsage: jsonb("inventory_usage"),
  status: text("status").default('pending'),
  declineReason: text("decline_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// KOT Audit Logs Table
export const kotAuditLogs = pgTable("kot_audit_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  kotItemId: uuid("kot_item_id").references(() => kotItems.id),
  action: text("action").notNull(),
  performedBy: uuid("performed_by").references(() => users.id),
  reason: text("reason"),
  previousStatus: text("previous_status"),
  newStatus: text("new_status"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Payments Table
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  payerId: uuid("payer_id").references(() => users.id),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  method: text("method"),
  reference: text("reference"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Password Reset Table
export const passwordResets = pgTable("password_resets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id),
  token: text("token"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Attendance Table
export const attendance = pgTable("attendance", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  userId: uuid("user_id").references(() => users.id),
  clockInTime: timestamp("clock_in_time", { withTimezone: true }).notNull(),
  clockOutTime: timestamp("clock_out_time", { withTimezone: true }),
  clockInLocation: text("clock_in_location"),
  clockOutLocation: text("clock_out_location"),
  clockInIp: text("clock_in_ip"),
  clockOutIp: text("clock_out_ip"),
  totalHours: numeric("total_hours", { precision: 10, scale: 2 }),
  status: text("status").default('active').notNull(),
  clockInSource: text("clock_in_source"),
  clockOutSource: text("clock_out_source"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Leave Requests Table
export const leaveRequests = pgTable("leave_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  requestedBy: uuid("requested_by").references(() => users.id),
  approvedBy: uuid("approved_by").references(() => users.id),
  leaveType: text("leave_type").notNull(), // sick, vacation, emergency, etc.
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  reason: text("reason"),
  status: text("status").default('pending'), // pending, approved, rejected
  managerNotes: text("manager_notes"),
  approvalDate: timestamp("approval_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Leave Policies Table
export const leavePolicies = pgTable("leave_policies", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id, { onDelete: "cascade" }),
  leaveType: text("leave_type").notNull(), // sick, vacation, personal, emergency, family
  displayName: text("display_name").notNull(),
  defaultDays: integer("default_days").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
}, (table) => ({
  uniqueHotelLeaveType: unique().on(table.hotelId, table.leaveType)
}));

// Leave Balances Table
export const leaveBalances = pgTable("leave_balances", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  userId: uuid("user_id").references(() => users.id),
  leaveType: text("leave_type").notNull(),
  totalDays: numeric("total_days", { precision: 5, scale: 1 }).notNull(),
  usedDays: numeric("used_days", { precision: 5, scale: 1 }).default('0'),
  remainingDays: numeric("remaining_days", { precision: 5, scale: 1 }).notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
}, (table) => ({
  uniqueUserLeaveType: unique().on(table.userId, table.leaveType, table.year)
}));

// Notifications Table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  userId: uuid("user_id").references(() => users.id),
  type: text("type").notNull(), // leave_approved, leave_rejected, etc.
  title: text("title").notNull(),
  message: text("message").notNull(),
  relatedId: uuid("related_id"), // ID of related entity (e.g., leave request ID)
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Hotel Taxes Table
export const hotelTaxes = pgTable("hotel_taxes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  taxType: text("tax_type").notNull(),
  percent: numeric("percent", { precision: 5, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
}, (table) => ({
  uniqueHotelTax: unique().on(table.hotelId, table.taxType)
}));

// Discount Vouchers Table
export const vouchers = pgTable("vouchers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  code: text("code").unique().notNull(),
  discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }),
  discountType: text("discount_type"),
  validFrom: timestamp("valid_from", { withTimezone: true }),
  validUntil: timestamp("valid_until", { withTimezone: true }),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").default(0),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Vehicle Logs Table
export const vehicleLogs = pgTable("vehicle_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  vehicleNumber: text("vehicle_number").notNull(),
  vehicleType: text("vehicle_type"),
  driverName: text("driver_name"),
  purpose: text("purpose"),
  checkIn: timestamp("check_in", { withTimezone: true }).defaultNow(),
  checkOut: timestamp("check_out", { withTimezone: true }),
  recordedBy: uuid("recorded_by").references(() => users.id)
});

// Security Alerts Table
export const securityAlerts = pgTable("security_alerts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  type: text("type").notNull(),
  description: text("description").notNull(),
  vehicleLogId: uuid("vehicle_log_id").references(() => vehicleLogs.id),
  performedBy: uuid("performed_by").references(() => users.id),
  overriddenBy: uuid("overridden_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Room Service Orders Table
export const roomServiceOrders = pgTable("room_service_orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  roomId: uuid("room_id").references(() => rooms.id),
  requestedBy: uuid("requested_by").references(() => users.id),
  status: text("status").default('pending'),
  specialInstructions: text("special_instructions"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Meal Plans Table
export const mealPlans = pgTable("meal_plans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id, { onDelete: "cascade" }),
  planType: text("plan_type").notNull(),
  planName: text("plan_name").notNull(),
  pricePerPerson: numeric("price_per_person", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Meal Vouchers Table
export const mealVouchers = pgTable("meal_vouchers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id, { onDelete: "cascade" }),
  roomId: uuid("room_id").references(() => rooms.id),
  guestName: text("guest_name").notNull(),
  mealPlanId: uuid("meal_plan_id").references(() => mealPlans.id),
  mealPlanType: text("meal_plan_type").notNull(),
  numberOfPersons: integer("number_of_persons").notNull(),
  voucherDate: timestamp("voucher_date", { withTimezone: true }).notNull(),
  status: text("status").default('unused'),
  usedAt: timestamp("used_at", { withTimezone: true }),
  redeemedBy: uuid("redeemed_by").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Room Reservations Table
export const roomReservations = pgTable("room_reservations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id, { onDelete: "cascade" }),
  guestId: uuid("guest_id").references(() => guests.id),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email"),
  guestPhone: text("guest_phone").notNull(),
  roomId: uuid("room_id").references(() => rooms.id).notNull(),
  checkInDate: timestamp("check_in_date", { withTimezone: true }).notNull(),
  checkOutDate: timestamp("check_out_date", { withTimezone: true }).notNull(),
  numberOfPersons: integer("number_of_persons").notNull(),
  mealPlanId: uuid("meal_plan_id").references(() => mealPlans.id),
  roomPrice: numeric("room_price", { precision: 12, scale: 2 }),
  mealPlanPrice: numeric("meal_plan_price", { precision: 12, scale: 2 }),
  totalPrice: numeric("total_price", { precision: 12, scale: 2 }),
  paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }).default('0'),
  specialRequests: text("special_requests"),
  guestType: text("guest_type").default('walkin'),
  status: text("status").default('pending'),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Room Service Charges Table
export const roomServiceCharges = pgTable("room_service_charges", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id, { onDelete: "cascade" }),
  reservationId: uuid("reservation_id").references(() => roomReservations.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id").references(() => services.id),
  serviceName: text("service_name").notNull(),
  serviceKind: text("service_kind").notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull(),
  unit: text("unit").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  totalCharge: numeric("total_charge", { precision: 12, scale: 2 }).notNull(),
  notes: text("notes"),
  addedBy: uuid("added_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Stock Requests Table
export const stockRequests = pgTable("stock_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id, { onDelete: "cascade" }),
  requestedBy: uuid("requested_by").references(() => users.id).notNull(),
  itemId: uuid("item_id").references(() => inventoryItems.id).notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull(),
  unit: text("unit").notNull(),
  status: text("status").default('pending').notNull(),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  department: text("department"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Service Packages Table
export const servicePackages = pgTable("service_packages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  basePrice: numeric("base_price", { precision: 12, scale: 2 }).notNull(),
  items: jsonb("items").default('[]'),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Hall Bookings Table
export const hallBookings = pgTable("hall_bookings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id, { onDelete: "cascade" }),
  hallId: uuid("hall_id").references(() => halls.id).notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  guestId: uuid("guest_id").references(() => guests.id),
  isInHouseGuest: boolean("is_in_house_guest").default(false),
  bookingStartTime: timestamp("booking_start_time", { withTimezone: true }).notNull(),
  bookingEndTime: timestamp("booking_end_time", { withTimezone: true }).notNull(),
  duration: numeric("duration", { precision: 6, scale: 2 }),
  numberOfPeople: integer("number_of_people"),
  actualNumberOfPeople: integer("actual_number_of_people"),
  hallBasePrice: numeric("hall_base_price", { precision: 12, scale: 2 }),
  foodServices: jsonb("food_services").default('[]'),
  otherServices: jsonb("other_services").default('[]'),
  servicePackages: jsonb("service_packages").default('[]'),
  customServices: text("custom_services"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  advancePaid: numeric("advance_paid", { precision: 12, scale: 2 }).default('0'),
  balanceDue: numeric("balance_due", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: text("payment_method"),
  status: text("status").default('quotation').notNull(),
  specialRequests: text("special_requests"),
  createdBy: uuid("created_by").references(() => users.id),
  confirmedBy: uuid("confirmed_by").references(() => users.id),
  cancelledBy: uuid("cancelled_by").references(() => users.id),
  cancellationReason: text("cancellation_reason"),
  finalizedBy: uuid("finalized_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  finalizedAt: timestamp("finalized_at", { withTimezone: true })
});

// Booking Payment Records Table
export const bookingPayments = pgTable("booking_payments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id, { onDelete: "cascade" }),
  bookingId: uuid("booking_id").references(() => hallBookings.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  receiptNumber: text("receipt_number"),
  notes: text("notes"),
  recordedBy: uuid("recorded_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Restaurant Bills Table
export const restaurantBills = pgTable("restaurant_bills", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  billNumber: text("bill_number").notNull(),
  tableIds: text("table_ids").array().notNull(),
  orderIds: text("order_ids").array().notNull(),
  subtotal: numeric("subtotal", { precision: 14, scale: 2 }).notNull(),
  taxBreakdown: jsonb("tax_breakdown").default('{}'),
  totalTax: numeric("total_tax", { precision: 14, scale: 2 }).default('0'),
  discount: numeric("discount", { precision: 14, scale: 2 }).default('0'),
  voucherId: uuid("voucher_id").references(() => vouchers.id),
  voucherCode: text("voucher_code"),
  tipType: text("tip_type"),
  tipValue: numeric("tip_value", { precision: 12, scale: 2 }).default('0'),
  tipAmount: numeric("tip_amount", { precision: 12, scale: 2 }).default('0'),
  serviceCharge: numeric("service_charge", { precision: 12, scale: 2 }).default('0'),
  grandTotal: numeric("grand_total", { precision: 14, scale: 2 }).notNull(),
  splitMode: text("split_mode"),
  splitDetails: jsonb("split_details"),
  items: jsonb("items").default('[]'),
  status: text("status").default('draft').notNull(),
  amendmentNote: text("amendment_note"),
  originalBillId: uuid("original_bill_id"),
  createdBy: uuid("created_by").references(() => users.id),
  amendedBy: uuid("amended_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  amendedAt: timestamp("amended_at", { withTimezone: true }),
  finalizedAt: timestamp("finalized_at", { withTimezone: true })
});

// Bill Payments Table
export const billPayments = pgTable("bill_payments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  billId: uuid("bill_id").references(() => restaurantBills.id, { onDelete: "cascade" }),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  transactionId: uuid("transaction_id").references(() => transactions.id),
  reference: text("reference"),
  receivedBy: uuid("received_by").references(() => users.id),
  isVoided: boolean("is_voided").default(false),
  voidedAt: timestamp("voided_at", { withTimezone: true }),
  voidedBy: uuid("voided_by").references(() => users.id),
  voidReason: text("void_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// Relations
export const hotelRelations = relations(hotels, ({ many }) => ({
  users: many(users),
  rooms: many(rooms),
  halls: many(halls),
  pools: many(pools),
  services: many(services),
  inventoryItems: many(inventoryItems),
  vendors: many(vendors),
  transactions: many(transactions),
  maintenanceRequests: many(maintenanceRequests),
  tasks: many(tasks),
  restaurantTables: many(restaurantTables),
  menuCategories: many(menuCategories),
  menuItems: many(menuItems),
  kotOrders: many(kotOrders),
  payments: many(payments),
  attendance: many(attendance),
  hotelTaxes: many(hotelTaxes),
  vouchers: many(vouchers),
  vehicleLogs: many(vehicleLogs),
  roomServiceOrders: many(roomServiceOrders),
  mealPlans: many(mealPlans),
  stockRequests: many(stockRequests),
  hallBookings: many(hallBookings),
  servicePackages: many(servicePackages),
  bookingPayments: many(bookingPayments),
  restaurantBills: many(restaurantBills),
  billPayments: many(billPayments)
}));

export const userRelations = relations(users, ({ one, many }) => ({
  hotel: one(hotels, {
    fields: [users.hotelId],
    references: [hotels.id]
  }),
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id]
  }),
  sessions: many(userSessions),
  createdTasks: many(tasks, { relationName: "createdTasks" }),
  assignedTasks: many(tasks, { relationName: "assignedTasks" }),
  transactions: many(transactions),
  payments: many(payments),
  attendance: many(attendance),
  vouchers: many(vouchers),
  vehicleLogs: many(vehicleLogs),
  roomServiceOrders: many(roomServiceOrders)
}));

export const roomRelations = relations(rooms, ({ one, many }) => ({
  hotel: one(hotels, {
    fields: [rooms.hotelId],
    references: [hotels.id]
  }),
  roomType: one(roomTypes, {
    fields: [rooms.roomTypeId],
    references: [roomTypes.id]
  }),
  roomServiceOrders: many(roomServiceOrders)
}));

export const menuItemRelations = relations(menuItems, ({ one }) => ({
  hotel: one(hotels, {
    fields: [menuItems.hotelId],
    references: [hotels.id]
  }),
  category: one(menuCategories, {
    fields: [menuItems.categoryId],
    references: [menuCategories.id]
  })
}));

export const kotOrderRelations = relations(kotOrders, ({ one, many }) => ({
  hotel: one(hotels, {
    fields: [kotOrders.hotelId],
    references: [hotels.id]
  }),
  table: one(restaurantTables, {
    fields: [kotOrders.tableId],
    references: [restaurantTables.id]
  }),
  createdBy: one(users, {
    fields: [kotOrders.createdBy],
    references: [users.id]
  }),
  items: many(kotItems)
}));

export const kotItemRelations = relations(kotItems, ({ one }) => ({
  kot: one(kotOrders, {
    fields: [kotItems.kotId],
    references: [kotOrders.id]
  })
}));

export const taskRelations = relations(tasks, ({ one }) => ({
  hotel: one(hotels, {
    fields: [tasks.hotelId],
    references: [hotels.id]
  }),
  createdBy: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
    relationName: "createdTasks"
  }),
  assignedTo: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
    relationName: "assignedTasks"
  })
}));

export const hallRelations = relations(halls, ({ one, many }) => ({
  hotel: one(hotels, {
    fields: [halls.hotelId],
    references: [hotels.id]
  }),
  bookings: many(hallBookings)
}));

export const hallBookingRelations = relations(hallBookings, ({ one, many }) => ({
  hotel: one(hotels, {
    fields: [hallBookings.hotelId],
    references: [hotels.id]
  }),
  hall: one(halls, {
    fields: [hallBookings.hallId],
    references: [halls.id]
  }),
  guest: one(guests, {
    fields: [hallBookings.guestId],
    references: [guests.id]
  }),
  createdBy: one(users, {
    fields: [hallBookings.createdBy],
    references: [users.id]
  }),
  payments: many(bookingPayments)
}));

export const servicePackageRelations = relations(servicePackages, ({ one }) => ({
  hotel: one(hotels, {
    fields: [servicePackages.hotelId],
    references: [hotels.id]
  })
}));

export const bookingPaymentRelations = relations(bookingPayments, ({ one }) => ({
  hotel: one(hotels, {
    fields: [bookingPayments.hotelId],
    references: [hotels.id]
  }),
  booking: one(hallBookings, {
    fields: [bookingPayments.bookingId],
    references: [hallBookings.id]
  }),
  recordedBy: one(users, {
    fields: [bookingPayments.recordedBy],
    references: [users.id]
  })
}));

export const restaurantBillRelations = relations(restaurantBills, ({ one, many }) => ({
  hotel: one(hotels, {
    fields: [restaurantBills.hotelId],
    references: [hotels.id]
  }),
  createdBy: one(users, {
    fields: [restaurantBills.createdBy],
    references: [users.id]
  }),
  payments: many(billPayments)
}));

export const billPaymentRelations = relations(billPayments, ({ one }) => ({
  bill: one(restaurantBills, {
    fields: [billPayments.billId],
    references: [restaurantBills.id]
  }),
  hotel: one(hotels, {
    fields: [billPayments.hotelId],
    references: [hotels.id]
  }),
  receivedBy: one(users, {
    fields: [billPayments.receivedBy],
    references: [users.id]
  })
}));

// Schema exports for forms
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true
});

export const insertHotelSchema = createInsertSchema(hotels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true
});

export const insertRoomStatusLogSchema = createInsertSchema(roomStatusLogs).omit({
  id: true,
  createdAt: true
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
  createdAt: true
}).extend({
  price: z.union([z.string(), z.number()])
    .transform((val) => String(val))
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 99999999;
    }, {
      message: "Price must be a non-negative number (max 99,999,999)"
    })
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  dueDate: z.union([z.string(), z.date(), z.null(), z.undefined()])
    .transform((val) => {
      if (!val) return null;
      if (val instanceof Date) return val;
      return new Date(val);
    })
    .optional()
});

export const insertRoomCleaningQueueSchema = createInsertSchema(roomCleaningQueue).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertRoomCleaningQueue = z.infer<typeof insertRoomCleaningQueueSchema>;
export type SelectRoomCleaningQueue = typeof roomCleaningQueue.$inferSelect;

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  deletedAt: true
}).refine(
  (data) => {
    // For revenue transactions (those with _in in txnType), require a valid paymentMethod
    if (data.txnType && (data.txnType.includes('_in') || data.txnType === 'revenue')) {
      return data.paymentMethod && ['cash', 'pos', 'fonepay'].includes(data.paymentMethod);
    }
    // For vendor payments, allow additional payment methods
    if (data.txnType === 'vendor_payment') {
      return data.paymentMethod && ['cash', 'cheque', 'bank_transfer', 'digital_wallet', 'pos', 'fonepay'].includes(data.paymentMethod);
    }
    return true;
  },
  {
    message: "Invalid payment method for this transaction type",
    path: ['paymentMethod']
  }
);

export const insertMaintenanceRequestSchema = createInsertSchema(maintenanceRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedAt: true,
  declinedAt: true
});

export const insertMaintenanceStatusHistorySchema = createInsertSchema(maintenanceStatusHistory).omit({
  id: true,
  createdAt: true
});

export const insertVoucherSchema = createInsertSchema(vouchers).omit({
  id: true,
  createdAt: true,
  usedCount: true
}).extend({
  validFrom: z.string().or(z.date()).transform((val) => val instanceof Date ? val : new Date(val)),
  validUntil: z.string().or(z.date()).transform((val) => val instanceof Date ? val : new Date(val))
});

export const insertRoomTypeSchema = createInsertSchema(roomTypes).omit({
  id: true
});

export const insertHallSchema = createInsertSchema(halls).omit({
  id: true,
  createdAt: true
});

export const insertPoolSchema = createInsertSchema(pools).omit({
  id: true,
  createdAt: true
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvalDate: true
}).extend({
  startDate: z.string().or(z.date()).transform((val) => val instanceof Date ? val : new Date(val)),
  endDate: z.string().or(z.date()).transform((val) => val instanceof Date ? val : new Date(val))
});

export const insertLeavePolicySchema = createInsertSchema(leavePolicies).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertLeaveBalanceSchema = createInsertSchema(leaveBalances).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  totalDays: z.union([z.string(), z.number()]).transform((val) => String(val)),
  usedDays: z.union([z.string(), z.number()]).transform((val) => String(val)).optional(),
  remainingDays: z.union([z.string(), z.number()]).transform((val) => String(val))
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true
});

export const insertWastageSchema = createInsertSchema(wastages).omit({
  id: true,
  createdAt: true
});

export const insertVehicleLogSchema = createInsertSchema(vehicleLogs).omit({
  id: true,
  hotelId: true,
  recordedBy: true,
  checkIn: true
});

export const insertSecurityAlertSchema = createInsertSchema(securityAlerts).omit({
  id: true,
  createdAt: true
});

export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  pricePerPerson: z.union([z.string(), z.number()])
    .transform((val) => String(val))
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 99999999;
    }, {
      message: "Price per person must be a non-negative number (max 99,999,999)"
    })
});

export const insertMealVoucherSchema = createInsertSchema(mealVouchers).omit({
  id: true,
  createdAt: true
}).extend({
  voucherDate: z.string().or(z.date()).transform((val) => val instanceof Date ? val : new Date(val))
});

export const insertRoomReservationSchema = createInsertSchema(roomReservations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  checkInDate: z.string().or(z.date()).transform((val) => val instanceof Date ? val : new Date(val)),
  checkOutDate: z.string().or(z.date()).transform((val) => val instanceof Date ? val : new Date(val))
});

export const insertRoomServiceChargeSchema = createInsertSchema(roomServiceCharges).omit({
  id: true,
  createdAt: true
}).extend({
  quantity: z.union([z.string(), z.number()]).transform((val) => String(val)),
  unitPrice: z.union([z.string(), z.number()]).transform((val) => String(val)),
  totalCharge: z.union([z.string(), z.number()]).transform((val) => String(val))
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true
});

export const insertGuestSchema = createInsertSchema(guests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  currentReservationId: true
});

export const insertStockRequestSchema = createInsertSchema(stockRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedAt: true,
  deliveredAt: true
}).extend({
  quantity: z.union([z.string(), z.number()]).transform((val) => String(val))
});

export const insertHallBookingSchema = createInsertSchema(hallBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  confirmedAt: true,
  cancelledAt: true
}).extend({
  bookingStartTime: z.string().or(z.date()).transform((val) => val instanceof Date ? val : new Date(val)),
  bookingEndTime: z.string().or(z.date()).transform((val) => val instanceof Date ? val : new Date(val)),
  numberOfPeople: z.union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => val >= 1 && val <= 100000, {
      message: "Number of people must be between 1 and 100,000"
    }),
  hallBasePrice: z.union([z.string(), z.number()])
    .transform((val) => String(val))
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 99999999;
    }, {
      message: "Hall base price must be a non-negative number (max 99,999,999)"
    }),
  totalAmount: z.union([z.string(), z.number()])
    .transform((val) => String(val))
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 99999999;
    }, {
      message: "Total amount must be a non-negative number (max 99,999,999)"
    }),
  advancePaid: z.union([z.string(), z.number()])
    .transform((val) => String(val))
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 99999999;
    }, {
      message: "Advance paid must be a non-negative number (max 99,999,999)"
    }),
  balanceDue: z.union([z.string(), z.number()])
    .transform((val) => String(val))
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= -99999999 && num <= 99999999;
    }, {
      message: "Balance due must be a valid number (between -99,999,999 and 99,999,999)"
    })
});

export type InsertHallBooking = z.infer<typeof insertHallBookingSchema>;
export type SelectHallBooking = typeof hallBookings.$inferSelect;

export const insertServicePackageSchema = createInsertSchema(servicePackages).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  basePrice: z.union([z.string(), z.number()]).transform((val) => String(val))
});

export type InsertServicePackage = z.infer<typeof insertServicePackageSchema>;
export type SelectServicePackage = typeof servicePackages.$inferSelect;

export const insertBookingPaymentSchema = createInsertSchema(bookingPayments).omit({
  id: true,
  createdAt: true
}).extend({
  amount: z.union([z.string(), z.number()]).transform((val) => String(val))
});

export type InsertBookingPayment = z.infer<typeof insertBookingPaymentSchema>;
export type SelectBookingPayment = typeof bookingPayments.$inferSelect;

export const updateKotItemSchema = z.object({
  status: z.enum(['pending', 'approved', 'declined', 'ready', 'served', 'completed', 'cancelled']).optional(),
  qty: z.number().int().min(1).optional(),
  declineReason: z.string().optional(),
  inventoryVerified: z.boolean().optional()
}).refine(
  (data) => !data.status || data.status !== 'declined' || (data.declineReason && data.declineReason.trim().length >= 10),
  { message: "Decline reason requires minimum 10 characters when declining a KOT item", path: ['declineReason'] }
).refine(
  (data) => !data.status || data.status !== 'cancelled' || (data.declineReason && data.declineReason.trim().length >= 10),
  { message: "Cancellation reason requires minimum 10 characters", path: ['declineReason'] }
);

// Types
export type User = typeof users.$inferSelect;
export type UserWithRole = User & { role?: Role };
export type InsertUser = z.infer<typeof insertUserSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type Hotel = typeof hotels.$inferSelect;
export type InsertHotel = z.infer<typeof insertHotelSchema>;
export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type RoomStatusLog = typeof roomStatusLogs.$inferSelect;
export type InsertRoomStatusLog = z.infer<typeof insertRoomStatusLogSchema>;
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
export type InsertMaintenanceRequest = z.infer<typeof insertMaintenanceRequestSchema>;
export type MaintenanceStatusHistory = typeof maintenanceStatusHistory.$inferSelect;
export type InsertMaintenanceStatusHistory = z.infer<typeof insertMaintenanceStatusHistorySchema>;
export type InsertVoucher = z.infer<typeof insertVoucherSchema>;
export type KotOrder = typeof kotOrders.$inferSelect;
export type KotItem = typeof kotItems.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type RestaurantTable = typeof restaurantTables.$inferSelect;
export type MenuCategory = typeof menuCategories.$inferSelect;
export type HotelTax = typeof hotelTaxes.$inferSelect;
export type Voucher = typeof vouchers.$inferSelect;
export type VehicleLog = typeof vehicleLogs.$inferSelect;
export type InsertVehicleLog = z.infer<typeof insertVehicleLogSchema>;
export type SecurityAlert = typeof securityAlerts.$inferSelect;
export type InsertSecurityAlert = z.infer<typeof insertSecurityAlertSchema>;
export type RoomServiceOrder = typeof roomServiceOrders.$inferSelect;
export type RoomType = typeof roomTypes.$inferSelect;
export type InsertRoomType = z.infer<typeof insertRoomTypeSchema>;
export type Hall = typeof halls.$inferSelect;
export type InsertHall = z.infer<typeof insertHallSchema>;
export type Pool = typeof pools.$inferSelect;
export type InsertPool = z.infer<typeof insertPoolSchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type InventoryConsumption = typeof inventoryConsumptions.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type LeavePolicy = typeof leavePolicies.$inferSelect;
export type InsertLeavePolicy = z.infer<typeof insertLeavePolicySchema>;
export type LeaveBalance = typeof leaveBalances.$inferSelect;
export type InsertLeaveBalance = z.infer<typeof insertLeaveBalanceSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Wastage = typeof wastages.$inferSelect;
export type InsertWastage = z.infer<typeof insertWastageSchema>;
export type MealPlan = typeof mealPlans.$inferSelect;
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;
export type MealVoucher = typeof mealVouchers.$inferSelect;
export type InsertMealVoucher = z.infer<typeof insertMealVoucherSchema>;
export type RoomReservation = typeof roomReservations.$inferSelect;
export type InsertRoomReservation = z.infer<typeof insertRoomReservationSchema>;
export type RoomServiceCharge = typeof roomServiceCharges.$inferSelect;
export type InsertRoomServiceCharge = z.infer<typeof insertRoomServiceChargeSchema>;
export type Guest = typeof guests.$inferSelect;
export type InsertGuest = z.infer<typeof insertGuestSchema>;
export type StockRequest = typeof stockRequests.$inferSelect;
export type InsertStockRequest = z.infer<typeof insertStockRequestSchema>;

export const insertRestaurantBillSchema = createInsertSchema(restaurantBills).omit({
  id: true,
  createdAt: true,
  amendedAt: true,
  finalizedAt: true
}).extend({
  subtotal: z.union([z.string(), z.number()]).transform((val) => String(val)),
  totalTax: z.union([z.string(), z.number()]).transform((val) => String(val)),
  discount: z.union([z.string(), z.number()]).transform((val) => String(val)),
  tipValue: z.union([z.string(), z.number()]).transform((val) => String(val)),
  tipAmount: z.union([z.string(), z.number()]).transform((val) => String(val)),
  serviceCharge: z.union([z.string(), z.number()]).transform((val) => String(val)),
  grandTotal: z.union([z.string(), z.number()]).transform((val) => String(val))
});

export type InsertRestaurantBill = z.infer<typeof insertRestaurantBillSchema>;
export type SelectRestaurantBill = typeof restaurantBills.$inferSelect;

export const insertBillPaymentSchema = createInsertSchema(billPayments).omit({
  id: true,
  createdAt: true,
  voidedAt: true
}).extend({
  amount: z.union([z.string(), z.number()]).transform((val) => String(val))
});

export type InsertBillPayment = z.infer<typeof insertBillPaymentSchema>;
export type SelectBillPayment = typeof billPayments.$inferSelect;

// Checkout Override Logs Table
export const checkoutOverrideLogs = pgTable("checkout_override_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  reservationId: uuid("reservation_id").references(() => roomReservations.id),
  balanceDue: numeric("balance_due", { precision: 14, scale: 2 }),
  overriddenBy: uuid("overridden_by").references(() => users.id),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

export const insertCheckoutOverrideLogSchema = createInsertSchema(checkoutOverrideLogs).omit({
  id: true,
  createdAt: true
}).extend({
  balanceDue: z.union([z.string(), z.number()]).transform((val) => String(val))
});

export type InsertCheckoutOverrideLog = z.infer<typeof insertCheckoutOverrideLogSchema>;
export type CheckoutOverrideLog = typeof checkoutOverrideLogs.$inferSelect;

// Price Change Logs Table
export const priceChangeLogs = pgTable("price_change_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  itemId: uuid("item_id"),
  itemType: text("item_type"),
  itemName: text("item_name"),
  previousPrice: numeric("previous_price", { precision: 12, scale: 2 }),
  newPrice: numeric("new_price", { precision: 12, scale: 2 }),
  changedBy: uuid("changed_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

export const insertPriceChangeLogSchema = createInsertSchema(priceChangeLogs).omit({
  id: true,
  createdAt: true
}).extend({
  previousPrice: z.union([z.string(), z.number()]).transform((val) => String(val)),
  newPrice: z.union([z.string(), z.number()]).transform((val) => String(val))
});

export type InsertPriceChangeLog = z.infer<typeof insertPriceChangeLogSchema>;
export type PriceChangeLog = typeof priceChangeLogs.$inferSelect;

// Tax Change Logs Table
export const taxChangeLogs = pgTable("tax_change_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  taxType: text("tax_type").notNull(),
  previousPercent: numeric("previous_percent", { precision: 5, scale: 2 }),
  newPercent: numeric("new_percent", { precision: 5, scale: 2 }),
  previousActive: boolean("previous_active"),
  newActive: boolean("new_active"),
  changedBy: uuid("changed_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

export const insertTaxChangeLogSchema = createInsertSchema(taxChangeLogs).omit({
  id: true,
  createdAt: true
}).extend({
  previousPercent: z.union([z.string(), z.number(), z.null()]).transform((val) => val === null ? null : String(val)),
  newPercent: z.union([z.string(), z.number(), z.null()]).transform((val) => val === null ? null : String(val))
});

export type InsertTaxChangeLog = z.infer<typeof insertTaxChangeLogSchema>;
export type TaxChangeLog = typeof taxChangeLogs.$inferSelect;
