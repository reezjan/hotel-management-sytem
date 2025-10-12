var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  attendance: () => attendance,
  auditLogs: () => auditLogs,
  billPaymentRelations: () => billPaymentRelations,
  billPayments: () => billPayments,
  bookingPaymentRelations: () => bookingPaymentRelations,
  bookingPayments: () => bookingPayments,
  checkoutOverrideLogs: () => checkoutOverrideLogs,
  guests: () => guests,
  hallBookingRelations: () => hallBookingRelations,
  hallBookings: () => hallBookings,
  hallRelations: () => hallRelations,
  halls: () => halls,
  hotelRelations: () => hotelRelations,
  hotelTaxes: () => hotelTaxes,
  hotels: () => hotels,
  insertAttendanceSchema: () => insertAttendanceSchema,
  insertAuditLogSchema: () => insertAuditLogSchema,
  insertBillPaymentSchema: () => insertBillPaymentSchema,
  insertBookingPaymentSchema: () => insertBookingPaymentSchema,
  insertCheckoutOverrideLogSchema: () => insertCheckoutOverrideLogSchema,
  insertGuestSchema: () => insertGuestSchema,
  insertHallBookingSchema: () => insertHallBookingSchema,
  insertHallSchema: () => insertHallSchema,
  insertHotelSchema: () => insertHotelSchema,
  insertLeaveBalanceSchema: () => insertLeaveBalanceSchema,
  insertLeavePolicySchema: () => insertLeavePolicySchema,
  insertLeaveRequestSchema: () => insertLeaveRequestSchema,
  insertMaintenanceRequestSchema: () => insertMaintenanceRequestSchema,
  insertMaintenanceStatusHistorySchema: () => insertMaintenanceStatusHistorySchema,
  insertMealPlanSchema: () => insertMealPlanSchema,
  insertMealVoucherSchema: () => insertMealVoucherSchema,
  insertMenuItemSchema: () => insertMenuItemSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertPoolSchema: () => insertPoolSchema,
  insertPriceChangeLogSchema: () => insertPriceChangeLogSchema,
  insertRestaurantBillSchema: () => insertRestaurantBillSchema,
  insertRoomCleaningQueueSchema: () => insertRoomCleaningQueueSchema,
  insertRoomReservationSchema: () => insertRoomReservationSchema,
  insertRoomSchema: () => insertRoomSchema,
  insertRoomServiceChargeSchema: () => insertRoomServiceChargeSchema,
  insertRoomStatusLogSchema: () => insertRoomStatusLogSchema,
  insertRoomTypeSchema: () => insertRoomTypeSchema,
  insertSecurityAlertSchema: () => insertSecurityAlertSchema,
  insertServicePackageSchema: () => insertServicePackageSchema,
  insertServiceSchema: () => insertServiceSchema,
  insertStockRequestSchema: () => insertStockRequestSchema,
  insertTaskSchema: () => insertTaskSchema,
  insertTaxChangeLogSchema: () => insertTaxChangeLogSchema,
  insertTransactionSchema: () => insertTransactionSchema,
  insertUserSchema: () => insertUserSchema,
  insertVehicleLogSchema: () => insertVehicleLogSchema,
  insertVendorSchema: () => insertVendorSchema,
  insertVoucherSchema: () => insertVoucherSchema,
  insertWastageSchema: () => insertWastageSchema,
  inventoryConsumptions: () => inventoryConsumptions,
  inventoryItems: () => inventoryItems,
  inventoryTransactions: () => inventoryTransactions,
  kotAuditLogs: () => kotAuditLogs,
  kotItemRelations: () => kotItemRelations,
  kotItems: () => kotItems,
  kotOrderRelations: () => kotOrderRelations,
  kotOrders: () => kotOrders,
  leaveBalances: () => leaveBalances,
  leavePolicies: () => leavePolicies,
  leaveRequests: () => leaveRequests,
  maintenanceRequests: () => maintenanceRequests,
  maintenanceStatusHistory: () => maintenanceStatusHistory,
  mealPlans: () => mealPlans,
  mealVouchers: () => mealVouchers,
  menuCategories: () => menuCategories,
  menuItemRelations: () => menuItemRelations,
  menuItems: () => menuItems,
  notifications: () => notifications,
  passwordResets: () => passwordResets,
  payments: () => payments,
  pools: () => pools,
  priceChangeLogs: () => priceChangeLogs,
  restaurantBillRelations: () => restaurantBillRelations,
  restaurantBills: () => restaurantBills,
  restaurantTables: () => restaurantTables,
  roleCreationPermissions: () => roleCreationPermissions,
  roles: () => roles,
  roomCleaningQueue: () => roomCleaningQueue,
  roomRelations: () => roomRelations,
  roomReservations: () => roomReservations,
  roomServiceCharges: () => roomServiceCharges,
  roomServiceOrders: () => roomServiceOrders,
  roomStatusLogs: () => roomStatusLogs,
  roomTypes: () => roomTypes,
  rooms: () => rooms,
  securityAlerts: () => securityAlerts,
  servicePackageRelations: () => servicePackageRelations,
  servicePackages: () => servicePackages,
  services: () => services,
  stockRequests: () => stockRequests,
  taskRelations: () => taskRelations,
  tasks: () => tasks,
  taxChangeLogs: () => taxChangeLogs,
  transactions: () => transactions,
  updateKotItemSchema: () => updateKotItemSchema,
  userRelations: () => userRelations,
  userSessions: () => userSessions,
  users: () => users,
  vehicleLogs: () => vehicleLogs,
  vendors: () => vendors,
  vouchers: () => vouchers,
  wastages: () => wastages
});
import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  uuid,
  timestamp,
  boolean,
  integer,
  serial,
  numeric,
  jsonb,
  unique
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var hotels, roles, roleCreationPermissions, users, userSessions, auditLogs, guests, roomTypes, rooms, roomStatusLogs, halls, pools, services, inventoryItems, inventoryConsumptions, wastages, inventoryTransactions, vendors, transactions, maintenanceRequests, maintenanceStatusHistory, tasks, roomCleaningQueue, restaurantTables, menuCategories, menuItems, kotOrders, kotItems, kotAuditLogs, payments, passwordResets, attendance, leaveRequests, leavePolicies, leaveBalances, notifications, hotelTaxes, vouchers, vehicleLogs, securityAlerts, roomServiceOrders, mealPlans, mealVouchers, roomReservations, roomServiceCharges, stockRequests, servicePackages, hallBookings, bookingPayments, restaurantBills, billPayments, hotelRelations, userRelations, roomRelations, menuItemRelations, kotOrderRelations, kotItemRelations, taskRelations, hallRelations, hallBookingRelations, servicePackageRelations, bookingPaymentRelations, restaurantBillRelations, billPaymentRelations, insertUserSchema, insertAuditLogSchema, insertHotelSchema, insertRoomSchema, insertRoomStatusLogSchema, insertMenuItemSchema, insertTaskSchema, insertRoomCleaningQueueSchema, insertTransactionSchema, insertMaintenanceRequestSchema, insertMaintenanceStatusHistorySchema, insertVoucherSchema, insertRoomTypeSchema, insertHallSchema, insertPoolSchema, insertServiceSchema, insertLeaveRequestSchema, insertLeavePolicySchema, insertLeaveBalanceSchema, insertNotificationSchema, insertWastageSchema, insertVehicleLogSchema, insertSecurityAlertSchema, insertMealPlanSchema, insertMealVoucherSchema, insertRoomReservationSchema, insertRoomServiceChargeSchema, insertVendorSchema, insertGuestSchema, insertStockRequestSchema, insertHallBookingSchema, insertServicePackageSchema, insertBookingPaymentSchema, updateKotItemSchema, insertAttendanceSchema, insertRestaurantBillSchema, insertBillPaymentSchema, checkoutOverrideLogs, insertCheckoutOverrideLogSchema, priceChangeLogs, insertPriceChangeLogSchema, taxChangeLogs, insertTaxChangeLogSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    hotels = pgTable("hotels", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      address: text("address"),
      phone: text("phone"),
      zip: text("zip"),
      vatNo: text("vat_no"),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
      deletedAt: timestamp("deleted_at", { withTimezone: true }),
      settings: jsonb("settings").default("{}")
    });
    roles = pgTable("roles", {
      id: serial("id").primaryKey(),
      name: text("name").unique().notNull(),
      description: text("description")
    });
    roleCreationPermissions = pgTable("role_creation_permissions", {
      id: serial("id").primaryKey(),
      creatorRole: text("creator_role").notNull(),
      createeRole: text("createe_role").notNull(),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
    });
    users = pgTable("users", {
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
      verification: jsonb("verification").default("{}")
    });
    userSessions = pgTable("user_sessions", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
      jwtToken: text("jwt_token"),
      deviceInfo: text("device_info"),
      ip: text("ip"),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
      lastSeen: timestamp("last_seen", { withTimezone: true }).defaultNow(),
      revokedAt: timestamp("revoked_at", { withTimezone: true })
    });
    auditLogs = pgTable("audit_logs", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      userId: uuid("user_id").references(() => users.id),
      action: text("action").notNull(),
      // login, logout, create, update, delete, void, approve, etc.
      resourceType: text("resource_type").notNull(),
      // user, transaction, bill, inventory, etc.
      resourceId: text("resource_id"),
      details: jsonb("details"),
      // Store any additional context
      ipAddress: text("ip_address"),
      userAgent: text("user_agent"),
      success: boolean("success").default(true),
      errorMessage: text("error_message"),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
    });
    guests = pgTable("guests", {
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
    roomTypes = pgTable("room_types", {
      id: serial("id").primaryKey(),
      hotelId: uuid("hotel_id").references(() => hotels.id, { onDelete: "cascade" }),
      name: text("name"),
      description: text("description"),
      priceInhouse: numeric("price_inhouse", { precision: 12, scale: 2 }),
      priceWalkin: numeric("price_walkin", { precision: 12, scale: 2 })
    });
    rooms = pgTable("rooms", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id, { onDelete: "cascade" }),
      roomNumber: text("room_number"),
      roomTypeId: integer("room_type_id").references(() => roomTypes.id),
      status: text("status").default("available"),
      currentReservationId: uuid("current_reservation_id"),
      isOccupied: boolean("is_occupied").default(false),
      occupantDetails: jsonb("occupant_details"),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
      deletedAt: timestamp("deleted_at", { withTimezone: true })
    });
    roomStatusLogs = pgTable("room_status_logs", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      roomId: uuid("room_id").references(() => rooms.id),
      roomNumber: text("room_number"),
      previousStatus: text("previous_status"),
      newStatus: text("new_status"),
      reason: text("reason"),
      changedBy: uuid("changed_by").references(() => users.id),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
    });
    halls = pgTable("halls", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      name: text("name"),
      capacity: integer("capacity"),
      priceInhouse: numeric("price_inhouse", { precision: 12, scale: 2 }),
      priceWalkin: numeric("price_walkin", { precision: 12, scale: 2 }),
      hourlyRate: numeric("hourly_rate", { precision: 12, scale: 2 }),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
    });
    pools = pgTable("pools", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      name: text("name"),
      priceInhouse: numeric("price_inhouse", { precision: 12, scale: 2 }),
      priceWalkin: numeric("price_walkin", { precision: 12, scale: 2 }),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
    });
    services = pgTable("services", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      kind: text("kind"),
      name: text("name"),
      priceInhouse: numeric("price_inhouse", { precision: 12, scale: 2 }),
      priceWalkin: numeric("price_walkin", { precision: 12, scale: 2 })
    });
    inventoryItems = pgTable("inventory_items", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      sku: text("sku"),
      name: text("name").notNull(),
      description: text("description"),
      unit: text("unit"),
      stockQty: numeric("stock_qty", { precision: 12, scale: 3 }).default("0"),
      packageUnit: text("package_unit"),
      baseUnit: text("base_unit"),
      baseUnitsPerPackage: numeric("base_units_per_package", { precision: 12, scale: 3 }),
      packageStockQty: numeric("package_stock_qty", { precision: 12, scale: 3 }).default("0"),
      baseStockQty: numeric("base_stock_qty", { precision: 12, scale: 3 }).default("0"),
      reorderLevel: numeric("reorder_level", { precision: 12, scale: 3 }).default("0"),
      storageLocation: text("storage_location"),
      costPerUnit: numeric("cost_per_unit", { precision: 12, scale: 2 }).default("0"),
      departments: text("departments").array().default(sql`ARRAY[]::text[]`),
      measurementCategory: text("measurement_category").default("weight"),
      conversionProfile: jsonb("conversion_profile").default("{}"),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
      deletedAt: timestamp("deleted_at", { withTimezone: true })
    });
    inventoryConsumptions = pgTable("inventory_consumptions", {
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
    wastages = pgTable("wastages", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      itemId: uuid("item_id").references(() => inventoryItems.id),
      qty: numeric("qty", { precision: 12, scale: 3 }).notNull(),
      unit: text("unit"),
      reason: text("reason").notNull(),
      recordedBy: uuid("recorded_by").references(() => users.id),
      status: text("status").default("pending_approval"),
      approvedBy: uuid("approved_by").references(() => users.id),
      approvedAt: timestamp("approved_at", { withTimezone: true }),
      estimatedValue: numeric("estimated_value", { precision: 12, scale: 2 }),
      rejectionReason: text("rejection_reason"),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
    });
    inventoryTransactions = pgTable("inventory_transactions", {
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
    vendors = pgTable("vendors", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      name: text("name"),
      contact: jsonb("contact"),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
    });
    transactions = pgTable("transactions", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      txnType: text("txn_type").notNull(),
      amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
      currency: text("currency").default("NPR"),
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
    maintenanceRequests = pgTable("maintenance_requests", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      reportedBy: uuid("reported_by").references(() => users.id),
      title: text("title").notNull(),
      location: text("location"),
      description: text("description"),
      photo: text("photo"),
      priority: text("priority").default("medium"),
      status: text("status").default("pending"),
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
    maintenanceStatusHistory = pgTable("maintenance_status_history", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      requestId: uuid("request_id").references(() => maintenanceRequests.id, { onDelete: "cascade" }),
      previousStatus: text("previous_status"),
      newStatus: text("new_status").notNull(),
      changedBy: uuid("changed_by").references(() => users.id),
      notes: text("notes"),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
    });
    tasks = pgTable("tasks", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      createdBy: uuid("created_by").references(() => users.id),
      assignedTo: uuid("assigned_to").references(() => users.id),
      title: text("title").notNull(),
      description: text("description"),
      status: text("status").default("pending"),
      priority: text("priority").default("medium"),
      dueDate: timestamp("due_date", { withTimezone: true }),
      context: jsonb("context"),
      approvedBy: uuid("approved_by").references(() => users.id),
      approvedAt: timestamp("approved_at", { withTimezone: true }),
      completionNotes: text("completion_notes"),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
    });
    roomCleaningQueue = pgTable("room_cleaning_queue", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      roomId: uuid("room_id").references(() => rooms.id),
      roomNumber: text("room_number").notNull(),
      guestName: text("guest_name"),
      guestId: uuid("guest_id").references(() => guests.id),
      checkoutAt: timestamp("checkout_at", { withTimezone: true }).defaultNow(),
      status: text("status").default("pending"),
      taskId: uuid("task_id").references(() => tasks.id),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
    });
    restaurantTables = pgTable("restaurant_tables", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      name: text("name"),
      capacity: integer("capacity"),
      status: text("status").default("available"),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
    });
    menuCategories = pgTable("menu_categories", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      name: text("name")
    });
    menuItems = pgTable("menu_items", {
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
    kotOrders = pgTable("kot_orders", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      tableId: uuid("table_id").references(() => restaurantTables.id),
      createdBy: uuid("created_by").references(() => users.id),
      status: text("status").default("open"),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
    });
    kotItems = pgTable("kot_items", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      kotId: uuid("kot_id").references(() => kotOrders.id, { onDelete: "cascade" }),
      menuItemId: uuid("menu_item_id"),
      description: text("description"),
      qty: integer("qty").default(1),
      unit: text("unit"),
      inventoryUsage: jsonb("inventory_usage"),
      status: text("status").default("pending"),
      declineReason: text("decline_reason"),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
    });
    kotAuditLogs = pgTable("kot_audit_logs", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      kotItemId: uuid("kot_item_id").references(() => kotItems.id),
      action: text("action").notNull(),
      performedBy: uuid("performed_by").references(() => users.id),
      reason: text("reason"),
      previousStatus: text("previous_status"),
      newStatus: text("new_status"),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
    });
    payments = pgTable("payments", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      payerId: uuid("payer_id").references(() => users.id),
      amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
      method: text("method"),
      reference: text("reference"),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
    });
    passwordResets = pgTable("password_resets", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: uuid("user_id").references(() => users.id),
      token: text("token"),
      expiresAt: timestamp("expires_at", { withTimezone: true }),
      used: boolean("used").default(false),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
    });
    attendance = pgTable("attendance", {
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
      status: text("status").default("active").notNull(),
      clockInSource: text("clock_in_source"),
      clockOutSource: text("clock_out_source"),
      notes: text("notes"),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
    });
    leaveRequests = pgTable("leave_requests", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      requestedBy: uuid("requested_by").references(() => users.id),
      approvedBy: uuid("approved_by").references(() => users.id),
      leaveType: text("leave_type").notNull(),
      // sick, vacation, emergency, etc.
      startDate: timestamp("start_date", { withTimezone: true }).notNull(),
      endDate: timestamp("end_date", { withTimezone: true }).notNull(),
      reason: text("reason"),
      status: text("status").default("pending"),
      // pending, approved, rejected
      managerNotes: text("manager_notes"),
      approvalDate: timestamp("approval_date", { withTimezone: true }),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
    });
    leavePolicies = pgTable("leave_policies", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id, { onDelete: "cascade" }),
      leaveType: text("leave_type").notNull(),
      // sick, vacation, personal, emergency, family
      displayName: text("display_name").notNull(),
      defaultDays: integer("default_days").notNull(),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
    }, (table) => ({
      uniqueHotelLeaveType: unique().on(table.hotelId, table.leaveType)
    }));
    leaveBalances = pgTable("leave_balances", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      userId: uuid("user_id").references(() => users.id),
      leaveType: text("leave_type").notNull(),
      totalDays: numeric("total_days", { precision: 5, scale: 1 }).notNull(),
      usedDays: numeric("used_days", { precision: 5, scale: 1 }).default("0"),
      remainingDays: numeric("remaining_days", { precision: 5, scale: 1 }).notNull(),
      year: integer("year").notNull(),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
    }, (table) => ({
      uniqueUserLeaveType: unique().on(table.userId, table.leaveType, table.year)
    }));
    notifications = pgTable("notifications", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      userId: uuid("user_id").references(() => users.id),
      type: text("type").notNull(),
      // leave_approved, leave_rejected, etc.
      title: text("title").notNull(),
      message: text("message").notNull(),
      relatedId: uuid("related_id"),
      // ID of related entity (e.g., leave request ID)
      isRead: boolean("is_read").default(false),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
    });
    hotelTaxes = pgTable("hotel_taxes", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      taxType: text("tax_type").notNull(),
      percent: numeric("percent", { precision: 5, scale: 2 }),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
    }, (table) => ({
      uniqueHotelTax: unique().on(table.hotelId, table.taxType)
    }));
    vouchers = pgTable("vouchers", {
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
    vehicleLogs = pgTable("vehicle_logs", {
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
    securityAlerts = pgTable("security_alerts", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      type: text("type").notNull(),
      description: text("description").notNull(),
      vehicleLogId: uuid("vehicle_log_id").references(() => vehicleLogs.id),
      performedBy: uuid("performed_by").references(() => users.id),
      overriddenBy: uuid("overridden_by").references(() => users.id),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
    });
    roomServiceOrders = pgTable("room_service_orders", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      roomId: uuid("room_id").references(() => rooms.id),
      requestedBy: uuid("requested_by").references(() => users.id),
      status: text("status").default("pending"),
      specialInstructions: text("special_instructions"),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
    });
    mealPlans = pgTable("meal_plans", {
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
    mealVouchers = pgTable("meal_vouchers", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id, { onDelete: "cascade" }),
      roomId: uuid("room_id").references(() => rooms.id),
      guestName: text("guest_name").notNull(),
      mealPlanId: uuid("meal_plan_id").references(() => mealPlans.id),
      mealPlanType: text("meal_plan_type").notNull(),
      numberOfPersons: integer("number_of_persons").notNull(),
      voucherDate: timestamp("voucher_date", { withTimezone: true }).notNull(),
      status: text("status").default("unused"),
      usedAt: timestamp("used_at", { withTimezone: true }),
      redeemedBy: uuid("redeemed_by").references(() => users.id),
      notes: text("notes"),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
    });
    roomReservations = pgTable("room_reservations", {
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
      paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }).default("0"),
      specialRequests: text("special_requests"),
      status: text("status").default("pending"),
      createdBy: uuid("created_by").references(() => users.id),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
    });
    roomServiceCharges = pgTable("room_service_charges", {
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
    stockRequests = pgTable("stock_requests", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id, { onDelete: "cascade" }),
      requestedBy: uuid("requested_by").references(() => users.id).notNull(),
      itemId: uuid("item_id").references(() => inventoryItems.id).notNull(),
      quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull(),
      unit: text("unit").notNull(),
      status: text("status").default("pending").notNull(),
      approvedBy: uuid("approved_by").references(() => users.id),
      approvedAt: timestamp("approved_at", { withTimezone: true }),
      deliveredAt: timestamp("delivered_at", { withTimezone: true }),
      department: text("department"),
      notes: text("notes"),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
    });
    servicePackages = pgTable("service_packages", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id, { onDelete: "cascade" }),
      name: text("name").notNull(),
      description: text("description"),
      basePrice: numeric("base_price", { precision: 12, scale: 2 }).notNull(),
      items: jsonb("items").default("[]"),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
    });
    hallBookings = pgTable("hall_bookings", {
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
      foodServices: jsonb("food_services").default("[]"),
      otherServices: jsonb("other_services").default("[]"),
      servicePackages: jsonb("service_packages").default("[]"),
      customServices: text("custom_services"),
      totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
      advancePaid: numeric("advance_paid", { precision: 12, scale: 2 }).default("0"),
      balanceDue: numeric("balance_due", { precision: 12, scale: 2 }).notNull(),
      paymentMethod: text("payment_method"),
      status: text("status").default("quotation").notNull(),
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
    bookingPayments = pgTable("booking_payments", {
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
    restaurantBills = pgTable("restaurant_bills", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      billNumber: text("bill_number").notNull(),
      tableIds: text("table_ids").array().notNull(),
      orderIds: text("order_ids").array().notNull(),
      subtotal: numeric("subtotal", { precision: 14, scale: 2 }).notNull(),
      taxBreakdown: jsonb("tax_breakdown").default("{}"),
      totalTax: numeric("total_tax", { precision: 14, scale: 2 }).default("0"),
      discount: numeric("discount", { precision: 14, scale: 2 }).default("0"),
      voucherId: uuid("voucher_id").references(() => vouchers.id),
      voucherCode: text("voucher_code"),
      tipType: text("tip_type"),
      tipValue: numeric("tip_value", { precision: 12, scale: 2 }).default("0"),
      tipAmount: numeric("tip_amount", { precision: 12, scale: 2 }).default("0"),
      serviceCharge: numeric("service_charge", { precision: 12, scale: 2 }).default("0"),
      grandTotal: numeric("grand_total", { precision: 14, scale: 2 }).notNull(),
      splitMode: text("split_mode"),
      splitDetails: jsonb("split_details"),
      items: jsonb("items").default("[]"),
      status: text("status").default("draft").notNull(),
      amendmentNote: text("amendment_note"),
      originalBillId: uuid("original_bill_id"),
      createdBy: uuid("created_by").references(() => users.id),
      amendedBy: uuid("amended_by").references(() => users.id),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
      amendedAt: timestamp("amended_at", { withTimezone: true }),
      finalizedAt: timestamp("finalized_at", { withTimezone: true })
    });
    billPayments = pgTable("bill_payments", {
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
    hotelRelations = relations(hotels, ({ many }) => ({
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
    userRelations = relations(users, ({ one, many }) => ({
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
    roomRelations = relations(rooms, ({ one, many }) => ({
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
    menuItemRelations = relations(menuItems, ({ one }) => ({
      hotel: one(hotels, {
        fields: [menuItems.hotelId],
        references: [hotels.id]
      }),
      category: one(menuCategories, {
        fields: [menuItems.categoryId],
        references: [menuCategories.id]
      })
    }));
    kotOrderRelations = relations(kotOrders, ({ one, many }) => ({
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
    kotItemRelations = relations(kotItems, ({ one }) => ({
      kot: one(kotOrders, {
        fields: [kotItems.kotId],
        references: [kotOrders.id]
      })
    }));
    taskRelations = relations(tasks, ({ one }) => ({
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
    hallRelations = relations(halls, ({ one, many }) => ({
      hotel: one(hotels, {
        fields: [halls.hotelId],
        references: [hotels.id]
      }),
      bookings: many(hallBookings)
    }));
    hallBookingRelations = relations(hallBookings, ({ one, many }) => ({
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
    servicePackageRelations = relations(servicePackages, ({ one }) => ({
      hotel: one(hotels, {
        fields: [servicePackages.hotelId],
        references: [hotels.id]
      })
    }));
    bookingPaymentRelations = relations(bookingPayments, ({ one }) => ({
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
    restaurantBillRelations = relations(restaurantBills, ({ one, many }) => ({
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
    billPaymentRelations = relations(billPayments, ({ one }) => ({
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
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true
    });
    insertAuditLogSchema = createInsertSchema(auditLogs).omit({
      id: true,
      createdAt: true
    });
    insertHotelSchema = createInsertSchema(hotels).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true
    });
    insertRoomSchema = createInsertSchema(rooms).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true
    });
    insertRoomStatusLogSchema = createInsertSchema(roomStatusLogs).omit({
      id: true,
      createdAt: true
    });
    insertMenuItemSchema = createInsertSchema(menuItems).omit({
      id: true,
      createdAt: true
    }).extend({
      price: z.union([z.string(), z.number()]).transform((val) => String(val)).refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0 && num <= 99999999;
      }, {
        message: "Price must be a non-negative number (max 99,999,999)"
      })
    });
    insertTaskSchema = createInsertSchema(tasks).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      dueDate: z.union([z.string(), z.date(), z.null(), z.undefined()]).transform((val) => {
        if (!val) return null;
        if (val instanceof Date) return val;
        return new Date(val);
      }).optional()
    });
    insertRoomCleaningQueueSchema = createInsertSchema(roomCleaningQueue).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertTransactionSchema = createInsertSchema(transactions).omit({
      id: true,
      createdAt: true,
      deletedAt: true
    }).refine(
      (data) => {
        if (data.txnType && (data.txnType.includes("_in") || data.txnType === "revenue")) {
          return data.paymentMethod && ["cash", "pos", "fonepay"].includes(data.paymentMethod);
        }
        if (data.txnType === "vendor_payment") {
          return data.paymentMethod && ["cash", "cheque", "bank_transfer", "digital_wallet", "pos", "fonepay"].includes(data.paymentMethod);
        }
        return true;
      },
      {
        message: "Invalid payment method for this transaction type",
        path: ["paymentMethod"]
      }
    );
    insertMaintenanceRequestSchema = createInsertSchema(maintenanceRequests).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      approvedAt: true,
      declinedAt: true
    });
    insertMaintenanceStatusHistorySchema = createInsertSchema(maintenanceStatusHistory).omit({
      id: true,
      createdAt: true
    });
    insertVoucherSchema = createInsertSchema(vouchers).omit({
      id: true,
      createdAt: true,
      usedCount: true
    }).extend({
      validFrom: z.string().or(z.date()).transform((val) => val instanceof Date ? val : new Date(val)),
      validUntil: z.string().or(z.date()).transform((val) => val instanceof Date ? val : new Date(val))
    });
    insertRoomTypeSchema = createInsertSchema(roomTypes).omit({
      id: true
    });
    insertHallSchema = createInsertSchema(halls).omit({
      id: true,
      createdAt: true
    });
    insertPoolSchema = createInsertSchema(pools).omit({
      id: true,
      createdAt: true
    });
    insertServiceSchema = createInsertSchema(services).omit({
      id: true
    });
    insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      approvalDate: true
    }).extend({
      startDate: z.string().or(z.date()).transform((val) => val instanceof Date ? val : new Date(val)),
      endDate: z.string().or(z.date()).transform((val) => val instanceof Date ? val : new Date(val))
    });
    insertLeavePolicySchema = createInsertSchema(leavePolicies).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertLeaveBalanceSchema = createInsertSchema(leaveBalances).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      totalDays: z.union([z.string(), z.number()]).transform((val) => String(val)),
      usedDays: z.union([z.string(), z.number()]).transform((val) => String(val)).optional(),
      remainingDays: z.union([z.string(), z.number()]).transform((val) => String(val))
    });
    insertNotificationSchema = createInsertSchema(notifications).omit({
      id: true,
      createdAt: true
    });
    insertWastageSchema = createInsertSchema(wastages).omit({
      id: true,
      createdAt: true
    });
    insertVehicleLogSchema = createInsertSchema(vehicleLogs).omit({
      id: true,
      hotelId: true,
      recordedBy: true,
      checkIn: true
    });
    insertSecurityAlertSchema = createInsertSchema(securityAlerts).omit({
      id: true,
      createdAt: true
    });
    insertMealPlanSchema = createInsertSchema(mealPlans).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      pricePerPerson: z.union([z.string(), z.number()]).transform((val) => String(val)).refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0 && num <= 99999999;
      }, {
        message: "Price per person must be a non-negative number (max 99,999,999)"
      })
    });
    insertMealVoucherSchema = createInsertSchema(mealVouchers).omit({
      id: true,
      createdAt: true
    }).extend({
      voucherDate: z.string().or(z.date()).transform((val) => val instanceof Date ? val : new Date(val))
    });
    insertRoomReservationSchema = createInsertSchema(roomReservations).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      checkInDate: z.string().or(z.date()).transform((val) => val instanceof Date ? val : new Date(val)),
      checkOutDate: z.string().or(z.date()).transform((val) => val instanceof Date ? val : new Date(val))
    });
    insertRoomServiceChargeSchema = createInsertSchema(roomServiceCharges).omit({
      id: true,
      createdAt: true
    }).extend({
      quantity: z.union([z.string(), z.number()]).transform((val) => String(val)),
      unitPrice: z.union([z.string(), z.number()]).transform((val) => String(val)),
      totalCharge: z.union([z.string(), z.number()]).transform((val) => String(val))
    });
    insertVendorSchema = createInsertSchema(vendors).omit({
      id: true,
      createdAt: true
    });
    insertGuestSchema = createInsertSchema(guests).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      currentReservationId: true
    });
    insertStockRequestSchema = createInsertSchema(stockRequests).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      approvedAt: true,
      deliveredAt: true
    }).extend({
      quantity: z.union([z.string(), z.number()]).transform((val) => String(val))
    });
    insertHallBookingSchema = createInsertSchema(hallBookings).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      confirmedAt: true,
      cancelledAt: true
    }).extend({
      bookingStartTime: z.string().or(z.date()).transform((val) => val instanceof Date ? val : new Date(val)),
      bookingEndTime: z.string().or(z.date()).transform((val) => val instanceof Date ? val : new Date(val)),
      numberOfPeople: z.union([z.string(), z.number()]).transform((val) => Number(val)).refine((val) => val >= 1 && val <= 1e5, {
        message: "Number of people must be between 1 and 100,000"
      }),
      hallBasePrice: z.union([z.string(), z.number()]).transform((val) => String(val)).refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0 && num <= 99999999;
      }, {
        message: "Hall base price must be a non-negative number (max 99,999,999)"
      }),
      totalAmount: z.union([z.string(), z.number()]).transform((val) => String(val)).refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0 && num <= 99999999;
      }, {
        message: "Total amount must be a non-negative number (max 99,999,999)"
      }),
      advancePaid: z.union([z.string(), z.number()]).transform((val) => String(val)).refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0 && num <= 99999999;
      }, {
        message: "Advance paid must be a non-negative number (max 99,999,999)"
      }),
      balanceDue: z.union([z.string(), z.number()]).transform((val) => String(val)).refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= -99999999 && num <= 99999999;
      }, {
        message: "Balance due must be a valid number (between -99,999,999 and 99,999,999)"
      })
    });
    insertServicePackageSchema = createInsertSchema(servicePackages).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      basePrice: z.union([z.string(), z.number()]).transform((val) => String(val))
    });
    insertBookingPaymentSchema = createInsertSchema(bookingPayments).omit({
      id: true,
      createdAt: true
    }).extend({
      amount: z.union([z.string(), z.number()]).transform((val) => String(val))
    });
    updateKotItemSchema = z.object({
      status: z.enum(["pending", "approved", "declined", "ready", "served", "completed", "cancelled"]).optional(),
      qty: z.number().int().min(1).optional(),
      declineReason: z.string().optional(),
      inventoryVerified: z.boolean().optional()
    }).refine(
      (data) => !data.status || data.status !== "declined" || data.declineReason && data.declineReason.trim().length >= 10,
      { message: "Decline reason requires minimum 10 characters when declining a KOT item", path: ["declineReason"] }
    ).refine(
      (data) => !data.status || data.status !== "cancelled" || data.declineReason && data.declineReason.trim().length >= 10,
      { message: "Cancellation reason requires minimum 10 characters", path: ["declineReason"] }
    );
    insertAttendanceSchema = createInsertSchema(attendance).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertRestaurantBillSchema = createInsertSchema(restaurantBills).omit({
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
    insertBillPaymentSchema = createInsertSchema(billPayments).omit({
      id: true,
      createdAt: true,
      voidedAt: true
    }).extend({
      amount: z.union([z.string(), z.number()]).transform((val) => String(val))
    });
    checkoutOverrideLogs = pgTable("checkout_override_logs", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      reservationId: uuid("reservation_id").references(() => roomReservations.id),
      balanceDue: numeric("balance_due", { precision: 14, scale: 2 }),
      overriddenBy: uuid("overridden_by").references(() => users.id),
      reason: text("reason"),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
    });
    insertCheckoutOverrideLogSchema = createInsertSchema(checkoutOverrideLogs).omit({
      id: true,
      createdAt: true
    }).extend({
      balanceDue: z.union([z.string(), z.number()]).transform((val) => String(val))
    });
    priceChangeLogs = pgTable("price_change_logs", {
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
    insertPriceChangeLogSchema = createInsertSchema(priceChangeLogs).omit({
      id: true,
      createdAt: true
    }).extend({
      previousPrice: z.union([z.string(), z.number()]).transform((val) => String(val)),
      newPrice: z.union([z.string(), z.number()]).transform((val) => String(val))
    });
    taxChangeLogs = pgTable("tax_change_logs", {
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
    insertTaxChangeLogSchema = createInsertSchema(taxChangeLogs).omit({
      id: true,
      createdAt: true
    }).extend({
      previousPercent: z.union([z.string(), z.number(), z.null()]).transform((val) => val === null ? null : String(val)),
      newPercent: z.union([z.string(), z.number(), z.null()]).transform((val) => val === null ? null : String(val))
    });
  }
});

// server/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
var client, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    client = postgres(process.env.DATABASE_URL);
    db = drizzle(client, { schema: schema_exports });
  }
});

// shared/measurements.ts
var measurements_exports = {};
__export(measurements_exports, {
  CountUnit: () => CountUnit,
  MeasurementCategory: () => MeasurementCategory,
  Unit: () => Unit,
  VolumeUnit: () => VolumeUnit,
  WeightUnit: () => WeightUnit,
  convertToBase: () => convertToBase,
  countUnits: () => countUnits,
  getCategoryForUnit: () => getCategoryForUnit,
  getSupportedUnitsForItem: () => getSupportedUnitsForItem,
  getUnitLabel: () => getUnitLabel,
  recipeIngredientSchema: () => recipeIngredientSchema,
  validateUnitCategory: () => validateUnitCategory,
  volumeUnits: () => volumeUnits,
  weightUnits: () => weightUnits
});
import { z as z2 } from "zod";
function convertToBase(quantity, fromUnit, toUnit, category, conversionProfile) {
  if (fromUnit === toUnit) {
    return quantity;
  }
  if (conversionProfile && conversionProfile[fromUnit]) {
    const factor = conversionProfile[fromUnit];
    return quantity * factor;
  }
  let conversions;
  switch (category) {
    case MeasurementCategory.WEIGHT:
      conversions = weightConversions;
      break;
    case MeasurementCategory.VOLUME:
      conversions = volumeConversions;
      break;
    case MeasurementCategory.COUNT:
      conversions = countConversions;
      break;
    default:
      throw new Error(`Unsupported conversion category: ${category}`);
  }
  if (!conversions[fromUnit] || !conversions[toUnit]) {
    throw new Error(`Cannot convert from ${fromUnit} to ${toUnit}`);
  }
  const baseValue = quantity * conversions[fromUnit];
  return baseValue / conversions[toUnit];
}
function getSupportedUnitsForItem(category, conversionProfile) {
  const customUnits = conversionProfile ? Object.keys(conversionProfile).filter((k) => k !== "baseUnit" && k !== "baseToKg" && k !== "baseToL") : [];
  switch (category) {
    case MeasurementCategory.WEIGHT:
      return [...weightUnits, ...customUnits];
    case MeasurementCategory.VOLUME:
      return [...volumeUnits, ...customUnits];
    case MeasurementCategory.COUNT:
      return [...countUnits, ...customUnits];
    case MeasurementCategory.CUSTOM:
      return customUnits;
    default:
      return customUnits;
  }
}
function validateUnitCategory(unit, category) {
  switch (category) {
    case MeasurementCategory.WEIGHT:
      return weightUnits.includes(unit);
    case MeasurementCategory.VOLUME:
      return volumeUnits.includes(unit);
    case MeasurementCategory.COUNT:
      return countUnits.includes(unit);
    case MeasurementCategory.CUSTOM:
      return true;
    default:
      return false;
  }
}
function getCategoryForUnit(unit) {
  const normalizedUnit = unit.toLowerCase();
  if (weightUnits.includes(normalizedUnit)) return MeasurementCategory.WEIGHT;
  if (volumeUnits.includes(normalizedUnit)) return MeasurementCategory.VOLUME;
  if (countUnits.includes(normalizedUnit)) return MeasurementCategory.COUNT;
  const weightAliases = ["kilogram", "gram", "milligram", "pound", "ounce", "ton", "tonne"];
  const volumeAliases = ["liter", "litre", "milliliter", "millilitre", "gallon", "quart", "pint", "teaspoon", "tablespoon"];
  const countAliases = ["unit", "item", "box", "bottle", "can", "bag"];
  if (weightAliases.some((alias) => normalizedUnit.includes(alias))) return MeasurementCategory.WEIGHT;
  if (volumeAliases.some((alias) => normalizedUnit.includes(alias))) return MeasurementCategory.VOLUME;
  if (countAliases.some((alias) => normalizedUnit.includes(alias))) return MeasurementCategory.COUNT;
  return MeasurementCategory.COUNT;
}
function getUnitLabel(unit) {
  const labels = {
    mg: "Milligrams",
    g: "Grams",
    kg: "Kilograms",
    oz: "Ounces",
    lb: "Pounds",
    ml: "Milliliters",
    L: "Liters",
    tsp: "Teaspoons",
    tbsp: "Tablespoons",
    cup: "Cups",
    fl_oz: "Fluid Ounces",
    piece: "Pieces",
    dozen: "Dozen",
    pack: "Packs"
  };
  return labels[unit] || unit;
}
var MeasurementCategory, WeightUnit, VolumeUnit, CountUnit, Unit, weightUnits, volumeUnits, countUnits, weightConversions, volumeConversions, countConversions, recipeIngredientSchema;
var init_measurements = __esm({
  "shared/measurements.ts"() {
    "use strict";
    MeasurementCategory = {
      WEIGHT: "weight",
      VOLUME: "volume",
      COUNT: "count",
      CUSTOM: "custom"
    };
    WeightUnit = {
      MG: "mg",
      G: "g",
      KG: "kg",
      OZ: "oz",
      LB: "lb"
    };
    VolumeUnit = {
      ML: "ml",
      L: "L",
      TSP: "tsp",
      TBSP: "tbsp",
      CUP: "cup",
      FL_OZ: "fl_oz"
    };
    CountUnit = {
      PIECE: "piece",
      DOZEN: "dozen",
      PACK: "pack"
    };
    Unit = {
      ...WeightUnit,
      ...VolumeUnit,
      ...CountUnit
    };
    weightUnits = Object.values(WeightUnit);
    volumeUnits = Object.values(VolumeUnit);
    countUnits = Object.values(CountUnit);
    weightConversions = {
      mg: 1e-6,
      g: 1e-3,
      kg: 1,
      oz: 0.0283495,
      lb: 0.453592
    };
    volumeConversions = {
      ml: 1e-3,
      L: 1,
      tsp: 492892e-8,
      tbsp: 0.0147868,
      cup: 0.236588,
      fl_oz: 0.0295735
    };
    countConversions = {
      piece: 1,
      dozen: 12,
      pack: 1
    };
    recipeIngredientSchema = z2.object({
      inventoryItemId: z2.string().uuid(),
      quantity: z2.number().positive(),
      unit: z2.string(),
      customFactor: z2.number().positive().optional()
    });
  }
});

// server/storage.ts
import { eq, and, or, not, isNull, desc, asc, sql as sql2, gte, lte, gt, lt, inArray } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
var PostgresSessionStore, DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    PostgresSessionStore = connectPg(session);
    DatabaseStorage = class {
      sessionStore;
      constructor() {
        this.sessionStore = new PostgresSessionStore({
          conString: process.env.DATABASE_URL,
          createTableIfMissing: true
        });
      }
      // User operations
      async getUser(id) {
        const [result] = await db.select({
          id: users.id,
          hotelId: users.hotelId,
          roleId: users.roleId,
          username: users.username,
          fullName: users.fullName,
          email: users.email,
          phone: users.phone,
          address: users.address,
          passwordHash: users.passwordHash,
          isActive: users.isActive,
          isOnline: users.isOnline,
          lastLogin: users.lastLogin,
          lastLogout: users.lastLogout,
          createdBy: users.createdBy,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          deletedAt: users.deletedAt,
          verification: users.verification,
          role: roles
        }).from(users).leftJoin(roles, eq(users.roleId, roles.id)).where(and(eq(users.id, id), isNull(users.deletedAt)));
        if (!result) return void 0;
        return {
          ...result,
          role: result.role || void 0
        };
      }
      async getUserByUsername(username) {
        const [result] = await db.select({
          id: users.id,
          hotelId: users.hotelId,
          roleId: users.roleId,
          username: users.username,
          fullName: users.fullName,
          email: users.email,
          phone: users.phone,
          address: users.address,
          passwordHash: users.passwordHash,
          isActive: users.isActive,
          isOnline: users.isOnline,
          lastLogin: users.lastLogin,
          lastLogout: users.lastLogout,
          createdBy: users.createdBy,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          deletedAt: users.deletedAt,
          verification: users.verification,
          role: roles
        }).from(users).leftJoin(roles, eq(users.roleId, roles.id)).where(and(eq(users.username, username), isNull(users.deletedAt)));
        if (!result) return void 0;
        return {
          ...result,
          role: result.role || void 0
        };
      }
      async getUsersByHotel(hotelId) {
        const results = await db.select({
          id: users.id,
          hotelId: users.hotelId,
          roleId: users.roleId,
          username: users.username,
          fullName: users.fullName,
          email: users.email,
          phone: users.phone,
          address: users.address,
          passwordHash: users.passwordHash,
          isActive: users.isActive,
          isOnline: users.isOnline,
          lastLogin: users.lastLogin,
          lastLogout: users.lastLogout,
          createdBy: users.createdBy,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          deletedAt: users.deletedAt,
          verification: users.verification,
          role: roles
        }).from(users).leftJoin(roles, eq(users.roleId, roles.id)).where(and(eq(users.hotelId, hotelId), isNull(users.deletedAt))).orderBy(asc(users.username));
        return results.map((result) => ({
          ...result,
          role: result.role || void 0
        }));
      }
      async getUsersByRole(roleId) {
        return await db.select().from(users).where(and(eq(users.roleId, roleId), isNull(users.deletedAt))).orderBy(asc(users.username));
      }
      async createUser(insertUser) {
        const [user] = await db.insert(users).values(insertUser).returning();
        return user;
      }
      async updateUser(id, userData) {
        const currentUser = await this.getUser(id);
        if (!currentUser) {
          throw new Error("User not found");
        }
        if ("isOnline" in userData && userData.isOnline === true && !currentUser.isActive) {
          throw new Error("Cannot set online status for deactivated user");
        }
        const [user] = await db.update(users).set({ ...userData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
        return user;
      }
      async updateUserSecure(id, userData, options) {
        return this.updateUser(id, userData);
      }
      async deleteUser(id) {
        await db.update(users).set({ deletedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id));
      }
      async updateUserOnlineStatus(id, isOnline) {
        if (isOnline) {
          const user = await this.getUser(id);
          if (!user || !user.isActive) {
            throw new Error("Cannot set online status for deactivated user");
          }
        }
        await db.update(users).set({
          isOnline,
          lastLogin: isOnline ? /* @__PURE__ */ new Date() : void 0,
          lastLogout: !isOnline ? /* @__PURE__ */ new Date() : void 0
        }).where(eq(users.id, id));
      }
      // Hotel operations
      async getHotel(id) {
        const [hotel] = await db.select().from(hotels).where(and(eq(hotels.id, id), isNull(hotels.deletedAt)));
        return hotel || void 0;
      }
      async getAllHotels() {
        return await db.select().from(hotels).where(isNull(hotels.deletedAt)).orderBy(asc(hotels.name));
      }
      async createHotel(hotelData) {
        const [hotel] = await db.insert(hotels).values(hotelData).returning();
        return hotel;
      }
      async updateHotel(id, hotelData) {
        const [hotel] = await db.update(hotels).set({ ...hotelData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(hotels.id, id)).returning();
        return hotel;
      }
      async deleteHotel(id) {
        await db.update(hotels).set({ deletedAt: /* @__PURE__ */ new Date() }).where(eq(hotels.id, id));
      }
      // Role operations
      async getAllRoles() {
        return await db.select().from(roles).orderBy(asc(roles.name));
      }
      async getRoleByName(name) {
        const [role] = await db.select().from(roles).where(eq(roles.name, name));
        return role || void 0;
      }
      async getRole(id) {
        const [role] = await db.select().from(roles).where(eq(roles.id, id));
        return role || void 0;
      }
      // Room operations
      async getRoomsByHotel(hotelId) {
        const results = await db.select({
          id: rooms.id,
          hotelId: rooms.hotelId,
          roomNumber: rooms.roomNumber,
          roomTypeId: rooms.roomTypeId,
          isOccupied: rooms.isOccupied,
          occupantDetails: rooms.occupantDetails,
          currentReservationId: rooms.currentReservationId,
          status: rooms.status,
          createdAt: rooms.createdAt,
          updatedAt: rooms.updatedAt,
          deletedAt: rooms.deletedAt,
          roomType: roomTypes
        }).from(rooms).leftJoin(roomTypes, eq(rooms.roomTypeId, roomTypes.id)).where(and(eq(rooms.hotelId, hotelId), isNull(rooms.deletedAt))).orderBy(asc(rooms.roomNumber));
        return results;
      }
      async getRoom(id) {
        const [room] = await db.select().from(rooms).where(and(eq(rooms.id, id), isNull(rooms.deletedAt)));
        return room || void 0;
      }
      async createRoom(roomData) {
        const [room] = await db.insert(rooms).values(roomData).returning();
        return room;
      }
      async updateRoom(id, roomData) {
        const [room] = await db.update(rooms).set({ ...roomData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(rooms.id, id)).returning();
        return room;
      }
      async deleteRoom(id) {
        await db.update(rooms).set({ deletedAt: /* @__PURE__ */ new Date() }).where(eq(rooms.id, id));
      }
      async createRoomStatusLog(logData) {
        const [log2] = await db.insert(roomStatusLogs).values(logData).returning();
        return log2;
      }
      // Room reservation operations
      async createRoomReservation(reservationData) {
        return await db.transaction(async (tx) => {
          const { roomId, checkInDate, checkOutDate } = reservationData;
          const [room] = await tx.select().from(rooms).where(eq(rooms.id, roomId)).for("update");
          if (!room) {
            throw new Error("Room not found");
          }
          const overlapping = await tx.select().from(roomReservations).where(
            and(
              eq(roomReservations.roomId, roomId),
              or(
                eq(roomReservations.status, "confirmed"),
                eq(roomReservations.status, "checked_in")
              ),
              // Date overlap check
              or(
                and(
                  lte(roomReservations.checkInDate, checkInDate),
                  gt(roomReservations.checkOutDate, checkInDate)
                ),
                and(
                  lt(roomReservations.checkInDate, checkOutDate),
                  gte(roomReservations.checkOutDate, checkOutDate)
                ),
                and(
                  gte(roomReservations.checkInDate, checkInDate),
                  lte(roomReservations.checkOutDate, checkOutDate)
                )
              )
            )
          ).limit(1);
          if (overlapping.length > 0) {
            throw new Error("Room is already booked for selected dates");
          }
          const [reservation] = await tx.insert(roomReservations).values(reservationData).returning();
          return reservation;
        });
      }
      async getRoomReservationsByHotel(hotelId) {
        const reservations = await db.select().from(roomReservations).where(eq(roomReservations.hotelId, hotelId));
        return reservations;
      }
      async getRoomReservation(id) {
        const [reservation] = await db.select().from(roomReservations).where(eq(roomReservations.id, id));
        return reservation;
      }
      async updateRoomReservation(id, data) {
        const [updated] = await db.update(roomReservations).set({
          ...data,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(roomReservations.id, id)).returning();
        if (!updated) {
          throw new Error("Reservation not found");
        }
        return updated;
      }
      async createCheckoutOverrideLog(log2) {
        const [createdLog] = await db.insert(checkoutOverrideLogs).values(log2).returning();
        return createdLog;
      }
      // Room service charge operations
      async createRoomServiceCharge(chargeData) {
        const [charge] = await db.insert(roomServiceCharges).values(chargeData).returning();
        return charge;
      }
      async getRoomServiceCharges(reservationId) {
        const charges = await db.select().from(roomServiceCharges).where(eq(roomServiceCharges.reservationId, reservationId)).orderBy(desc(roomServiceCharges.createdAt));
        return charges;
      }
      async getAllRoomServiceChargesByHotel(hotelId) {
        const charges = await db.select().from(roomServiceCharges).where(eq(roomServiceCharges.hotelId, hotelId)).orderBy(desc(roomServiceCharges.createdAt));
        return charges;
      }
      async deleteRoomServiceCharge(id) {
        await db.delete(roomServiceCharges).where(eq(roomServiceCharges.id, id));
      }
      async checkRoomAvailability(hotelId, roomId, checkInDate, checkOutDate, excludeReservationId) {
        const overlapping = await db.select().from(roomReservations).where(
          and(
            eq(roomReservations.roomId, roomId),
            or(
              eq(roomReservations.status, "confirmed"),
              eq(roomReservations.status, "checked_in")
            ),
            or(
              and(
                lte(roomReservations.checkInDate, checkInDate),
                gt(roomReservations.checkOutDate, checkInDate)
              ),
              and(
                lt(roomReservations.checkInDate, checkOutDate),
                gte(roomReservations.checkOutDate, checkOutDate)
              ),
              and(
                gte(roomReservations.checkInDate, checkInDate),
                lte(roomReservations.checkOutDate, checkOutDate)
              )
            )
          )
        ).limit(1);
        return overlapping.length === 0;
      }
      async getReservationsByDateRange(hotelId, startDate, endDate) {
        const { and: and4, or: or2, lte: lte2, gte: gte2 } = await import("drizzle-orm");
        const reservations = await db.select().from(roomReservations).where(
          and4(
            eq(roomReservations.hotelId, hotelId),
            or2(
              and4(
                lte2(roomReservations.checkInDate, endDate),
                gte2(roomReservations.checkOutDate, startDate)
              )
            )
          )
        );
        return reservations;
      }
      async checkInGuest(reservationId) {
        const { and: and4 } = await import("drizzle-orm");
        const [reservation] = await db.select().from(roomReservations).where(eq(roomReservations.id, reservationId));
        if (!reservation) {
          throw new Error("Reservation not found");
        }
        if (reservation.status === "checked-in") {
          throw new Error("Guest is already checked in");
        }
        if (reservation.status === "checked-out") {
          throw new Error("This reservation is already completed");
        }
        if (reservation.status === "cancelled") {
          throw new Error("This reservation has been cancelled");
        }
        await db.update(rooms).set({
          status: "occupied",
          isOccupied: true,
          currentReservationId: reservationId,
          occupantDetails: {
            name: reservation.guestName,
            email: reservation.guestEmail,
            phone: reservation.guestPhone,
            checkInDate: reservation.checkInDate,
            checkOutDate: reservation.checkOutDate,
            numberOfPersons: reservation.numberOfPersons,
            reservationId
          },
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(rooms.id, reservation.roomId));
        if (reservation.guestId) {
          await db.update(guests).set({
            currentReservationId: reservationId,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(guests.id, reservation.guestId));
        }
        const [updatedReservation] = await db.update(roomReservations).set({
          status: "checked_in",
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(roomReservations.id, reservationId)).returning();
        return updatedReservation;
      }
      async checkOutGuest(reservationId) {
        const [reservation] = await db.select().from(roomReservations).where(eq(roomReservations.id, reservationId));
        if (!reservation) {
          throw new Error("Reservation not found");
        }
        if (reservation.status === "checked_out") {
          throw new Error("Guest is already checked out");
        }
        if (reservation.status !== "checked_in") {
          throw new Error("Guest must be checked in before checkout");
        }
        const [room] = await db.select().from(rooms).where(eq(rooms.id, reservation.roomId));
        await db.update(rooms).set({
          status: "available",
          isOccupied: false,
          currentReservationId: null,
          occupantDetails: null,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(rooms.id, reservation.roomId));
        if (reservation.guestId) {
          await db.update(guests).set({
            currentReservationId: null,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(guests.id, reservation.guestId));
        }
        await db.insert(roomCleaningQueue).values({
          hotelId: reservation.hotelId,
          roomId: reservation.roomId,
          roomNumber: room?.roomNumber || "Unknown",
          guestName: reservation.guestName,
          guestId: reservation.guestId,
          checkoutAt: /* @__PURE__ */ new Date(),
          status: "pending"
        });
        const [updatedReservation] = await db.update(roomReservations).set({
          status: "checked-out",
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(roomReservations.id, reservationId)).returning();
        return updatedReservation;
      }
      // Menu operations
      async getMenuItemsByHotel(hotelId) {
        const items = await db.select({
          id: menuItems.id,
          hotelId: menuItems.hotelId,
          categoryId: menuItems.categoryId,
          name: menuItems.name,
          price: menuItems.price,
          description: menuItems.description,
          active: menuItems.active,
          recipe: menuItems.recipe,
          createdAt: menuItems.createdAt,
          category: {
            id: menuCategories.id,
            name: menuCategories.name,
            hotelId: menuCategories.hotelId
          }
        }).from(menuItems).leftJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id)).where(eq(menuItems.hotelId, hotelId)).orderBy(asc(menuItems.name));
        return items;
      }
      async getMenuCategoriesByHotel(hotelId) {
        return await db.select().from(menuCategories).where(eq(menuCategories.hotelId, hotelId)).orderBy(asc(menuCategories.name));
      }
      async createMenuItem(itemData) {
        const [item] = await db.insert(menuItems).values(itemData).returning();
        return item;
      }
      async updateMenuItem(id, itemData) {
        const [item] = await db.update(menuItems).set(itemData).where(eq(menuItems.id, id)).returning();
        return item;
      }
      async deleteMenuItem(id) {
        await db.update(menuItems).set({ active: false }).where(eq(menuItems.id, id));
      }
      // Menu category operations
      async createMenuCategory(category) {
        const [newCategory] = await db.insert(menuCategories).values(category).returning();
        return newCategory;
      }
      async updateMenuCategory(id, category) {
        const [updated] = await db.update(menuCategories).set(category).where(eq(menuCategories.id, id)).returning();
        return updated;
      }
      async deleteMenuCategory(id) {
        await db.delete(menuCategories).where(eq(menuCategories.id, id));
      }
      // Task operations
      async getTasksByUser(userId) {
        return await db.select().from(tasks).where(eq(tasks.assignedTo, userId)).orderBy(desc(tasks.createdAt));
      }
      async getTasksByHotel(hotelId) {
        return await db.select().from(tasks).where(eq(tasks.hotelId, hotelId)).orderBy(desc(tasks.createdAt));
      }
      async createTask(taskData) {
        const [task] = await db.insert(tasks).values(taskData).returning();
        return task;
      }
      async updateTask(id, taskData) {
        const [task] = await db.update(tasks).set({ ...taskData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(tasks.id, id)).returning();
        return task;
      }
      async deleteTask(id) {
        await db.delete(tasks).where(eq(tasks.id, id));
      }
      // Room Cleaning Queue operations
      async getRoomCleaningQueueByHotel(hotelId) {
        return await db.select().from(roomCleaningQueue).where(eq(roomCleaningQueue.hotelId, hotelId)).orderBy(desc(roomCleaningQueue.checkoutAt));
      }
      async createRoomCleaningQueue(queueData) {
        const [queue] = await db.insert(roomCleaningQueue).values(queueData).returning();
        return queue;
      }
      async updateRoomCleaningQueue(id, queueData) {
        const [queue] = await db.update(roomCleaningQueue).set({ ...queueData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(roomCleaningQueue.id, id)).returning();
        return queue;
      }
      // Transaction operations
      async getTransactionsByHotel(hotelId) {
        const results = await db.select({
          id: transactions.id,
          hotelId: transactions.hotelId,
          txnType: transactions.txnType,
          amount: transactions.amount,
          currency: transactions.currency,
          paymentMethod: transactions.paymentMethod,
          vendorId: transactions.vendorId,
          purpose: transactions.purpose,
          reference: transactions.reference,
          details: transactions.details,
          createdBy: transactions.createdBy,
          createdAt: transactions.createdAt,
          deletedAt: transactions.deletedAt,
          isVoided: transactions.isVoided,
          voidedBy: transactions.voidedBy,
          voidedAt: transactions.voidedAt,
          voidReason: transactions.voidReason,
          creator: {
            id: users.id,
            username: users.username,
            role: roles.name
          }
        }).from(transactions).leftJoin(users, eq(transactions.createdBy, users.id)).leftJoin(roles, eq(users.roleId, roles.id)).where(and(eq(transactions.hotelId, hotelId), isNull(transactions.deletedAt))).orderBy(desc(transactions.createdAt));
        return results;
      }
      async createTransaction(transactionData) {
        const [transaction] = await db.insert(transactions).values(transactionData).returning();
        return transaction;
      }
      async getTransaction(id) {
        const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
        return transaction;
      }
      async updateTransaction(id, transactionData) {
        const [transaction] = await db.update(transactions).set(transactionData).where(eq(transactions.id, id)).returning();
        return transaction;
      }
      async voidTransaction(id, voidedBy, reason) {
        const [voided] = await db.update(transactions).set({
          isVoided: true,
          voidedBy,
          voidedAt: /* @__PURE__ */ new Date(),
          voidReason: reason
        }).where(eq(transactions.id, id)).returning();
        return voided;
      }
      // Maintenance operations
      async getMaintenanceRequestsByHotel(hotelId) {
        const results = await db.select({
          id: maintenanceRequests.id,
          hotelId: maintenanceRequests.hotelId,
          title: maintenanceRequests.title,
          location: maintenanceRequests.location,
          description: maintenanceRequests.description,
          photo: maintenanceRequests.photo,
          priority: maintenanceRequests.priority,
          status: maintenanceRequests.status,
          reportedBy: maintenanceRequests.reportedBy,
          assignedTo: maintenanceRequests.assignedTo,
          resolvedAt: maintenanceRequests.resolvedAt,
          createdAt: maintenanceRequests.createdAt,
          updatedAt: maintenanceRequests.updatedAt,
          reportedById: users.id,
          reportedByUsername: users.username,
          reportedByRoleId: roles.id,
          reportedByRoleName: roles.name
        }).from(maintenanceRequests).leftJoin(users, eq(maintenanceRequests.reportedBy, users.id)).leftJoin(roles, eq(users.roleId, roles.id)).where(eq(maintenanceRequests.hotelId, hotelId)).orderBy(desc(maintenanceRequests.createdAt));
        const assigneeIds = Array.from(new Set(results.map((r) => r.assignedTo).filter(Boolean)));
        const assignees = assigneeIds.length > 0 ? await db.select({
          id: users.id,
          username: users.username,
          roleId: roles.id,
          roleName: roles.name
        }).from(users).leftJoin(roles, eq(users.roleId, roles.id)).where(inArray(users.id, assigneeIds)) : [];
        const assigneeMap = new Map(
          assignees.map((a) => [a.id, {
            id: a.id,
            username: a.username,
            role: a.roleId ? { id: a.roleId, name: a.roleName } : null
          }])
        );
        return results.map((result) => ({
          id: result.id,
          hotelId: result.hotelId,
          title: result.title,
          location: result.location,
          description: result.description,
          photo: result.photo,
          priority: result.priority,
          status: result.status,
          resolvedAt: result.resolvedAt,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
          reportedBy: result.reportedById ? {
            id: result.reportedById,
            username: result.reportedByUsername,
            role: result.reportedByRoleId ? {
              id: result.reportedByRoleId,
              name: result.reportedByRoleName
            } : null
          } : null,
          assignedTo: result.assignedTo ? assigneeMap.get(result.assignedTo) || null : null
        }));
      }
      async createMaintenanceRequest(requestData) {
        const [request] = await db.insert(maintenanceRequests).values(requestData).returning();
        return request;
      }
      async updateMaintenanceRequest(id, requestData) {
        const [request] = await db.update(maintenanceRequests).set({ ...requestData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(maintenanceRequests.id, id)).returning();
        return request;
      }
      async getMaintenanceRequest(id) {
        const [request] = await db.select().from(maintenanceRequests).where(eq(maintenanceRequests.id, id));
        return request;
      }
      // KOT operations
      async getKotOrdersByHotel(hotelId) {
        const orders = await db.select().from(kotOrders).where(eq(kotOrders.hotelId, hotelId)).orderBy(desc(kotOrders.createdAt));
        const ordersWithItems = await Promise.all(
          orders.map(async (order) => {
            const itemResults = await db.select({
              itemId: kotItems.id,
              itemKotId: kotItems.kotId,
              itemMenuItemId: kotItems.menuItemId,
              itemQty: kotItems.qty,
              itemNotes: kotItems.description,
              // Changed from .notes to .description to match schema
              itemStatus: kotItems.status,
              itemDeclineReason: kotItems.declineReason,
              menuItemId: menuItems.id,
              menuItemName: menuItems.name,
              menuItemPrice: menuItems.price,
              menuItemCategory: menuItems.categoryId
              // Reading categoryId from DB but aliasing as category for API contract
            }).from(kotItems).leftJoin(menuItems, eq(kotItems.menuItemId, menuItems.id)).where(eq(kotItems.kotId, order.id));
            const items = itemResults.map((row) => ({
              id: row.itemId,
              kotId: row.itemKotId,
              menuItemId: row.itemMenuItemId,
              qty: row.itemQty,
              notes: row.itemNotes,
              status: row.itemStatus,
              declineReason: row.itemDeclineReason,
              menuItem: row.menuItemId ? {
                id: row.menuItemId,
                name: row.menuItemName,
                price: row.menuItemPrice,
                category: row.menuItemCategory
                // Keeping original field name for API contract
              } : null
            }));
            return {
              ...order,
              items
            };
          })
        );
        return ordersWithItems;
      }
      async getKotItems(kotId) {
        return await db.select().from(kotItems).where(eq(kotItems.kotId, kotId)).orderBy(asc(kotItems.createdAt));
      }
      async getKotItemById(id) {
        const [item] = await db.select().from(kotItems).where(eq(kotItems.id, id)).limit(1);
        return item;
      }
      async getKotOrderById(id) {
        const [order] = await db.select().from(kotOrders).where(eq(kotOrders.id, id)).limit(1);
        return order;
      }
      async createKotOrder(kotData) {
        const [kot] = await db.insert(kotOrders).values(kotData).returning();
        return kot;
      }
      async updateKotOrder(id, kotData) {
        const [kot] = await db.update(kotOrders).set({ ...kotData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(kotOrders.id, id)).returning();
        return kot;
      }
      async updateKotItem(id, itemData) {
        const [item] = await db.update(kotItems).set(itemData).where(eq(kotItems.id, id)).returning();
        return item;
      }
      async createKotAuditLog(log2) {
        const [auditLog] = await db.insert(kotAuditLogs).values({
          kotItemId: log2.kotItemId,
          action: log2.action,
          performedBy: log2.performedBy,
          reason: log2.reason,
          previousStatus: log2.previousStatus,
          newStatus: log2.newStatus
        }).returning();
        return auditLog;
      }
      async updateKotOrderStatus(kotOrderId) {
        try {
          const items = await this.getKotItems(kotOrderId);
          if (items.length === 0) {
            return;
          }
          const statusCounts = items.reduce((acc, item) => {
            const status = item.status || "pending";
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          }, {});
          let newOrderStatus = "open";
          if (statusCounts["declined"] && statusCounts["declined"] > 0) {
            newOrderStatus = "open";
          } else if (items.every((item) => item.status === "served")) {
            newOrderStatus = "completed";
          } else if (items.every((item) => item.status === "ready")) {
            newOrderStatus = "ready";
          } else if (items.every((item) => item.status === "approved" || item.status === "ready" || item.status === "served")) {
            newOrderStatus = "in_progress";
          } else {
            newOrderStatus = "open";
          }
          await db.update(kotOrders).set({ status: newOrderStatus, updatedAt: /* @__PURE__ */ new Date() }).where(eq(kotOrders.id, kotOrderId));
          console.log(`KOT Order ${kotOrderId} status updated to: ${newOrderStatus}`);
        } catch (error) {
          console.error(`Failed to update KOT order status for ${kotOrderId}:`, error);
        }
      }
      async deductInventoryForKotItem(kotItemId) {
        const kotItem = await this.getKotItemById(kotItemId);
        if (!kotItem || !kotItem.menuItemId) {
          return;
        }
        if (kotItem.inventoryUsage) {
          console.log("Inventory already deducted for this KOT item");
          return;
        }
        const menuItem = await db.query.menuItems.findFirst({
          where: (menuItemsTable, { eq: eq4 }) => eq4(menuItemsTable.id, kotItem.menuItemId)
        });
        const recipe = menuItem?.recipe;
        if (!recipe?.ingredients || !Array.isArray(recipe.ingredients)) {
          return;
        }
        const ingredients = recipe.ingredients;
        const usageRecords = [];
        for (const ingredient of ingredients) {
          if (ingredient.inventoryItemId && ingredient.quantity) {
            const inventoryItem = await db.query.inventoryItems.findFirst({
              where: (inventoryItemsTable, { eq: eq4 }) => eq4(inventoryItemsTable.id, ingredient.inventoryItemId)
            });
            if (inventoryItem) {
              let quantityInBaseUnit = ingredient.quantity;
              if (ingredient.unit && ingredient.unit !== inventoryItem.baseUnit) {
                const { convertToBase: convertToBase2, MeasurementCategory: MeasurementCategory2 } = await Promise.resolve().then(() => (init_measurements(), measurements_exports));
                const category = inventoryItem.measurementCategory || "weight";
                const conversionProfile = inventoryItem.conversionProfile;
                try {
                  quantityInBaseUnit = convertToBase2(
                    ingredient.quantity,
                    ingredient.unit,
                    inventoryItem.baseUnit || "kg",
                    category,
                    conversionProfile
                  );
                } catch (error) {
                  console.error(`Unit conversion error for ${inventoryItem.name}:`, error);
                }
              }
              const totalQuantityToDeduct = quantityInBaseUnit * (kotItem.qty || 1);
              const currentStock = Number(inventoryItem.baseStockQty || inventoryItem.stockQty || 0);
              const newQuantity = currentStock - totalQuantityToDeduct;
              await db.update(inventoryItems).set({
                baseStockQty: String(newQuantity),
                stockQty: String(newQuantity),
                updatedAt: /* @__PURE__ */ new Date()
              }).where(eq(inventoryItems.id, ingredient.inventoryItemId));
              usageRecords.push({
                inventoryItemId: ingredient.inventoryItemId,
                inventoryItemName: inventoryItem.name,
                quantityUsed: totalQuantityToDeduct,
                originalQuantity: ingredient.quantity,
                originalUnit: ingredient.unit || inventoryItem.baseUnit,
                unit: inventoryItem.baseUnit
              });
            }
          }
        }
        if (usageRecords.length > 0) {
          await db.update(kotItems).set({
            inventoryUsage: { usedIngredients: usageRecords }
          }).where(eq(kotItems.id, kotItemId));
        }
      }
      // Wastage operations
      async createWastage(wastageData) {
        const inventoryItem = await this.getInventoryItem(wastageData.itemId);
        if (!inventoryItem) {
          throw new Error("Inventory item not found");
        }
        const wastageQty = Number(wastageData.qty);
        if (!Number.isFinite(wastageQty) || wastageQty <= 0) {
          throw new Error("Quantity must be a positive number");
        }
        const wastageUnit = wastageData.unit || inventoryItem.baseUnit;
        const baseUnit = inventoryItem.baseUnit || inventoryItem.unit;
        const category = inventoryItem.measurementCategory || "weight";
        const conversionProfile = inventoryItem.conversionProfile;
        let wastageQtyInBaseUnits = wastageQty;
        if (wastageUnit !== baseUnit) {
          const { convertToBase: convertToBase2 } = await Promise.resolve().then(() => (init_measurements(), measurements_exports));
          try {
            wastageQtyInBaseUnits = convertToBase2(
              wastageQty,
              wastageUnit,
              baseUnit,
              category,
              conversionProfile
            );
          } catch (error) {
            console.error(`Unit conversion error for ${inventoryItem.name}:`, error);
            throw new Error(`Cannot convert from ${wastageUnit} to ${baseUnit}`);
          }
        }
        const currentStock = Number(inventoryItem.baseStockQty || inventoryItem.stockQty || 0);
        if (wastageQtyInBaseUnits > currentStock) {
          throw new Error(`Insufficient stock. Current stock: ${currentStock} ${baseUnit}, requested wastage: ${wastageQty} ${wastageUnit} (${wastageQtyInBaseUnits.toFixed(3)} ${baseUnit})`);
        }
        if (wastageData.status === "approved") {
          const newQuantity = currentStock - wastageQtyInBaseUnits;
          await db.update(inventoryItems).set({
            baseStockQty: String(newQuantity),
            stockQty: String(newQuantity),
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(inventoryItems.id, wastageData.itemId));
          await db.insert(inventoryConsumptions).values({
            hotelId: wastageData.hotelId,
            itemId: wastageData.itemId,
            qty: String(wastageQtyInBaseUnits),
            unit: baseUnit,
            reason: `Wastage: ${wastageData.reason}`,
            referenceEntity: "wastage",
            createdBy: wastageData.recordedBy
          });
          await db.insert(inventoryTransactions).values({
            hotelId: wastageData.hotelId,
            itemId: wastageData.itemId,
            transactionType: "wastage",
            qtyBase: String(wastageQtyInBaseUnits),
            notes: wastageData.reason,
            recordedBy: wastageData.recordedBy
          });
        }
        const [wastage] = await db.insert(wastages).values({
          ...wastageData,
          unit: wastageUnit
        }).returning();
        return wastage;
      }
      async getWastagesByHotel(hotelId) {
        return db.select().from(wastages).where(eq(wastages.hotelId, hotelId)).orderBy(desc(wastages.createdAt));
      }
      async getWastage(id) {
        const [wastage] = await db.select().from(wastages).where(eq(wastages.id, id));
        return wastage;
      }
      async approveWastage(id, approvedBy) {
        const wastage = await this.getWastage(id);
        if (!wastage) {
          throw new Error("Wastage not found");
        }
        const inventoryItem = await this.getInventoryItem(wastage.itemId);
        if (!inventoryItem) {
          throw new Error("Inventory item not found");
        }
        const wastageQty = Number(wastage.qty);
        if (!Number.isFinite(wastageQty) || wastageQty <= 0) {
          throw new Error("Quantity must be a positive number");
        }
        const wastageUnit = wastage.unit || inventoryItem.baseUnit;
        const baseUnit = inventoryItem.baseUnit || inventoryItem.unit;
        const category = inventoryItem.measurementCategory || "weight";
        const conversionProfile = inventoryItem.conversionProfile;
        let wastageQtyInBaseUnits = wastageQty;
        if (wastageUnit !== baseUnit) {
          const { convertToBase: convertToBase2 } = await Promise.resolve().then(() => (init_measurements(), measurements_exports));
          try {
            wastageQtyInBaseUnits = convertToBase2(
              wastageQty,
              wastageUnit,
              baseUnit,
              category,
              conversionProfile
            );
          } catch (error) {
            console.error(`Unit conversion error:`, error);
            throw new Error(`Cannot convert from ${wastageUnit} to ${baseUnit}`);
          }
        }
        const currentStock = Number(inventoryItem.baseStockQty || inventoryItem.stockQty || 0);
        if (wastageQtyInBaseUnits > currentStock) {
          throw new Error(`Insufficient stock. Current stock: ${currentStock} ${baseUnit}, requested wastage: ${wastageQty} ${wastageUnit}`);
        }
        const newQuantity = currentStock - wastageQtyInBaseUnits;
        await db.update(inventoryItems).set({
          baseStockQty: String(newQuantity),
          stockQty: String(newQuantity),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(inventoryItems.id, wastage.itemId));
        await db.insert(inventoryConsumptions).values({
          hotelId: wastage.hotelId,
          itemId: wastage.itemId,
          qty: String(wastageQtyInBaseUnits),
          unit: baseUnit,
          reason: `Wastage: ${wastage.reason}`,
          referenceEntity: "wastage",
          createdBy: wastage.recordedBy
        });
        await db.insert(inventoryTransactions).values({
          hotelId: wastage.hotelId,
          itemId: wastage.itemId,
          transactionType: "wastage",
          qtyBase: String(wastageQtyInBaseUnits),
          notes: wastage.reason,
          recordedBy: wastage.recordedBy
        });
        const [approvedWastage] = await db.update(wastages).set({
          status: "approved",
          approvedBy,
          approvedAt: /* @__PURE__ */ new Date()
        }).where(eq(wastages.id, id)).returning();
        return approvedWastage;
      }
      async rejectWastage(id, rejectedBy, rejectionReason) {
        const wastage = await this.getWastage(id);
        if (!wastage) {
          throw new Error("Wastage not found");
        }
        const [rejectedWastage] = await db.update(wastages).set({
          status: "rejected",
          approvedBy: rejectedBy,
          approvedAt: /* @__PURE__ */ new Date(),
          rejectionReason
        }).where(eq(wastages.id, id)).returning();
        return rejectedWastage;
      }
      // Inventory operations
      async getInventoryItemsByHotel(hotelId) {
        return await db.select().from(inventoryItems).where(and(eq(inventoryItems.hotelId, hotelId), isNull(inventoryItems.deletedAt))).orderBy(asc(inventoryItems.name));
      }
      async getLowStockItems(hotelId) {
        return await db.select().from(inventoryItems).where(and(
          eq(inventoryItems.hotelId, hotelId),
          isNull(inventoryItems.deletedAt),
          sql2`CAST(${inventoryItems.baseStockQty} AS DECIMAL) < CAST(${inventoryItems.reorderLevel} AS DECIMAL)`
        )).orderBy(asc(inventoryItems.name));
      }
      // Vendor operations
      async getVendorsByHotel(hotelId) {
        return await db.select().from(vendors).where(eq(vendors.hotelId, hotelId)).orderBy(asc(vendors.name));
      }
      async createVendor(vendorData) {
        const [vendor] = await db.insert(vendors).values(vendorData).returning();
        return vendor;
      }
      async updateVendor(id, vendorData) {
        const [vendor] = await db.update(vendors).set(vendorData).where(eq(vendors.id, id)).returning();
        return vendor;
      }
      async deleteVendor(id) {
        await db.delete(vendors).where(eq(vendors.id, id));
      }
      // Restaurant operations
      async getRestaurantTablesByHotel(hotelId) {
        return await db.select().from(restaurantTables).where(eq(restaurantTables.hotelId, hotelId)).orderBy(asc(restaurantTables.name));
      }
      // Tax operations
      async getHotelTaxes(hotelId) {
        return await db.select().from(hotelTaxes).where(eq(hotelTaxes.hotelId, hotelId)).orderBy(asc(hotelTaxes.taxType));
      }
      async getHotelTax(hotelId, taxType) {
        const [tax] = await db.select().from(hotelTaxes).where(and(
          eq(hotelTaxes.hotelId, hotelId),
          eq(hotelTaxes.taxType, taxType)
        ));
        return tax || void 0;
      }
      async updateHotelTax(hotelId, taxType, isActive, percent) {
        const [tax] = await db.insert(hotelTaxes).values({
          hotelId,
          taxType,
          isActive,
          percent: percent !== void 0 ? percent.toString() : null
        }).onConflictDoUpdate({
          target: [hotelTaxes.hotelId, hotelTaxes.taxType],
          set: {
            isActive,
            percent: percent !== void 0 ? percent.toString() : null
          }
        }).returning();
        return tax;
      }
      async createTaxChangeLog(log2) {
        const [taxChangeLog] = await db.insert(taxChangeLogs).values({
          hotelId: log2.hotelId,
          taxType: log2.taxType,
          previousPercent: log2.previousPercent !== void 0 && log2.previousPercent !== null ? String(log2.previousPercent) : null,
          newPercent: log2.newPercent !== void 0 && log2.newPercent !== null ? String(log2.newPercent) : null,
          previousActive: log2.previousActive,
          newActive: log2.newActive,
          changedBy: log2.changedBy
        }).returning();
        return taxChangeLog;
      }
      // Voucher operations
      async getVouchersByHotel(hotelId) {
        return await db.select().from(vouchers).where(eq(vouchers.hotelId, hotelId)).orderBy(desc(vouchers.createdAt));
      }
      async createVoucher(voucherData) {
        const [voucher] = await db.insert(vouchers).values(voucherData).returning();
        return voucher;
      }
      async updateVoucher(id, voucherData) {
        const [voucher] = await db.update(vouchers).set(voucherData).where(eq(vouchers.id, id)).returning();
        return voucher;
      }
      async deleteVoucher(id) {
        await db.delete(vouchers).where(eq(vouchers.id, id));
      }
      // Vehicle operations
      async getVehicleLogsByHotel(hotelId) {
        return await db.select().from(vehicleLogs).where(eq(vehicleLogs.hotelId, hotelId)).orderBy(desc(vehicleLogs.checkIn));
      }
      async createVehicleLog(log2) {
        const [result] = await db.insert(vehicleLogs).values(log2).returning();
        return result;
      }
      async updateVehicleLog(id, log2) {
        const [result] = await db.update(vehicleLogs).set(log2).where(eq(vehicleLogs.id, id)).returning();
        return result;
      }
      async getVehicleLog(id) {
        const [result] = await db.select().from(vehicleLogs).where(eq(vehicleLogs.id, id));
        return result;
      }
      // Security alert operations
      async createSecurityAlert(alertData) {
        const [alert] = await db.insert(securityAlerts).values(alertData).returning();
        return alert;
      }
      // Room service operations
      async getRoomServiceOrdersByHotel(hotelId) {
        return await db.select().from(roomServiceOrders).where(eq(roomServiceOrders.hotelId, hotelId)).orderBy(desc(roomServiceOrders.createdAt));
      }
      async createRoomServiceOrder(orderData) {
        const [order] = await db.insert(roomServiceOrders).values(orderData).returning();
        return order;
      }
      // Inventory consumption operations
      async getInventoryConsumptionsByHotel(hotelId) {
        return await db.select().from(inventoryConsumptions).where(eq(inventoryConsumptions.hotelId, hotelId)).orderBy(desc(inventoryConsumptions.createdAt));
      }
      // Room type operations
      async getRoomTypesByHotel(hotelId) {
        return await db.select().from(roomTypes).where(eq(roomTypes.hotelId, hotelId)).orderBy(asc(roomTypes.name));
      }
      async createRoomType(roomType) {
        const [created] = await db.insert(roomTypes).values(roomType).returning();
        return created;
      }
      async updateRoomType(id, hotelId, roomType) {
        const [updated] = await db.update(roomTypes).set(roomType).where(and(eq(roomTypes.id, id), eq(roomTypes.hotelId, hotelId))).returning();
        return updated || null;
      }
      async deleteRoomType(id, hotelId) {
        const result = await db.delete(roomTypes).where(and(eq(roomTypes.id, id), eq(roomTypes.hotelId, hotelId))).returning();
        return result.length > 0;
      }
      // Amenity operations - Halls
      async getHallsByHotel(hotelId) {
        return await db.select().from(halls).where(eq(halls.hotelId, hotelId)).orderBy(asc(halls.name));
      }
      async getHall(id) {
        const [hall] = await db.select().from(halls).where(eq(halls.id, id)).limit(1);
        return hall;
      }
      async createHall(hall) {
        const [created] = await db.insert(halls).values(hall).returning();
        return created;
      }
      async updateHall(id, hotelId, hall) {
        const [updated] = await db.update(halls).set(hall).where(and(eq(halls.id, id), eq(halls.hotelId, hotelId))).returning();
        return updated || null;
      }
      async deleteHall(id, hotelId) {
        const result = await db.delete(halls).where(and(eq(halls.id, id), eq(halls.hotelId, hotelId))).returning();
        return result.length > 0;
      }
      // Amenity operations - Pools
      async getPoolsByHotel(hotelId) {
        return await db.select().from(pools).where(eq(pools.hotelId, hotelId)).orderBy(asc(pools.name));
      }
      async createPool(pool) {
        const [created] = await db.insert(pools).values(pool).returning();
        return created;
      }
      async updatePool(id, hotelId, pool) {
        const [updated] = await db.update(pools).set(pool).where(and(eq(pools.id, id), eq(pools.hotelId, hotelId))).returning();
        return updated || null;
      }
      async deletePool(id, hotelId) {
        const result = await db.delete(pools).where(and(eq(pools.id, id), eq(pools.hotelId, hotelId))).returning();
        return result.length > 0;
      }
      // Amenity operations - Services
      async getServicesByHotel(hotelId) {
        return await db.select().from(services).where(eq(services.hotelId, hotelId)).orderBy(asc(services.name));
      }
      async createService(service) {
        const [created] = await db.insert(services).values(service).returning();
        return created;
      }
      async updateService(id, hotelId, service) {
        const [updated] = await db.update(services).set(service).where(and(eq(services.id, id), eq(services.hotelId, hotelId))).returning();
        return updated || null;
      }
      async deleteService(id, hotelId) {
        const result = await db.delete(services).where(and(eq(services.id, id), eq(services.hotelId, hotelId))).returning();
        return result.length > 0;
      }
      // Payment operations
      async getPaymentsByHotel(hotelId) {
        return await db.select().from(payments).where(eq(payments.hotelId, hotelId)).orderBy(desc(payments.createdAt));
      }
      // Menu item operations
      async getMenuItem(id) {
        const [result] = await db.select().from(menuItems).where(eq(menuItems.id, id));
        return result;
      }
      // Task operations
      async getTask(id) {
        const [result] = await db.select().from(tasks).where(eq(tasks.id, id));
        return result;
      }
      // Restaurant table operations
      async getRestaurantTable(id) {
        const [result] = await db.select().from(restaurantTables).where(eq(restaurantTables.id, id));
        return result;
      }
      async createRestaurantTable(tableData) {
        const [table] = await db.insert(restaurantTables).values(tableData).returning();
        return table;
      }
      async updateRestaurantTable(id, tableData) {
        const [table] = await db.update(restaurantTables).set(tableData).where(eq(restaurantTables.id, id)).returning();
        return table;
      }
      async deleteRestaurantTable(id) {
        await db.delete(restaurantTables).where(eq(restaurantTables.id, id));
      }
      // Inventory item operations
      async getInventoryItem(id) {
        const [result] = await db.select().from(inventoryItems).where(and(eq(inventoryItems.id, id), isNull(inventoryItems.deletedAt)));
        return result;
      }
      async createInventoryItem(itemData) {
        const { getCategoryForUnit: getCategoryForUnit2 } = await Promise.resolve().then(() => (init_measurements(), measurements_exports));
        const category = itemData.baseUnit ? getCategoryForUnit2(itemData.baseUnit) : "count";
        const [item] = await db.insert(inventoryItems).values({
          ...itemData,
          measurementCategory: category
        }).returning();
        return item;
      }
      async updateInventoryItem(id, itemData) {
        const updateData = { ...itemData, updatedAt: /* @__PURE__ */ new Date() };
        if (itemData.baseUnit) {
          const { getCategoryForUnit: getCategoryForUnit2 } = await Promise.resolve().then(() => (init_measurements(), measurements_exports));
          updateData.measurementCategory = getCategoryForUnit2(itemData.baseUnit);
        }
        const [item] = await db.update(inventoryItems).set(updateData).where(eq(inventoryItems.id, id)).returning();
        return item;
      }
      async deleteInventoryItem(id) {
        await db.update(inventoryItems).set({ deletedAt: /* @__PURE__ */ new Date() }).where(eq(inventoryItems.id, id));
      }
      async getInventoryTransactionsByHotel(hotelId) {
        return await db.select().from(inventoryTransactions).where(eq(inventoryTransactions.hotelId, hotelId)).orderBy(desc(inventoryTransactions.createdAt));
      }
      async createInventoryTransaction(transactionData) {
        return await db.transaction(async (tx) => {
          const transactionType = transactionData.transactionType;
          if (["issue", "wastage"].includes(transactionType)) {
            const [item] = await tx.select().from(inventoryItems).where(eq(inventoryItems.id, transactionData.itemId)).for("update").limit(1);
            if (!item) {
              throw new Error("Inventory item not found");
            }
            const currentStock = Number(item.baseStockQty || item.stockQty || 0);
            const requestedQty = Number(transactionData.qtyBase || 0);
            if (requestedQty > currentStock) {
              throw new Error(`Insufficient stock: Available ${currentStock}, Requested ${requestedQty}`);
            }
            const newStock = currentStock - requestedQty;
            await tx.update(inventoryItems).set({
              baseStockQty: String(Math.max(0, newStock)),
              stockQty: String(Math.max(0, newStock)),
              updatedAt: /* @__PURE__ */ new Date()
            }).where(eq(inventoryItems.id, transactionData.itemId));
          }
          if (["receive", "return"].includes(transactionType)) {
            const [item] = await tx.select().from(inventoryItems).where(eq(inventoryItems.id, transactionData.itemId)).for("update").limit(1);
            if (!item) {
              throw new Error("Inventory item not found");
            }
            const currentStock = Number(item.baseStockQty || item.stockQty || 0);
            const addedQty = Number(transactionData.qtyBase || 0);
            const newStock = currentStock + addedQty;
            await tx.update(inventoryItems).set({
              baseStockQty: String(newStock),
              stockQty: String(newStock),
              updatedAt: /* @__PURE__ */ new Date()
            }).where(eq(inventoryItems.id, transactionData.itemId));
          }
          if (transactionType === "adjustment") {
            const [item] = await tx.select().from(inventoryItems).where(eq(inventoryItems.id, transactionData.itemId)).for("update").limit(1);
            if (!item) {
              throw new Error("Inventory item not found");
            }
            const currentStock = Number(item.baseStockQty || item.stockQty || 0);
            const adjustmentDelta = Number(transactionData.qtyBase || 0);
            const newStock = currentStock + adjustmentDelta;
            if (newStock < 0) {
              throw new Error(`Adjustment would result in negative stock: Current ${currentStock}, Delta ${adjustmentDelta}`);
            }
            await tx.update(inventoryItems).set({
              baseStockQty: String(newStock),
              stockQty: String(newStock),
              updatedAt: /* @__PURE__ */ new Date()
            }).where(eq(inventoryItems.id, transactionData.itemId));
          }
          const [transaction] = await tx.insert(inventoryTransactions).values(transactionData).returning();
          return transaction;
        });
      }
      async createKotOrderWithItems(kotData, items) {
        const [kot] = await db.insert(kotOrders).values(kotData).returning();
        for (const item of items) {
          await db.insert(kotItems).values({
            ...item,
            kotId: kot.id,
            inventoryUsage: null
          });
        }
        return kot;
      }
      async updateKotItemQuantity(kotItemId, oldQty, newQty) {
        await db.update(kotItems).set({ qty: newQty }).where(eq(kotItems.id, kotItemId));
      }
      async deleteKotOrderWithInventoryRestore(kotId) {
        await db.delete(kotItems).where(eq(kotItems.kotId, kotId));
        await db.delete(kotOrders).where(eq(kotOrders.id, kotId));
      }
      // Leave request operations
      async getLeaveRequestsByHotel(hotelId) {
        return await db.select().from(leaveRequests).where(eq(leaveRequests.hotelId, hotelId)).orderBy(desc(leaveRequests.createdAt));
      }
      async getLeaveRequestsByUser(userId) {
        return await db.select().from(leaveRequests).where(eq(leaveRequests.requestedBy, userId)).orderBy(desc(leaveRequests.createdAt));
      }
      async getLeaveRequestsForManager(hotelId) {
        return await db.select().from(leaveRequests).where(eq(leaveRequests.hotelId, hotelId)).orderBy(desc(leaveRequests.createdAt));
      }
      async getPendingLeaveRequestsForManager(hotelId) {
        return await db.select().from(leaveRequests).where(and(
          eq(leaveRequests.hotelId, hotelId),
          eq(leaveRequests.status, "pending")
        )).orderBy(desc(leaveRequests.createdAt));
      }
      async getPendingLeaveRequestsForApprover(approverRole, hotelId) {
        const approvalMapping = {
          "restaurant_bar_manager": ["waiter", "cashier", "bartender", "kitchen_staff", "barista"],
          "housekeeping_supervisor": ["housekeeping_staff"],
          "security_head": ["surveillance_officer"],
          "manager": ["restaurant_bar_manager", "housekeeping_supervisor", "security_head", "finance", "front_desk", "storekeeper"],
          "owner": ["manager"]
        };
        const rolesCanApprove = approvalMapping[approverRole] || [];
        if (rolesCanApprove.length === 0) {
          return [];
        }
        const subordinateUsers = await db.select({ id: users.id }).from(users).innerJoin(roles, eq(users.roleId, roles.id)).where(and(
          eq(users.hotelId, hotelId),
          inArray(roles.name, rolesCanApprove)
        ));
        const subordinateUserIds = subordinateUsers.map((u) => u.id);
        if (subordinateUserIds.length === 0) {
          return [];
        }
        const allRequests = await db.select({
          leaveRequest: leaveRequests,
          user: users,
          role: roles
        }).from(leaveRequests).innerJoin(users, eq(leaveRequests.requestedBy, users.id)).innerJoin(roles, eq(users.roleId, roles.id)).where(and(
          eq(leaveRequests.hotelId, hotelId),
          eq(leaveRequests.status, "pending"),
          inArray(leaveRequests.requestedBy, subordinateUserIds)
        )).orderBy(desc(leaveRequests.createdAt));
        return allRequests.map((r) => ({
          ...r.leaveRequest,
          requestedByUser: r.user,
          requestedByRole: r.role
        }));
      }
      async getLeaveRequestsForApprover(approverRole, hotelId) {
        const approvalMapping = {
          "restaurant_bar_manager": ["waiter", "cashier", "bartender", "kitchen_staff", "barista"],
          "housekeeping_supervisor": ["housekeeping_staff"],
          "security_head": ["surveillance_officer"],
          "manager": ["restaurant_bar_manager", "housekeeping_supervisor", "security_head", "finance", "front_desk", "storekeeper"],
          "owner": ["manager"]
        };
        const rolesCanApprove = approvalMapping[approverRole] || [];
        if (rolesCanApprove.length === 0) {
          return [];
        }
        const subordinateUsers = await db.select({ id: users.id }).from(users).innerJoin(roles, eq(users.roleId, roles.id)).where(and(
          eq(users.hotelId, hotelId),
          inArray(roles.name, rolesCanApprove)
        ));
        const subordinateUserIds = subordinateUsers.map((u) => u.id);
        if (subordinateUserIds.length === 0) {
          return [];
        }
        const allRequests = await db.select({
          leaveRequest: leaveRequests,
          user: users,
          role: roles
        }).from(leaveRequests).innerJoin(users, eq(leaveRequests.requestedBy, users.id)).innerJoin(roles, eq(users.roleId, roles.id)).where(and(
          eq(leaveRequests.hotelId, hotelId),
          inArray(leaveRequests.requestedBy, subordinateUserIds)
        )).orderBy(desc(leaveRequests.createdAt));
        return allRequests.map((r) => ({
          ...r.leaveRequest,
          requestedByUser: r.user,
          requestedByRole: r.role
        }));
      }
      async createLeaveRequest(request) {
        const [leaveRequest] = await db.insert(leaveRequests).values(request).returning();
        return leaveRequest;
      }
      async updateLeaveRequest(id, request) {
        const [leaveRequest] = await db.update(leaveRequests).set({ ...request, updatedAt: /* @__PURE__ */ new Date() }).where(eq(leaveRequests.id, id)).returning();
        return leaveRequest;
      }
      async getLeaveRequest(id) {
        const [leaveRequest] = await db.select().from(leaveRequests).where(eq(leaveRequests.id, id));
        return leaveRequest || void 0;
      }
      async getOverlappingLeaves(userId, startDate, endDate, excludeId) {
        const conditions = [
          eq(leaveRequests.requestedBy, userId),
          or(
            eq(leaveRequests.status, "approved"),
            eq(leaveRequests.status, "pending")
          ),
          or(
            and(
              lte(leaveRequests.startDate, startDate),
              gte(leaveRequests.endDate, startDate)
            ),
            and(
              lte(leaveRequests.startDate, endDate),
              gte(leaveRequests.endDate, endDate)
            ),
            and(
              gte(leaveRequests.startDate, startDate),
              lte(leaveRequests.endDate, endDate)
            )
          )
        ];
        if (excludeId) {
          conditions.push(not(eq(leaveRequests.id, excludeId)));
        }
        return await db.select().from(leaveRequests).where(and(...conditions));
      }
      // Leave balance operations
      async getLeaveBalancesByUser(userId, year) {
        const currentYear = year || (/* @__PURE__ */ new Date()).getFullYear();
        return await db.select().from(leaveBalances).where(and(
          eq(leaveBalances.userId, userId),
          eq(leaveBalances.year, currentYear)
        ));
      }
      async getLeaveBalance(userId, leaveType, year) {
        const [balance] = await db.select().from(leaveBalances).where(and(
          eq(leaveBalances.userId, userId),
          eq(leaveBalances.leaveType, leaveType),
          eq(leaveBalances.year, year)
        ));
        return balance || void 0;
      }
      async createLeaveBalance(balance) {
        const [leaveBalance] = await db.insert(leaveBalances).values(balance).returning();
        return leaveBalance;
      }
      async updateLeaveBalance(id, balance) {
        const [leaveBalance] = await db.update(leaveBalances).set({ ...balance, updatedAt: /* @__PURE__ */ new Date() }).where(eq(leaveBalances.id, id)).returning();
        return leaveBalance;
      }
      async initializeLeaveBalances(userId, hotelId, year) {
        const policies = await this.getLeavePoliciesByHotel(hotelId);
        const activePolicies = policies.filter((p) => p.isActive);
        for (const policy of activePolicies) {
          const existing = await this.getLeaveBalance(userId, policy.leaveType, year);
          if (!existing) {
            await this.createLeaveBalance({
              hotelId,
              userId,
              leaveType: policy.leaveType,
              totalDays: policy.defaultDays.toString(),
              usedDays: "0",
              remainingDays: policy.defaultDays.toString(),
              year
            });
          }
        }
      }
      // Leave policy operations
      async getLeavePoliciesByHotel(hotelId) {
        return await db.select().from(leavePolicies).where(eq(leavePolicies.hotelId, hotelId)).orderBy(asc(leavePolicies.leaveType));
      }
      async getLeavePolicy(id) {
        const [policy] = await db.select().from(leavePolicies).where(eq(leavePolicies.id, id));
        return policy || void 0;
      }
      async createLeavePolicy(policy) {
        const [newPolicy] = await db.insert(leavePolicies).values(policy).returning();
        return newPolicy;
      }
      async updateLeavePolicy(id, policy) {
        const [updatedPolicy] = await db.update(leavePolicies).set({ ...policy, updatedAt: /* @__PURE__ */ new Date() }).where(eq(leavePolicies.id, id)).returning();
        return updatedPolicy;
      }
      async deleteLeavePolicy(id) {
        await db.delete(leavePolicies).where(eq(leavePolicies.id, id));
      }
      // Notification operations
      async getNotificationsByUser(userId) {
        return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(50);
      }
      async getUnreadNotificationsByUser(userId) {
        return await db.select().from(notifications).where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )).orderBy(desc(notifications.createdAt));
      }
      async createNotification(notification) {
        const [newNotification] = await db.insert(notifications).values(notification).returning();
        return newNotification;
      }
      async markNotificationAsRead(id) {
        const [notification] = await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id)).returning();
        return notification;
      }
      async markAllNotificationsAsRead(userId) {
        await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
      }
      // Meal plan operations
      async getMealPlansByHotel(hotelId) {
        return await db.select().from(mealPlans).where(and(
          eq(mealPlans.hotelId, hotelId),
          eq(mealPlans.isActive, true)
        )).orderBy(asc(mealPlans.planType));
      }
      async getMealPlan(id) {
        const [plan] = await db.select().from(mealPlans).where(eq(mealPlans.id, id));
        return plan || void 0;
      }
      async createMealPlan(plan) {
        const [mealPlan] = await db.insert(mealPlans).values(plan).returning();
        return mealPlan;
      }
      async updateMealPlan(id, plan) {
        const [mealPlan] = await db.update(mealPlans).set({ ...plan, updatedAt: /* @__PURE__ */ new Date() }).where(eq(mealPlans.id, id)).returning();
        return mealPlan;
      }
      async deleteMealPlan(id, hotelId) {
        const result = await db.update(mealPlans).set({ isActive: false, updatedAt: /* @__PURE__ */ new Date() }).where(and(
          eq(mealPlans.id, id),
          eq(mealPlans.hotelId, hotelId)
        )).returning();
        return result.length > 0;
      }
      // Meal voucher operations
      async createMealVoucher(voucher) {
        const [created] = await db.insert(mealVouchers).values(voucher).returning();
        return created;
      }
      async getMealVouchers(hotelId, filters) {
        const conditions = [eq(mealVouchers.hotelId, hotelId)];
        if (filters?.status) {
          conditions.push(eq(mealVouchers.status, filters.status));
        }
        if (filters?.date) {
          const startOfDay = new Date(filters.date);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(filters.date);
          endOfDay.setHours(23, 59, 59, 999);
          conditions.push(
            and(
              gte(mealVouchers.voucherDate, startOfDay),
              lte(mealVouchers.voucherDate, endOfDay)
            )
          );
        }
        return await db.select().from(mealVouchers).where(and(...conditions)).orderBy(desc(mealVouchers.voucherDate));
      }
      async getMealVouchersByRoom(roomId) {
        return await db.select().from(mealVouchers).where(eq(mealVouchers.roomId, roomId)).orderBy(desc(mealVouchers.voucherDate));
      }
      async redeemMealVoucher(id, redeemedBy, notes) {
        try {
          return await db.transaction(async (tx) => {
            const [voucher] = await tx.select().from(mealVouchers).where(eq(mealVouchers.id, id)).for("update");
            if (!voucher) {
              throw new Error("Meal voucher not found");
            }
            if (voucher.status !== "unused") {
              throw new Error("Meal voucher has already been used");
            }
            const [redeemed] = await tx.update(mealVouchers).set({
              status: "used",
              usedAt: /* @__PURE__ */ new Date(),
              redeemedBy,
              notes
            }).where(and(
              eq(mealVouchers.id, id),
              eq(mealVouchers.status, "unused")
              // Double-check in update
            )).returning();
            if (!redeemed) {
              throw new Error("Failed to redeem voucher - may have been used by another request");
            }
            return redeemed;
          });
        } catch (error) {
          console.error("Meal voucher redemption error:", error);
          return null;
        }
      }
      // Guest operations
      async getGuestsByHotel(hotelId) {
        return await db.select().from(guests).where(and(
          eq(guests.hotelId, hotelId),
          isNull(guests.deletedAt)
        )).orderBy(desc(guests.createdAt));
      }
      async getGuest(id) {
        const [guest] = await db.select().from(guests).where(and(
          eq(guests.id, id),
          isNull(guests.deletedAt)
        ));
        return guest || void 0;
      }
      async createGuest(guestData) {
        const [guest] = await db.insert(guests).values(guestData).returning();
        return guest;
      }
      async updateGuest(id, guestData) {
        const [guest] = await db.update(guests).set({ ...guestData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(guests.id, id)).returning();
        return guest;
      }
      async deleteGuest(id) {
        await db.update(guests).set({ deletedAt: /* @__PURE__ */ new Date() }).where(eq(guests.id, id));
      }
      async restoreGuest(id, hotelId) {
        const [guest] = await db.update(guests).set({ deletedAt: null, updatedAt: /* @__PURE__ */ new Date() }).where(and(
          eq(guests.id, id),
          eq(guests.hotelId, hotelId)
        )).returning();
        if (!guest) {
          throw new Error("Guest not found or does not belong to this hotel");
        }
        return guest;
      }
      async searchGuests(hotelId, searchTerm) {
        const search = `%${searchTerm.toLowerCase()}%`;
        return await db.select().from(guests).where(and(
          eq(guests.hotelId, hotelId),
          isNull(guests.deletedAt),
          sql2`(LOWER(${guests.firstName}) LIKE ${search} OR LOWER(${guests.lastName}) LIKE ${search} OR LOWER(${guests.phone}) LIKE ${search} OR LOWER(${guests.email}) LIKE ${search})`
        )).orderBy(desc(guests.createdAt));
      }
      // Stock request operations
      async getStockRequestsByHotel(hotelId) {
        return await db.select().from(stockRequests).where(eq(stockRequests.hotelId, hotelId)).orderBy(desc(stockRequests.createdAt));
      }
      async getStockRequestsByUser(userId) {
        return await db.select().from(stockRequests).where(eq(stockRequests.requestedBy, userId)).orderBy(desc(stockRequests.createdAt));
      }
      async getPendingStockRequestsForStorekeeper(hotelId) {
        return await db.select().from(stockRequests).where(and(
          eq(stockRequests.hotelId, hotelId),
          sql2`${stockRequests.status} IN ('pending', 'approved')`
        )).orderBy(asc(stockRequests.createdAt));
      }
      async getStockRequestsByDepartment(hotelId, department) {
        return await db.select().from(stockRequests).where(and(
          eq(stockRequests.hotelId, hotelId),
          eq(stockRequests.department, department)
        )).orderBy(desc(stockRequests.createdAt));
      }
      async getStockRequest(id) {
        const [request] = await db.select().from(stockRequests).where(eq(stockRequests.id, id));
        return request || void 0;
      }
      async createStockRequest(requestData) {
        const [request] = await db.insert(stockRequests).values(requestData).returning();
        return request;
      }
      async updateStockRequest(id, requestData) {
        const [request] = await db.update(stockRequests).set({ ...requestData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(stockRequests.id, id)).returning();
        return request;
      }
      async approveStockRequest(id, approvedBy) {
        const [request] = await db.update(stockRequests).set({
          status: "approved",
          approvedBy,
          approvedAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(stockRequests.id, id)).returning();
        return request;
      }
      async deliverStockRequest(id, deliveredBy) {
        const request = await this.getStockRequest(id);
        if (!request) {
          throw new Error("Stock request not found");
        }
        const inventoryItem = await db.query.inventoryItems.findFirst({
          where: (inventoryItemsTable, { eq: eq4 }) => eq4(inventoryItemsTable.id, request.itemId)
        });
        if (!inventoryItem) {
          throw new Error("Inventory item not found");
        }
        let quantityInBaseUnit = Number(request.quantity);
        if (request.unit && request.unit !== inventoryItem.baseUnit) {
          const { convertToBase: convertToBase2 } = await Promise.resolve().then(() => (init_measurements(), measurements_exports));
          const category = inventoryItem.measurementCategory || "weight";
          const conversionProfile = inventoryItem.conversionProfile;
          try {
            quantityInBaseUnit = convertToBase2(
              Number(request.quantity),
              request.unit,
              inventoryItem.baseUnit || "kg",
              category,
              conversionProfile
            );
          } catch (error) {
            console.error(`Unit conversion error for ${inventoryItem.name}:`, error);
          }
        }
        const currentStock = Number(inventoryItem.baseStockQty || inventoryItem.stockQty || 0);
        const newQuantity = currentStock - quantityInBaseUnit;
        await db.update(inventoryItems).set({
          baseStockQty: String(newQuantity),
          stockQty: String(newQuantity),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(inventoryItems.id, request.itemId));
        await this.createInventoryTransaction({
          hotelId: request.hotelId,
          itemId: request.itemId,
          transactionType: "issue",
          qtyBase: String(quantityInBaseUnit),
          qtyPackage: request.unit === inventoryItem.packageUnit ? request.quantity : null,
          issuedToUserId: request.requestedBy,
          department: request.department,
          notes: `Stock request delivered - ${request.notes || ""}`,
          recordedBy: deliveredBy
        });
        const [updatedRequest] = await db.update(stockRequests).set({
          status: "delivered",
          deliveredAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(stockRequests.id, id)).returning();
        return updatedRequest;
      }
      // Hall booking operations
      async getHallBookingsByHotel(hotelId) {
        return await db.select().from(hallBookings).where(eq(hallBookings.hotelId, hotelId)).orderBy(desc(hallBookings.bookingStartTime));
      }
      async getHallBookingsByHall(hallId) {
        return await db.select().from(hallBookings).where(eq(hallBookings.hallId, hallId)).orderBy(desc(hallBookings.bookingStartTime));
      }
      async getHallBooking(id) {
        const [booking] = await db.select().from(hallBookings).where(eq(hallBookings.id, id));
        return booking || void 0;
      }
      async createHallBooking(bookingData) {
        return await db.transaction(async (tx) => {
          const { hallId, bookingStartTime, bookingEndTime } = bookingData;
          const [hall] = await tx.select().from(halls).where(eq(halls.id, hallId)).for("update");
          if (!hall) {
            throw new Error("Hall not found");
          }
          const overlapping = await tx.select().from(hallBookings).where(
            and(
              eq(hallBookings.hallId, hallId),
              or(
                eq(hallBookings.status, "confirmed"),
                eq(hallBookings.status, "pending"),
                eq(hallBookings.status, "quotation")
              ),
              // Time overlap check: new booking overlaps with existing booking
              or(
                // New booking starts during existing booking
                and(
                  lte(hallBookings.bookingStartTime, bookingStartTime),
                  gt(hallBookings.bookingEndTime, bookingStartTime)
                ),
                // New booking ends during existing booking
                and(
                  lt(hallBookings.bookingStartTime, bookingEndTime),
                  gte(hallBookings.bookingEndTime, bookingEndTime)
                ),
                // New booking completely contains existing booking
                and(
                  gte(hallBookings.bookingStartTime, bookingStartTime),
                  lte(hallBookings.bookingEndTime, bookingEndTime)
                )
              )
            )
          ).limit(1);
          if (overlapping.length > 0) {
            throw new Error("Hall is already booked for the selected time period");
          }
          const [booking] = await tx.insert(hallBookings).values(bookingData).returning();
          return booking;
        });
      }
      async updateHallBooking(id, bookingData) {
        const [booking] = await db.update(hallBookings).set({ ...bookingData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(hallBookings.id, id)).returning();
        return booking;
      }
      async confirmHallBooking(id, confirmedBy) {
        const [booking] = await db.update(hallBookings).set({
          status: "confirmed",
          confirmedBy,
          confirmedAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(hallBookings.id, id)).returning();
        return booking;
      }
      async cancelHallBooking(id, cancelledBy, reason) {
        const [booking] = await db.update(hallBookings).set({
          status: "cancelled",
          cancelledBy,
          cancellationReason: reason,
          cancelledAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(hallBookings.id, id)).returning();
        return booking;
      }
      async checkHallAvailability(hallId, startTime, endTime, excludeBookingId) {
        const conditions = [
          eq(hallBookings.hallId, hallId),
          sql2`${hallBookings.status} IN ('deposit_pending', 'confirmed', 'in_progress', 'completed')`,
          sql2`${hallBookings.bookingStartTime} < ${endTime.toISOString()}`,
          sql2`${hallBookings.bookingEndTime} > ${startTime.toISOString()}`
        ];
        if (excludeBookingId) {
          conditions.push(sql2`${hallBookings.id} != ${excludeBookingId}`);
        }
        const conflicts = await db.select().from(hallBookings).where(and(...conditions));
        return conflicts.length === 0;
      }
      async createBookingPayment(paymentData) {
        const [payment] = await db.insert(bookingPayments).values(paymentData).returning();
        return payment;
      }
      async getRestaurantBillsByHotel(hotelId, filters) {
        const conditions = [eq(restaurantBills.hotelId, hotelId)];
        if (filters?.startDate) {
          conditions.push(sql2`${restaurantBills.createdAt} >= ${filters.startDate.toISOString()}`);
        }
        if (filters?.endDate) {
          conditions.push(sql2`${restaurantBills.createdAt} <= ${filters.endDate.toISOString()}`);
        }
        if (filters?.status) {
          conditions.push(eq(restaurantBills.status, filters.status));
        }
        return await db.select().from(restaurantBills).where(and(...conditions)).orderBy(desc(restaurantBills.createdAt));
      }
      async getRestaurantBill(id) {
        const [bill] = await db.select().from(restaurantBills).where(eq(restaurantBills.id, id));
        return bill || void 0;
      }
      async createRestaurantBill(billData) {
        const [bill] = await db.insert(restaurantBills).values(billData).returning();
        return bill;
      }
      async updateRestaurantBill(id, billData) {
        const [bill] = await db.update(restaurantBills).set(billData).where(eq(restaurantBills.id, id)).returning();
        return bill;
      }
      async getBillPayments(billId) {
        return await db.select().from(billPayments).where(eq(billPayments.billId, billId)).orderBy(asc(billPayments.createdAt));
      }
      async createBillPayment(paymentData) {
        const [payment] = await db.insert(billPayments).values(paymentData).returning();
        return payment;
      }
      async getBillPayment(paymentId) {
        const [payment] = await db.select().from(billPayments).where(eq(billPayments.id, paymentId));
        return payment || void 0;
      }
      async voidBillPayment(paymentId, voidedBy, reason) {
        const [voided] = await db.update(billPayments).set({
          isVoided: true,
          voidedBy,
          voidedAt: /* @__PURE__ */ new Date(),
          voidReason: reason
        }).where(eq(billPayments.id, paymentId)).returning();
        return voided;
      }
      async createAttendance(userId, hotelId, clockInTime, location, ip, source) {
        const [record] = await db.insert(attendance).values({
          userId,
          hotelId,
          clockInTime,
          clockInLocation: location,
          clockInIp: ip,
          clockInSource: source,
          status: "active"
        }).returning();
        return record;
      }
      async getActiveAttendance(userId) {
        const [record] = await db.select().from(attendance).where(and(
          eq(attendance.userId, userId),
          eq(attendance.status, "active")
        )).orderBy(desc(attendance.clockInTime)).limit(1);
        return record || null;
      }
      async clockOut(attendanceId, clockOutTime, location, ip, source) {
        const [record] = await db.select().from(attendance).where(eq(attendance.id, attendanceId));
        if (!record) {
          throw new Error("Attendance record not found");
        }
        const clockInTime = new Date(record.clockInTime);
        const totalHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1e3 * 60 * 60);
        const [updated] = await db.update(attendance).set({
          clockOutTime,
          clockOutLocation: location,
          clockOutIp: ip,
          clockOutSource: source,
          totalHours: totalHours.toFixed(2),
          status: "completed",
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(attendance.id, attendanceId)).returning();
        return updated;
      }
      async getAttendanceByUser(userId, startDate, endDate) {
        const conditions = [eq(attendance.userId, userId)];
        if (startDate) {
          conditions.push(gte(attendance.clockInTime, startDate));
        }
        if (endDate) {
          conditions.push(lte(attendance.clockInTime, endDate));
        }
        return await db.select().from(attendance).where(and(...conditions)).orderBy(desc(attendance.clockInTime));
      }
      async getAttendanceByHotel(hotelId, date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return await db.select().from(attendance).where(and(
          eq(attendance.hotelId, hotelId),
          or(
            and(
              gte(attendance.clockInTime, startOfDay),
              lte(attendance.clockInTime, endOfDay)
            ),
            eq(attendance.status, "active")
          )
        )).orderBy(desc(attendance.clockInTime));
      }
      async getAllAttendanceByHotel(hotelId, startDate, endDate) {
        const conditions = [eq(attendance.hotelId, hotelId)];
        if (startDate) {
          conditions.push(gte(attendance.clockInTime, startDate));
        }
        if (endDate) {
          conditions.push(lte(attendance.clockInTime, endDate));
        }
        return await db.select().from(attendance).where(and(...conditions)).orderBy(desc(attendance.clockInTime));
      }
      async canClockIn(userId) {
        const user = await this.getUser(userId);
        if (!user) {
          return { canClockIn: false, reason: "User not found" };
        }
        if (!user.isActive) {
          return { canClockIn: false, reason: "User is not active" };
        }
        const activeAttendance = await this.getActiveAttendance(userId);
        if (activeAttendance) {
          return { canClockIn: false, reason: "Already clocked in" };
        }
        const lastAttendance = await db.select().from(attendance).where(eq(attendance.userId, userId)).orderBy(desc(attendance.clockInTime)).limit(1);
        if (lastAttendance.length > 0 && lastAttendance[0].clockOutTime) {
          const lastClockOut = new Date(lastAttendance[0].clockOutTime);
          const now = /* @__PURE__ */ new Date();
          const minutesSinceLastClockOut = (now.getTime() - lastClockOut.getTime()) / (1e3 * 60);
          if (minutesSinceLastClockOut < 1) {
            return { canClockIn: false, reason: "Must wait at least 1 minute after clocking out" };
          }
        }
        return { canClockIn: true };
      }
      async createAuditLog(log2) {
        const [auditLog] = await db.insert(auditLogs).values({
          hotelId: log2.hotelId,
          resourceType: log2.resourceType,
          resourceId: log2.resourceId,
          action: log2.action,
          userId: log2.userId,
          details: log2.details,
          success: true
        }).returning();
        return auditLog;
      }
      async createPriceChangeLog(log2) {
        const [priceChangeLog] = await db.insert(priceChangeLogs).values({
          hotelId: log2.hotelId,
          itemId: log2.itemId,
          itemType: log2.itemType,
          itemName: log2.itemName,
          previousPrice: String(log2.previousPrice),
          newPrice: String(log2.newPrice),
          changedBy: log2.changedBy
        }).returning();
        return priceChangeLog;
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/audit.ts
async function logAudit(params) {
  try {
    await db.insert(auditLogs).values({
      hotelId: params.hotelId,
      userId: params.userId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      details: params.details || {},
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      success: params.success !== false,
      errorMessage: params.errorMessage,
      createdAt: /* @__PURE__ */ new Date()
    });
  } catch (error) {
    console.error("Audit logging failed:", error);
  }
}
var init_audit = __esm({
  "server/audit.ts"() {
    "use strict";
    init_db();
    init_schema();
  }
});

// server/auth.ts
var auth_exports = {};
__export(auth_exports, {
  hashPassword: () => hashPassword,
  requireActiveUser: () => requireActiveUser,
  setupAuth: () => setupAuth
});
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
function sanitizeUser(user) {
  const { passwordHash, ...sanitizedUser } = user;
  return sanitizedUser;
}
function sanitizeInput(input) {
  if (typeof input !== "string") {
    return "";
  }
  if (!input) return "";
  let sanitized = input.replace(/\x00/g, "");
  sanitized = sanitized.substring(0, 1e3);
  return sanitized.trim();
}
function requireActiveUser(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  const user = req.user;
  if (!user.isActive) {
    req.logout((err) => {
      if (err) console.error("Logout error:", err);
    });
    return res.status(403).json({
      message: "Your account has been deactivated. Please contact your hotel manager."
    });
  }
  next();
}
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      httpOnly: true,
      // Prevents client-side JS from accessing the cookie
      secure: process.env.NODE_ENV === "production",
      // Only send cookie over HTTPS in production
      sameSite: "lax",
      // CSRF protection - prevents cookie from being sent with cross-site requests
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const sanitizedUsername = sanitizeInput(username);
      const sanitizedPassword = sanitizeInput(password);
      if (!sanitizedUsername || !sanitizedPassword) {
        return done(null, false, { message: "Missing credentials" });
      }
      const user = await storage.getUserByUsername(sanitizedUsername);
      if (!user || !await comparePasswords(sanitizedPassword, user.passwordHash)) {
        return done(null, false, { message: "Invalid username or password" });
      }
      if (!user.isActive) {
        return done(null, false, { message: "Your account has been deactivated. Please contact your manager." });
      }
      return done(null, user);
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const user = await storage.getUser(id);
    if (user && !user.isActive) {
      return done(null, false);
    }
    done(null, user);
  });
  app2.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const user = await storage.createUser({
      ...req.body,
      passwordHash: await hashPassword(req.body.password)
    });
    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(sanitizeUser(user));
    });
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", async (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        await logAudit({
          userId: "unknown",
          action: "login_failed",
          resourceType: "user",
          details: { username: req.body.username, reason: info?.message },
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
          success: false,
          errorMessage: info?.message || "Invalid username or password"
        });
        return res.status(401).json({
          message: info?.message || "Invalid username or password"
        });
      }
      req.login(user, async (err2) => {
        if (err2) {
          return next(err2);
        }
        await logAudit({
          userId: user.id,
          hotelId: user.hotelId || void 0,
          action: "login",
          resourceType: "user",
          resourceId: user.id,
          details: { username: user.username },
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
          success: true
        });
        return res.status(200).json(sanitizeUser(user));
      });
    })(req, res, next);
  });
  app2.post("/api/logout", async (req, res, next) => {
    const user = req.user;
    req.logout(async (err) => {
      if (err) return next(err);
      if (user) {
        await logAudit({
          userId: user.id,
          hotelId: user.hotelId || void 0,
          action: "logout",
          resourceType: "user",
          resourceId: user.id,
          details: { username: user.username },
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
          success: true
        });
      }
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    res.json(sanitizeUser(req.user));
  });
  app2.post("/api/reset-password", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { oldPassword, newPassword } = req.body;
      const user = req.user;
      const isOldPasswordValid = await comparePasswords(oldPassword, user.passwordHash);
      if (!isOldPasswordValid) {
        await logAudit({
          userId: user.id,
          hotelId: user.hotelId || void 0,
          action: "password_change_failed",
          resourceType: "user",
          resourceId: user.id,
          details: { reason: "incorrect_old_password" },
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
          success: false,
          errorMessage: "Current password is incorrect"
        });
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(user.id, { passwordHash: hashedPassword });
      await logAudit({
        userId: user.id,
        hotelId: user.hotelId || void 0,
        action: "password_change",
        resourceType: "user",
        resourceId: user.id,
        details: { username: user.username },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        success: true
      });
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(400).json({ message: "Failed to change password" });
    }
  });
}
var scryptAsync;
var init_auth = __esm({
  "server/auth.ts"() {
    "use strict";
    init_storage();
    init_audit();
    scryptAsync = promisify(scrypt);
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
init_storage();
init_auth();
init_audit();
init_db();
import { createServer } from "http";

// server/websocket.ts
import { WebSocketServer, WebSocket } from "ws";

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: "0.0.0.0",
    port: 5e3,
    strictPort: true,
    allowedHosts: true,
    hmr: {
      protocol: "wss",
      host: process.env.REPLIT_DEV_DOMAIN || "localhost",
      clientPort: 443
    },
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: {
      server
    },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    if (url.startsWith("/api")) {
      return next();
    }
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/websocket.ts
var wss;
var clients = /* @__PURE__ */ new Map();
function setupWebSocket(server) {
  wss = new WebSocketServer({
    server,
    path: "/ws"
  });
  wss.on("connection", (ws, req) => {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const hotelId = url.searchParams.get("hotelId");
    const userId = url.searchParams.get("userId");
    const role = url.searchParams.get("role");
    if (hotelId && userId) {
      ws.hotelId = hotelId;
      ws.userId = userId;
      ws.role = role || void 0;
      clients.set(userId, ws);
      log(`WebSocket client connected: user ${userId}, role ${role}, hotel ${hotelId}`);
    }
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
    ws.on("close", () => {
      if (userId) {
        clients.delete(userId);
        log(`WebSocket client disconnected: user ${userId}`);
      }
    });
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });
  return wss;
}
function broadcastToHotel(hotelId, event, data) {
  if (!wss) return;
  const message = JSON.stringify({ event, data, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  clients.forEach((client2, userId) => {
    if (client2.hotelId === hotelId && client2.readyState === WebSocket.OPEN) {
      client2.send(message);
    }
  });
}
function broadcastToRole(hotelId, roles2, event, data) {
  if (!wss) return;
  const message = JSON.stringify({ event, data, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  clients.forEach((client2, userId) => {
    if (client2.hotelId === hotelId && client2.role && roles2.includes(client2.role) && client2.readyState === WebSocket.OPEN) {
      client2.send(message);
    }
  });
}
function broadcastToUser(userId, event, data) {
  const client2 = clients.get(userId);
  if (client2 && client2.readyState === WebSocket.OPEN) {
    const message = JSON.stringify({ event, data, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
    client2.send(message);
  }
}
var wsEvents = {
  // Task updates
  taskCreated: (hotelId, task) => broadcastToHotel(hotelId, "task:created", task),
  taskUpdated: (hotelId, task) => broadcastToHotel(hotelId, "task:updated", task),
  taskDeleted: (hotelId, taskId) => broadcastToHotel(hotelId, "task:deleted", { taskId }),
  // Attendance updates
  attendanceUpdated: (hotelId, attendance2) => broadcastToHotel(hotelId, "attendance:updated", attendance2),
  // KOT order updates
  kotOrderCreated: (hotelId, order) => broadcastToRole(hotelId, ["kitchen_staff", "bartender", "barista", "waiter", "restaurant_bar_manager"], "kot:created", order),
  kotOrderUpdated: (hotelId, order) => broadcastToRole(hotelId, ["kitchen_staff", "bartender", "barista", "waiter", "restaurant_bar_manager"], "kot:updated", order),
  // Room status updates
  roomStatusUpdated: (hotelId, room) => broadcastToRole(hotelId, ["housekeeping_supervisor", "housekeeping_staff", "front_desk", "manager"], "room:updated", room),
  // Stock/Inventory updates
  stockUpdated: (hotelId, item) => broadcastToRole(hotelId, ["storekeeper", "manager", "restaurant_bar_manager", "housekeeping_supervisor"], "stock:updated", item),
  // Leave request updates
  leaveRequestUpdated: (hotelId, leaveRequest) => broadcastToHotel(hotelId, "leave:updated", leaveRequest),
  // Transaction updates
  transactionCreated: (hotelId, transaction) => broadcastToRole(hotelId, ["finance", "cashier", "manager", "owner"], "transaction:created", transaction),
  transactionUpdated: (hotelId, transaction) => broadcastToRole(hotelId, ["finance", "cashier", "manager", "owner"], "transaction:updated", transaction),
  // Maintenance request updates
  maintenanceUpdated: (hotelId, request) => broadcastToHotel(hotelId, "maintenance:updated", request),
  // Vehicle log updates
  vehicleLogUpdated: (hotelId, log2) => broadcastToRole(hotelId, ["surveillance_officer", "security_head", "security_guard"], "vehicle:updated", log2),
  // Guest updates
  guestCreated: (hotelId, guest) => broadcastToRole(hotelId, ["front_desk", "manager", "owner"], "guest:created", guest),
  guestUpdated: (hotelId, guest) => broadcastToRole(hotelId, ["front_desk", "manager", "owner"], "guest:updated", guest),
  // General notification
  notification: (userId, notification) => broadcastToUser(userId, "notification", notification)
};

// server/routes.ts
init_schema();
import { eq as eq2, and as and2, isNull as isNull2, asc as asc2, desc as desc2, sql as sql3, ne as ne2 } from "drizzle-orm";

// server/sanitize.ts
function sanitizeInput2(input) {
  if (typeof input !== "string") {
    return input;
  }
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/<[^>]+>/g, "").trim();
}
function sanitizeObject(obj) {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeInput2(value);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(
        (item) => typeof item === "string" ? sanitizeInput2(item) : typeof item === "object" ? sanitizeObject(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// server/routes.ts
init_schema();
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/api/hotels", async (req, res) => {
    try {
      const hotels2 = await storage.getAllHotels();
      res.json(hotels2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hotels" });
    }
  });
  app2.post("/api/hotels", async (req, res) => {
    try {
      const { ownerId, ...hotelFields } = req.body;
      const hotelData = insertHotelSchema.parse(hotelFields);
      const hotel = await storage.createHotel(hotelData);
      if (ownerId) {
        await storage.updateUser(ownerId, { hotelId: hotel.id });
        if (req.isAuthenticated() && req.user?.id === ownerId) {
          const updatedUser = await storage.getUser(ownerId);
          if (updatedUser) {
            req.user = updatedUser;
          }
        }
      }
      res.status(201).json(hotel);
    } catch (error) {
      res.status(400).json({ message: "Invalid hotel data" });
    }
  });
  app2.put("/api/hotels/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const hotelData = insertHotelSchema.partial().parse(req.body);
      const hotel = await storage.updateHotel(id, hotelData);
      res.json(hotel);
    } catch (error) {
      res.status(400).json({ message: "Failed to update hotel" });
    }
  });
  app2.delete("/api/hotels/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteHotel(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete hotel" });
    }
  });
  app2.get("/api/hotels/current", async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const hotel = await storage.getHotel(user.hotelId);
      res.json(hotel);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch current hotel" });
    }
  });
  app2.get("/api/hotels/current/users", async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const users2 = await storage.getUsersByHotel(user.hotelId);
      const sanitizedUsers = users2.map((user2) => {
        const { passwordHash: _, ...sanitizedUser } = user2;
        return sanitizedUser;
      });
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.get("/api/hotels/current/rooms", async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const rooms2 = await storage.getRoomsByHotel(user.hotelId);
      res.json(rooms2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });
  app2.get("/api/hotels/current/transactions", async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { startDate, endDate } = req.query;
      let transactions2 = await storage.getTransactionsByHotel(user.hotelId);
      if (startDate && typeof startDate === "string") {
        const start = new Date(startDate);
        transactions2 = transactions2.filter((t) => new Date(t.createdAt) >= start);
      }
      if (endDate && typeof endDate === "string") {
        const end = new Date(endDate);
        transactions2 = transactions2.filter((t) => new Date(t.createdAt) <= end);
      }
      res.json(transactions2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });
  app2.get("/api/hotels/current/vendors", async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const vendors2 = await storage.getVendorsByHotel(user.hotelId);
      res.json(vendors2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });
  app2.post("/api/hotels/current/vendors", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { name } = req.body;
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: "Vendor name is required" });
      }
      const vendorData = insertVendorSchema.parse({
        ...req.body,
        hotelId: user.hotelId
      });
      const vendor = await storage.createVendor(vendorData);
      res.status(201).json(vendor);
    } catch (error) {
      console.error("Vendor creation error:", error);
      res.status(400).json({ message: "Invalid vendor data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.put("/api/hotels/current/vendors/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const vendorData = insertVendorSchema.partial().parse(req.body);
      const vendor = await storage.updateVendor(id, vendorData);
      res.json(vendor);
    } catch (error) {
      res.status(400).json({ message: "Failed to update vendor" });
    }
  });
  app2.delete("/api/hotels/current/vendors/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      await storage.deleteVendor(id);
      res.json({ message: "Vendor deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vendor" });
    }
  });
  app2.get("/api/hotels/current/guests", async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const guests2 = await storage.getGuestsByHotel(user.hotelId);
      res.json(guests2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guests" });
    }
  });
  app2.get("/api/hotels/current/guests/search", async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const searchTerm = req.query.q;
      if (!searchTerm) {
        return res.status(400).json({ message: "Search term required" });
      }
      const guests2 = await storage.searchGuests(user.hotelId, searchTerm);
      res.json(guests2);
    } catch (error) {
      res.status(500).json({ message: "Failed to search guests" });
    }
  });
  app2.get("/api/hotels/current/guests/:id", async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const guest = await storage.getGuest(id);
      if (!guest) {
        return res.status(404).json({ message: "Guest not found" });
      }
      res.json(guest);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guest" });
    }
  });
  app2.post("/api/hotels/current/guests", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const bodyData = {
        ...req.body,
        hotelId: user.hotelId,
        createdBy: user.id
      };
      if (bodyData.dateOfBirth && typeof bodyData.dateOfBirth === "string") {
        bodyData.dateOfBirth = new Date(bodyData.dateOfBirth);
      }
      const guestData = insertGuestSchema.parse(bodyData);
      const guest = await storage.createGuest(guestData);
      wsEvents.guestCreated(user.hotelId, guest);
      res.status(201).json(guest);
    } catch (error) {
      console.error("Guest creation error:", error);
      res.status(400).json({ message: "Invalid guest data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.put("/api/hotels/current/guests/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const bodyData = { ...req.body };
      if (bodyData.dateOfBirth && typeof bodyData.dateOfBirth === "string") {
        bodyData.dateOfBirth = new Date(bodyData.dateOfBirth);
      }
      const guestData = insertGuestSchema.partial().parse(bodyData);
      const guest = await storage.updateGuest(id, guestData);
      wsEvents.guestUpdated(user.hotelId, guest);
      res.json(guest);
    } catch (error) {
      console.error("Guest update error:", error);
      res.status(400).json({ message: "Failed to update guest" });
    }
  });
  app2.delete("/api/hotels/current/guests/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      await storage.deleteGuest(id);
      res.json({ message: "Guest deleted successfully (soft delete)" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete guest" });
    }
  });
  app2.post("/api/hotels/current/guests/:id/restore", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const currentUser = req.user;
      const { id } = req.params;
      if (!currentUser?.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const canRestore = ["manager", "owner", "super_admin"].includes(currentUser.role?.name || "");
      if (!canRestore) {
        return res.status(403).json({
          message: "Only managers can restore deleted guest records"
        });
      }
      const guest = await storage.restoreGuest(id, currentUser.hotelId);
      res.json({
        ...guest,
        message: "Guest record restored successfully"
      });
    } catch (error) {
      console.error("Guest restore error:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to restore guest"
      });
    }
  });
  app2.get("/api/hotels/current/vouchers", async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const vouchers2 = await storage.getVouchersByHotel(user.hotelId);
      res.json(vouchers2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vouchers" });
    }
  });
  app2.get("/api/hotels/current/inventory-items", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      let items = await storage.getInventoryItemsByHotel(user.hotelId);
      const userRole = user.role?.name || "";
      if (userRole === "restaurant_bar_manager") {
        const allowedDepartments = ["kitchen", "bar", "barista"];
        items = items.filter((item) => {
          if (!item.departments || item.departments.length === 0) return true;
          return item.departments.some((dept) => allowedDepartments.includes(dept.toLowerCase()));
        });
      }
      res.json(items);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      res.status(500).json({ message: "Failed to fetch inventory items" });
    }
  });
  app2.get("/api/hotels/current/low-stock-items", async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const items = await storage.getLowStockItems(user.hotelId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch low stock items" });
    }
  });
  app2.get("/api/hotels/current/inventory/consumptions", async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const consumptions = await storage.getInventoryConsumptionsByHotel(user.hotelId);
      res.json(consumptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory consumptions" });
    }
  });
  app2.get("/api/hotels/current/inventory-consumptions", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const consumptions = await storage.getInventoryConsumptionsByHotel(user.hotelId);
      res.json(consumptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory consumptions" });
    }
  });
  app2.get("/api/hotels/current/menu-items", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const menuItems2 = await storage.getMenuItemsByHotel(user.hotelId);
      res.json(menuItems2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });
  app2.get("/api/hotels/current/restaurant-tables", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const tables = await storage.getRestaurantTablesByHotel(user.hotelId);
      res.json(tables);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch restaurant tables" });
    }
  });
  app2.get("/api/hotels/current/kot-orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const kotOrders2 = await storage.getKotOrdersByHotel(user.hotelId);
      res.json(kotOrders2);
    } catch (error) {
      console.error("Error fetching KOT orders:", error);
      res.status(500).json({ message: "Failed to fetch KOT orders" });
    }
  });
  app2.get("/api/hotels/current/menu-categories", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const categories = await storage.getMenuCategoriesByHotel(user.hotelId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu categories" });
    }
  });
  app2.post("/api/hotels/current/menu-categories", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { name } = req.body;
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: "Category name is required" });
      }
      const htmlTagPattern = /<[^>]*>/g;
      if (htmlTagPattern.test(name)) {
        return res.status(400).json({ message: "Category name cannot contain HTML tags" });
      }
      const category = await storage.createMenuCategory({
        hotelId: user.hotelId,
        name: name.trim()
      });
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Failed to create menu category" });
    }
  });
  app2.put("/api/hotels/current/menu-categories/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const { name } = req.body;
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: "Category name is required" });
      }
      const htmlTagPattern = /<[^>]*>/g;
      if (htmlTagPattern.test(name)) {
        return res.status(400).json({ message: "Category name cannot contain HTML tags" });
      }
      const categories = await storage.getMenuCategoriesByHotel(user.hotelId);
      const existingCategory = categories.find((cat) => cat.id === id);
      if (!existingCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      const category = await storage.updateMenuCategory(id, { name: name.trim() });
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Failed to update menu category" });
    }
  });
  app2.delete("/api/hotels/current/menu-categories/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const categories = await storage.getMenuCategoriesByHotel(user.hotelId);
      const existingCategory = categories.find((cat) => cat.id === id);
      if (!existingCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      await storage.deleteMenuCategory(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete menu category" });
    }
  });
  app2.post("/api/hotels/current/menu-items", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const sanitizedBody = sanitizeObject(req.body);
      const itemData = insertMenuItemSchema.parse({
        ...sanitizedBody,
        hotelId: user.hotelId
      });
      const item = await storage.createMenuItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Menu item creation error:", error);
      res.status(400).json({ message: "Invalid menu item data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.put("/api/hotels/current/menu-items/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const itemData = insertMenuItemSchema.partial().parse(req.body);
      const existingItem = await storage.getMenuItem(id);
      if (!existingItem || existingItem.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      if ("price" in itemData && itemData.price !== void 0 && String(itemData.price) !== String(existingItem.price)) {
        const canChangePrice = ["manager", "owner", "restaurant_bar_manager", "super_admin"].includes(user.role?.name || "");
        if (!canChangePrice) {
          return res.status(403).json({
            message: "Only managers can change menu item prices"
          });
        }
        await storage.createPriceChangeLog({
          hotelId: user.hotelId,
          itemId: id,
          itemType: "menu_item",
          itemName: existingItem.name || "Unknown Item",
          previousPrice: existingItem.price || "0",
          newPrice: itemData.price,
          changedBy: user.id
        });
      }
      const item = await storage.updateMenuItem(id, itemData);
      res.json(item);
    } catch (error) {
      console.error("Menu item update error:", error);
      res.status(400).json({ message: "Failed to update menu item" });
    }
  });
  app2.delete("/api/hotels/current/menu-items/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const existingItem = await storage.getMenuItem(id);
      if (!existingItem || existingItem.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      await storage.deleteMenuItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete menu item" });
    }
  });
  app2.post("/api/hotels/current/restaurant-tables", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { name, capacity, status } = req.body;
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: "Table name is required" });
      }
      const capacityNum = Number(capacity);
      if (!Number.isInteger(capacityNum) || capacityNum <= 0) {
        return res.status(400).json({ message: "Capacity must be a positive integer" });
      }
      const validStatuses = ["available", "occupied", "reserved"];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          message: `Status must be one of: ${validStatuses.join(", ")}`
        });
      }
      const tableData = {
        ...req.body,
        hotelId: user.hotelId,
        status: status || "available"
        // Default to available if not provided
      };
      const table = await storage.createRestaurantTable(tableData);
      res.status(201).json(table);
    } catch (error) {
      res.status(400).json({ message: "Failed to create table" });
    }
  });
  app2.put("/api/hotels/current/restaurant-tables/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const { name, capacity, status } = req.body;
      const existingTable = await storage.getRestaurantTable(id);
      if (!existingTable || existingTable.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Table not found" });
      }
      if (name !== void 0 && (!name || name.trim().length === 0)) {
        return res.status(400).json({ message: "Table name cannot be empty" });
      }
      if (capacity !== void 0) {
        const capacityNum = Number(capacity);
        if (!Number.isInteger(capacityNum) || capacityNum <= 0) {
          return res.status(400).json({ message: "Capacity must be a positive integer" });
        }
      }
      if (status !== void 0) {
        const validStatuses = ["available", "occupied", "reserved"];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            message: `Status must be one of: ${validStatuses.join(", ")}`
          });
        }
      }
      const table = await storage.updateRestaurantTable(id, req.body);
      res.json(table);
    } catch (error) {
      res.status(400).json({ message: "Failed to update table" });
    }
  });
  app2.delete("/api/hotels/current/restaurant-tables/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const existingTable = await storage.getRestaurantTable(id);
      if (!existingTable || existingTable.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Table not found" });
      }
      await storage.deleteRestaurantTable(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete table" });
    }
  });
  app2.get("/api/hotels/current/tasks", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const tasks2 = await storage.getTasksByHotel(user.hotelId);
      res.json(tasks2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });
  app2.post("/api/hotels/current/tasks", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const taskData = insertTaskSchema.parse({
        ...req.body,
        hotelId: user.hotelId,
        createdBy: user.id,
        assignedTo: req.body.assignedTo || req.body.assignedToId
        // Handle both field names for compatibility
      });
      const task = await storage.createTask(taskData);
      wsEvents.taskCreated(user.hotelId, task);
      res.status(201).json(task);
    } catch (error) {
      console.error("Task creation error:", error);
      if (error && typeof error === "object" && "errors" in error) {
        res.status(400).json({
          message: "Invalid task data",
          errors: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`)
        });
      } else {
        res.status(400).json({ message: error?.message || "Invalid task data" });
      }
    }
  });
  app2.put("/api/hotels/current/tasks/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      const { id } = req.params;
      const taskData = req.body;
      const existingTask = await storage.getTask(id);
      if (!existingTask || existingTask.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Task not found" });
      }
      const isManager = ["manager", "owner", "security_head", "housekeeping_supervisor"].includes(user.role?.name || "");
      const isAssignedUser = existingTask.assignedTo === user.id;
      let updateData = {};
      if (isAssignedUser && !isManager) {
        if (taskData.status === "completed") {
          updateData = {
            status: "pending_review",
            completionNotes: taskData.completionNotes || taskData.notes,
            updatedAt: /* @__PURE__ */ new Date()
          };
        } else if (taskData.status === "in_progress") {
          updateData = { status: "in_progress", updatedAt: /* @__PURE__ */ new Date() };
        } else {
          return res.status(403).json({
            message: "You can only mark tasks as in progress. Completion requires manager approval."
          });
        }
      } else if (isManager) {
        updateData = taskData;
        if (taskData.status === "completed" && existingTask.status === "pending_review") {
          updateData.approvedBy = user.id;
          updateData.approvedAt = /* @__PURE__ */ new Date();
        }
      } else {
        return res.status(403).json({
          message: "You can only update tasks assigned to you"
        });
      }
      const task = await storage.updateTask(id, updateData);
      wsEvents.taskUpdated(user.hotelId, task);
      res.json(task);
    } catch (error) {
      console.error("Task update error:", error);
      res.status(400).json({ message: "Failed to update task" });
    }
  });
  app2.delete("/api/hotels/current/tasks/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const existingTask = await storage.getTask(id);
      if (!existingTask || existingTask.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Task not found" });
      }
      await storage.deleteTask(id);
      wsEvents.taskDeleted(user.hotelId, id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete task" });
    }
  });
  app2.get("/api/hotels/current/room-cleaning-queue", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const queue = await storage.getRoomCleaningQueueByHotel(user.hotelId);
      res.json(queue);
    } catch (error) {
      console.error("Room cleaning queue fetch error:", error);
      res.status(500).json({ message: "Failed to fetch room cleaning queue" });
    }
  });
  app2.patch("/api/room-cleaning-queue/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { id } = req.params;
      const { status, taskId } = req.body;
      const updateData = {};
      if (status) updateData.status = status;
      if (taskId !== void 0) updateData.taskId = taskId;
      const queue = await storage.updateRoomCleaningQueue(id, updateData);
      res.json(queue);
    } catch (error) {
      console.error("Room cleaning queue update error:", error);
      res.status(400).json({ message: "Failed to update room cleaning queue" });
    }
  });
  app2.get("/api/hotels/current/maintenance-requests", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const requests = await storage.getMaintenanceRequestsByHotel(user.hotelId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch maintenance requests" });
    }
  });
  app2.post("/api/hotels/current/maintenance-requests", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      let assignedTo = req.body.assignedTo;
      const userRole = user.role?.name || "";
      const rolesAssignedToSecurityHead = ["waiter", "kitchen_staff", "bartender", "barista", "security_guard", "surveillance_officer"];
      const rolesAssignedToManager = ["front_desk", "storekeeper"];
      const rolesAssignedToHousekeepingSupervisor = ["housekeeping_staff"];
      if (rolesAssignedToSecurityHead.includes(userRole)) {
        const securityHeadRole = await storage.getRoleByName("security_head");
        if (securityHeadRole) {
          const users2 = await storage.getUsersByHotel(user.hotelId);
          const securityHead = users2.find((u) => u.roleId === securityHeadRole.id && u.isActive);
          if (securityHead) {
            assignedTo = securityHead.id;
          }
        }
      } else if (rolesAssignedToManager.includes(userRole)) {
        const managerRole = await storage.getRoleByName("manager");
        if (managerRole) {
          const users2 = await storage.getUsersByHotel(user.hotelId);
          const manager = users2.find((u) => u.roleId === managerRole.id && u.isActive);
          if (manager) {
            assignedTo = manager.id;
          }
        }
      } else if (rolesAssignedToHousekeepingSupervisor.includes(userRole)) {
        const housekeepingSupervisorRole = await storage.getRoleByName("housekeeping_supervisor");
        if (housekeepingSupervisorRole) {
          const users2 = await storage.getUsersByHotel(user.hotelId);
          const housekeepingSupervisor = users2.find((u) => u.roleId === housekeepingSupervisorRole.id && u.isActive);
          if (housekeepingSupervisor) {
            assignedTo = housekeepingSupervisor.id;
          }
        }
      }
      const requestData = insertMaintenanceRequestSchema.parse({
        ...req.body,
        hotelId: user.hotelId,
        reportedBy: user.id,
        assignedTo
      });
      const request = await storage.createMaintenanceRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      console.error("Maintenance request creation error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors
        });
      }
      res.status(400).json({
        message: error.message || "Invalid maintenance request data"
      });
    }
  });
  app2.put("/api/hotels/current/maintenance-requests/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const currentUser = req.user;
      if (!currentUser || !currentUser.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const updateData = req.body;
      const existingRequest = await storage.getMaintenanceRequest(id);
      if (!existingRequest || existingRequest.hotelId !== currentUser.hotelId) {
        return res.status(404).json({ message: "Maintenance request not found" });
      }
      if ("assignedTo" in updateData && updateData.assignedTo !== existingRequest.assignedTo) {
        const canReassign = ["manager", "owner", "security_head", "housekeeping_supervisor", "restaurant_bar_manager"].includes(currentUser.role?.name || "");
        if (!canReassign) {
          return res.status(403).json({
            message: "Only supervisors can reassign maintenance requests"
          });
        }
        await storage.createAuditLog({
          hotelId: currentUser.hotelId,
          resourceType: "maintenance_request",
          resourceId: id,
          action: "reassigned",
          userId: currentUser.id,
          details: {
            previousAssignee: existingRequest.assignedTo,
            newAssignee: updateData.assignedTo,
            timestamp: /* @__PURE__ */ new Date()
          }
        });
      }
      const isAssigned = existingRequest.assignedTo === currentUser.id;
      const isSupervisor = ["manager", "owner", "security_head", "housekeeping_supervisor", "restaurant_bar_manager"].includes(currentUser.role?.name || "");
      if (!isAssigned && !isSupervisor) {
        return res.status(403).json({
          message: "You can only update requests assigned to you"
        });
      }
      if (updateData.status === "resolved" && !updateData.resolvedAt) {
        updateData.resolvedAt = /* @__PURE__ */ new Date();
      }
      if (updateData.status === "approved" && !updateData.approvedAt) {
        updateData.approvedAt = /* @__PURE__ */ new Date();
        updateData.approvedBy = currentUser.id;
      }
      if (updateData.status === "declined" && !updateData.declinedAt) {
        updateData.declinedAt = /* @__PURE__ */ new Date();
        updateData.declinedBy = currentUser.id;
      }
      const requestData = insertMaintenanceRequestSchema.partial().parse(updateData);
      const request = await storage.updateMaintenanceRequest(id, requestData);
      res.json(request);
    } catch (error) {
      console.error("Maintenance request update error:", error);
      res.status(400).json({ message: "Failed to update maintenance request" });
    }
  });
  app2.post("/api/hotels/current/users", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const currentUser = req.user;
      if (!currentUser?.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const rolePermissions = {
        owner: [
          "manager",
          "restaurant_bar_manager",
          "storekeeper",
          "front_desk",
          "housekeeping_supervisor",
          "security_head",
          "waiter",
          "kitchen_staff",
          "housekeeping_staff",
          "security_guard",
          "cashier",
          "finance",
          "bartender",
          "barista"
        ],
        manager: ["waiter", "kitchen_staff", "housekeeping_staff", "security_guard", "cashier", "front_desk"],
        restaurant_bar_manager: ["waiter", "kitchen_staff", "bartender", "barista"],
        security_head: ["security_guard", "surveillance_officer"],
        housekeeping_supervisor: ["housekeeping_staff"]
        // Other roles cannot create users
      };
      const currentRole = currentUser.role?.name || "";
      const allowedRoles = rolePermissions[currentRole] || [];
      if (allowedRoles.length === 0) {
        return res.status(403).json({
          message: "You don't have permission to create users"
        });
      }
      const { role, password, confirmPassword, ...userData } = req.body;
      let roleId = userData.roleId;
      let targetRoleName = role;
      if (role && !roleId) {
        const roleRecord = await storage.getRoleByName(role);
        if (roleRecord) {
          roleId = roleRecord.id;
          targetRoleName = roleRecord.name;
        } else {
          return res.status(400).json({ message: `Role '${role}' not found` });
        }
      }
      if (!allowedRoles.includes(targetRoleName)) {
        return res.status(403).json({
          message: `You don't have permission to create users with role '${targetRoleName}'`
        });
      }
      if (!password || password.length < 8) {
        return res.status(400).json({
          message: "Password must be at least 8 characters"
        });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({
          message: "Passwords don't match"
        });
      }
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({
          message: "Username already exists"
        });
      }
      const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
      const hashedPassword = await hashPassword2(password);
      const finalUserData = insertUserSchema.parse({
        ...userData,
        roleId,
        hotelId: currentUser.hotelId,
        passwordHash: hashedPassword,
        createdBy: currentUser.id,
        isActive: true
      });
      const user = await storage.createUser(finalUserData);
      const { passwordHash: _, ...sanitizedUser } = user;
      res.status(201).json(sanitizedUser);
    } catch (error) {
      console.error("User creation error:", error);
      res.status(400).json({ message: "Failed to create user" });
    }
  });
  app2.put("/api/hotels/current/users/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const currentUser = req.user;
      if (!currentUser?.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const userData = req.body;
      if ("passwordHash" in userData) {
        return res.status(403).json({
          message: "Cannot change passwords through this endpoint. Use the password reset functionality."
        });
      }
      const existingUser = await storage.getUser(id);
      if (!existingUser || existingUser.hotelId !== currentUser.hotelId) {
        return res.status(404).json({ message: "User not found" });
      }
      if (currentUser.id === id) {
        const protectedFields = ["roleId", "isActive", "hotelId", "createdBy", "verification"];
        const attemptedProtectedUpdate = protectedFields.some((field) => field in userData);
        if (attemptedProtectedUpdate) {
          return res.status(403).json({
            message: "Cannot modify your own role, status, or hotel assignment. Contact your manager."
          });
        }
      }
      if (currentUser.id !== id) {
        const currentRole = currentUser.role?.name || "";
        const canUpdateUsers = ["owner", "manager", "security_head"].includes(currentRole);
        if (!canUpdateUsers) {
          return res.status(403).json({
            message: "You don't have permission to update other users"
          });
        }
        if ("roleId" in userData || "isActive" in userData) {
          if (currentRole !== "owner") {
            return res.status(403).json({
              message: "Only the hotel owner can change user roles or activation status"
            });
          }
        }
      }
      const user = await storage.updateUser(id, userData);
      const { passwordHash: _, ...sanitizedUser } = user;
      res.json(sanitizedUser);
    } catch (error) {
      res.status(400).json({ message: "Failed to update user" });
    }
  });
  app2.delete("/api/hotels/current/users/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const currentUser = req.user;
      if (!currentUser?.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const existingUser = await storage.getUser(id);
      if (!existingUser || existingUser.hotelId !== currentUser.hotelId) {
        return res.status(404).json({ message: "User not found" });
      }
      if (currentUser.id === id) {
        return res.status(403).json({
          message: "Cannot delete your own account. Contact your manager."
        });
      }
      const currentRole = currentUser.role?.name || "";
      const canDeleteUsers = ["owner", "manager"].includes(currentRole);
      if (!canDeleteUsers) {
        return res.status(403).json({
          message: "You don't have permission to delete users"
        });
      }
      await storage.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete user" });
    }
  });
  app2.post("/api/hotels/current/inventory-items", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { name, sku, unit, baseStockQty, costPerUnit } = req.body;
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: "Item name is required" });
      }
      if (!sku || sku.trim().length === 0) {
        return res.status(400).json({ message: "SKU is required" });
      }
      if (!unit || unit.trim().length === 0) {
        return res.status(400).json({ message: "Unit is required" });
      }
      if (baseStockQty !== void 0 && baseStockQty !== null) {
        const stockNum = Number(baseStockQty);
        if (!Number.isFinite(stockNum) || stockNum < 0) {
          return res.status(400).json({ message: "Stock quantity must be a non-negative number" });
        }
      }
      if (costPerUnit !== void 0 && costPerUnit !== null) {
        const costNum = Number(costPerUnit);
        if (!Number.isFinite(costNum) || costNum < 0) {
          return res.status(400).json({ message: "Cost per unit must be a non-negative number" });
        }
      }
      const itemData = {
        ...req.body,
        hotelId: user.hotelId
      };
      const item = await storage.createInventoryItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Failed to create inventory item" });
    }
  });
  app2.put("/api/hotels/current/inventory-items/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const itemData = req.body;
      const existingItem = await storage.getInventoryItem(id);
      if (!existingItem || existingItem.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      const item = await storage.updateInventoryItem(id, itemData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Failed to update inventory item" });
    }
  });
  app2.delete("/api/hotels/current/inventory-items/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const existingItem = await storage.getInventoryItem(id);
      if (!existingItem || existingItem.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      await storage.deleteInventoryItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete inventory item" });
    }
  });
  app2.get("/api/hotels/current/inventory-transactions", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
      const transactions2 = await storage.getInventoryTransactionsByHotel(user.hotelId);
      res.json(transactions2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory transactions" });
    }
  });
  app2.post("/api/hotels/current/inventory-transactions", requireActiveUser, async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const transactionData = req.body;
      const transactionType = transactionData.transactionType;
      const validTypes = ["receive", "issue", "return", "adjustment", "wastage"];
      if (!validTypes.includes(transactionType)) {
        return res.status(400).json({ message: "Invalid transaction type" });
      }
      const qtyBase = Number(transactionData.qtyBase);
      if (isNaN(qtyBase) || transactionData.qtyBase === null || transactionData.qtyBase === void 0) {
        return res.status(400).json({ message: "Valid quantity (qtyBase) is required" });
      }
      if (transactionType !== "adjustment") {
        if (qtyBase <= 0) {
          return res.status(400).json({
            message: `Quantity must be positive for ${transactionType} transactions`
          });
        }
      } else {
        if (qtyBase === 0) {
          return res.status(400).json({
            message: "Adjustment quantity cannot be zero"
          });
        }
      }
      if (transactionType === "receive") {
        const canReceive = ["storekeeper", "manager", "owner", "super_admin"].includes(user.role?.name || "");
        if (!canReceive) {
          return res.status(403).json({
            message: "Only storekeeper or manager can receive inventory"
          });
        }
        const supplierName = transactionData.supplierName?.trim();
        const referenceNumber = transactionData.referenceNumber?.trim();
        if ((!supplierName || supplierName.length === 0) && (!referenceNumber || referenceNumber.length === 0)) {
          return res.status(400).json({
            message: "Supplier name or purchase reference required for receiving inventory"
          });
        }
      }
      if (transactionType === "issue" || transactionType === "wastage") {
        const item = await storage.getInventoryItem(transactionData.itemId);
        if (!item) {
          return res.status(404).json({ message: "Inventory item not found" });
        }
        const currentStock = Number(item.baseStockQty || item.stockQty || 0);
        const requestedQty = Number(transactionData.qtyBase || 0);
        if (requestedQty > currentStock) {
          return res.status(400).json({
            message: `Insufficient stock. Available: ${currentStock}, Requested: ${requestedQty}`
          });
        }
        if (transactionType === "wastage") {
          const notes = transactionData.notes?.trim();
          if (!notes || notes.length === 0) {
            return res.status(400).json({
              message: "Wastage requires detailed notes explaining the reason"
            });
          }
        }
      }
      if (transactionType === "adjustment") {
        const item = await storage.getInventoryItem(transactionData.itemId);
        const currentStock = Number(item?.baseStockQty || item?.stockQty || 0);
        const adjustmentDelta = Number(transactionData.qtyBase || 0);
        const adjustmentMagnitude = Math.abs(adjustmentDelta);
        if (adjustmentMagnitude > currentStock * 0.5) {
          const isManager = ["manager", "owner", "super_admin"].includes(user.role?.name || "");
          if (!isManager) {
            return res.status(403).json({
              message: "Large inventory adjustments require manager approval"
            });
          }
        }
        const notes = transactionData.notes?.trim();
        if (!notes || notes.length === 0) {
          return res.status(400).json({
            message: "Inventory adjustments require detailed notes"
          });
        }
        if (currentStock + adjustmentDelta < 0) {
          return res.status(400).json({
            message: `Adjustment would result in negative stock: Current ${currentStock}, Delta ${adjustmentDelta}`
          });
        }
      }
      const finalTransactionData = {
        ...transactionData,
        hotelId: user.hotelId,
        createdBy: user.id,
        recordedBy: user.id
      };
      const transaction = await storage.createInventoryTransaction(finalTransactionData);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Inventory transaction error:", error);
      res.status(400).json({ message: "Failed to create inventory transaction", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/hotels/current/room-types", async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const roomTypes2 = await storage.getRoomTypesByHotel(user.hotelId);
      res.json(roomTypes2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch room types" });
    }
  });
  app2.post("/api/room-types", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const roomTypeData = insertRoomTypeSchema.parse({
        ...req.body,
        hotelId: user.hotelId
      });
      const roomType = await storage.createRoomType(roomTypeData);
      res.status(201).json(roomType);
    } catch (error) {
      console.error("Room type creation error:", error);
      res.status(400).json({ message: "Invalid room type data" });
    }
  });
  app2.put("/api/room-types/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const roomTypeData = insertRoomTypeSchema.partial().parse(req.body);
      delete roomTypeData.hotelId;
      const roomType = await storage.updateRoomType(parseInt(id), user.hotelId, roomTypeData);
      if (!roomType) {
        return res.status(404).json({ message: "Room type not found" });
      }
      res.json(roomType);
    } catch (error) {
      res.status(400).json({ message: "Failed to update room type" });
    }
  });
  app2.delete("/api/room-types/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const deleted = await storage.deleteRoomType(parseInt(id), user.hotelId);
      if (!deleted) {
        return res.status(404).json({ message: "Room type not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete room type" });
    }
  });
  app2.get("/api/halls", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const halls2 = await storage.getHallsByHotel(user.hotelId);
      res.json(halls2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch halls" });
    }
  });
  app2.get("/api/hotels/current/halls", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const halls2 = await storage.getHallsByHotel(user.hotelId);
      res.json(halls2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch halls" });
    }
  });
  app2.get("/api/halls/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { id } = req.params;
      const hall = await storage.getHall(id);
      if (!hall) {
        return res.status(404).json({ message: "Hall not found" });
      }
      res.json(hall);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hall" });
    }
  });
  app2.post("/api/halls", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const hallData = insertHallSchema.parse(req.body);
      hallData.hotelId = user.hotelId;
      const hall = await storage.createHall(hallData);
      res.status(201).json(hall);
    } catch (error) {
      res.status(400).json({ message: "Failed to create hall" });
    }
  });
  app2.put("/api/halls/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const hallData = insertHallSchema.partial().parse(req.body);
      delete hallData.hotelId;
      const hall = await storage.updateHall(id, user.hotelId, hallData);
      if (!hall) {
        return res.status(404).json({ message: "Hall not found" });
      }
      res.json(hall);
    } catch (error) {
      res.status(400).json({ message: "Failed to update hall" });
    }
  });
  app2.delete("/api/halls/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const deleted = await storage.deleteHall(id, user.hotelId);
      if (!deleted) {
        return res.status(404).json({ message: "Hall not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete hall" });
    }
  });
  app2.get("/api/pools", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const pools2 = await storage.getPoolsByHotel(user.hotelId);
      res.json(pools2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pools" });
    }
  });
  app2.post("/api/pools", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const poolData = insertPoolSchema.parse(req.body);
      poolData.hotelId = user.hotelId;
      const pool = await storage.createPool(poolData);
      res.status(201).json(pool);
    } catch (error) {
      res.status(400).json({ message: "Failed to create pool" });
    }
  });
  app2.put("/api/pools/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const poolData = insertPoolSchema.partial().parse(req.body);
      delete poolData.hotelId;
      const pool = await storage.updatePool(id, user.hotelId, poolData);
      if (!pool) {
        return res.status(404).json({ message: "Pool not found" });
      }
      res.json(pool);
    } catch (error) {
      res.status(400).json({ message: "Failed to update pool" });
    }
  });
  app2.delete("/api/pools/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const deleted = await storage.deletePool(id, user.hotelId);
      if (!deleted) {
        return res.status(404).json({ message: "Pool not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete pool" });
    }
  });
  app2.get("/api/services", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const services2 = await storage.getServicesByHotel(user.hotelId);
      res.json(services2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });
  app2.post("/api/services", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const serviceData = insertServiceSchema.parse(req.body);
      serviceData.hotelId = user.hotelId;
      const service = await storage.createService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      res.status(400).json({ message: "Failed to create service" });
    }
  });
  app2.put("/api/services/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const serviceData = insertServiceSchema.partial().parse(req.body);
      delete serviceData.hotelId;
      const service = await storage.updateService(id, user.hotelId, serviceData);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(400).json({ message: "Failed to update service" });
    }
  });
  app2.delete("/api/services/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const deleted = await storage.deleteService(id, user.hotelId);
      if (!deleted) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete service" });
    }
  });
  app2.get("/api/hotels/current/reservations", async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const reservations = await storage.getRoomReservationsByHotel(user.hotelId);
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reservations" });
    }
  });
  app2.get("/api/hotels/current/taxes", async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const taxes = await storage.getHotelTaxes(user.hotelId);
      res.json(taxes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hotel taxes" });
    }
  });
  app2.post("/api/hotels/current/taxes", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      if (user.role?.name !== "owner" && user.role?.name !== "super_admin") {
        return res.status(403).json({
          message: "Only the hotel owner can modify tax settings"
        });
      }
      const { taxType, percent, isActive } = req.body;
      console.log("Tax update request:", { taxType, percent, isActive, percentType: typeof percent });
      const existingTax = await storage.getHotelTax(user.hotelId, taxType);
      await storage.createTaxChangeLog({
        hotelId: user.hotelId,
        taxType,
        previousPercent: existingTax?.percent || null,
        newPercent: percent !== void 0 ? percent : null,
        previousActive: existingTax?.isActive ?? void 0,
        newActive: isActive,
        changedBy: user.id
      });
      const tax = await storage.updateHotelTax(user.hotelId, taxType, isActive, percent);
      res.json(tax);
    } catch (error) {
      console.error("Tax update error:", error);
      res.status(400).json({ message: "Failed to update tax" });
    }
  });
  app2.get("/api/hotels/current/payments", async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const payments2 = await storage.getPaymentsByHotel(user.hotelId);
      res.json(payments2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });
  app2.get("/api/hotels/:id", requireActiveUser, async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.user;
      if (currentUser.role?.name !== "super_admin" && currentUser.hotelId !== id) {
        return res.status(403).json({ message: "Access denied" });
      }
      const hotel = await storage.getHotel(id);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      res.json(hotel);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hotel" });
    }
  });
  app2.get("/api/hotels/:hotelId/users", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user;
      if (currentUser.role?.name !== "super_admin" && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const users2 = await storage.getUsersByHotel(hotelId);
      const sanitizedUsers = users2.map((user) => {
        const { passwordHash: _, ...sanitizedUser } = user;
        return sanitizedUser;
      });
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.post("/api/users", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const currentUser = req.user;
      const { role, password, confirmPassword, firstName, lastName, ...userData } = req.body;
      let roleId = userData.roleId;
      let targetRoleName = role;
      if (role && !roleId) {
        const roleRecord = await storage.getRoleByName(role);
        if (roleRecord) {
          roleId = roleRecord.id;
          targetRoleName = roleRecord.name;
        } else {
          return res.status(400).json({ message: `Role '${role}' not found` });
        }
      } else if (roleId && !role) {
        const roleRecord = await storage.getRole(roleId);
        if (roleRecord) {
          targetRoleName = roleRecord.name;
        } else {
          return res.status(400).json({ message: `Role with ID '${roleId}' not found` });
        }
      }
      const currentUserRoleName = currentUser.role?.name || "";
      const rolePermissions = {
        super_admin: ["super_admin", "owner"],
        owner: ["manager", "housekeeping_supervisor", "restaurant_bar_manager", "security_head", "finance"],
        manager: ["housekeeping_supervisor", "restaurant_bar_manager", "security_head", "finance", "front_desk", "storekeeper"],
        housekeeping_supervisor: ["housekeeping_staff"],
        restaurant_bar_manager: ["waiter", "kitchen_staff", "bartender", "barista", "cashier"],
        security_head: ["security_guard", "surveillance_officer"]
      };
      const allowedRoles = rolePermissions[currentUserRoleName] || [];
      if (!allowedRoles.includes(targetRoleName)) {
        return res.status(403).json({
          message: `You do not have permission to create users with role '${targetRoleName}'`,
          allowedRoles
        });
      }
      let hashedPassword = userData.passwordHash;
      if (password) {
        const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
        hashedPassword = await hashPassword2(password);
      }
      let hotelId = userData.hotelId;
      if (currentUserRoleName === "super_admin") {
        if (!hotelId) {
          return res.status(400).json({
            message: "Super admin must specify a hotelId when creating users"
          });
        }
      } else {
        if (!hotelId && currentUser.hotelId) {
          hotelId = currentUser.hotelId;
        }
        if (!hotelId) {
          return res.status(400).json({
            message: "User not associated with a hotel"
          });
        }
      }
      const processedUserData = {
        ...userData,
        roleId,
        hotelId,
        passwordHash: hashedPassword,
        verification: userData.verification || {},
        createdBy: currentUser.id
      };
      const validatedData = insertUserSchema.parse(processedUserData);
      const user = await storage.createUser(validatedData);
      const { passwordHash: _, ...sanitizedUser } = user;
      res.status(201).json(sanitizedUser);
    } catch (error) {
      console.error("User creation error:", error);
      if (error && typeof error === "object" && "errors" in error) {
        res.status(400).json({
          message: "Invalid user data",
          errors: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`)
        });
      } else {
        res.status(400).json({ message: error?.message || "Invalid user data" });
      }
    }
  });
  app2.delete("/api/users/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const currentUser = req.user;
      const { id } = req.params;
      const targetUser = await storage.getUser(id);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const currentUserRoleName = currentUser.role?.name || "";
      const targetUserRoleName = targetUser.role?.name || "";
      const roleDeletionPermissions = {
        super_admin: ["super_admin", "owner", "manager", "housekeeping_supervisor", "restaurant_bar_manager", "security_head", "finance", "front_desk", "housekeeping_staff", "waiter", "kitchen_staff", "bartender", "barista", "cashier", "security_guard"],
        owner: ["manager", "housekeeping_supervisor", "restaurant_bar_manager", "security_head", "finance", "front_desk", "housekeeping_staff", "waiter", "kitchen_staff", "bartender", "barista", "cashier", "security_guard"],
        manager: ["housekeeping_supervisor", "restaurant_bar_manager", "security_head", "finance", "front_desk", "housekeeping_staff", "waiter", "kitchen_staff", "bartender", "barista", "cashier", "security_guard"],
        housekeeping_supervisor: ["housekeeping_staff"],
        restaurant_bar_manager: ["waiter", "kitchen_staff", "bartender", "barista", "cashier"],
        security_head: ["security_guard"]
      };
      const allowedRolesToDelete = roleDeletionPermissions[currentUserRoleName] || [];
      if (!allowedRolesToDelete.includes(targetUserRoleName)) {
        return res.status(403).json({
          message: `You do not have permission to delete users with role '${targetUserRoleName}'`
        });
      }
      if (currentUser.role?.name !== "super_admin") {
        if (targetUser.hotelId !== currentUser.hotelId) {
          return res.status(403).json({ message: "Cannot delete users from other hotels" });
        }
      }
      await storage.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      console.error("User deletion error:", error);
      res.status(400).json({ message: "Failed to delete user" });
    }
  });
  app2.put("/api/users/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const currentUser = req.user;
      const { id } = req.params;
      const userData = insertUserSchema.partial().parse(req.body);
      if ("passwordHash" in userData) {
        return res.status(403).json({
          message: "Cannot change passwords through this endpoint. Use the password reset functionality."
        });
      }
      const targetUser = await storage.getUser(id);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const currentRole = currentUser.role?.name || "";
      if (currentRole !== "super_admin") {
        if (!targetUser.hotelId || targetUser.hotelId !== currentUser.hotelId) {
          return res.status(403).json({ message: "Cannot update users from other hotels" });
        }
      }
      if (currentUser.id === id) {
        const protectedFields = ["roleId", "isActive", "hotelId", "createdBy", "verification"];
        const attemptedProtectedUpdate = protectedFields.some((field) => field in userData);
        if (attemptedProtectedUpdate) {
          return res.status(403).json({
            message: "Cannot modify your own role, status, or hotel assignment. Contact your manager."
          });
        }
      }
      if (currentUser.id !== id) {
        const canUpdateUsers = ["owner", "manager", "super_admin"].includes(currentRole);
        if (!canUpdateUsers) {
          return res.status(403).json({
            message: "You don't have permission to update other users"
          });
        }
        if ("roleId" in userData || "isActive" in userData) {
          if (!["owner", "super_admin"].includes(currentRole)) {
            return res.status(403).json({
              message: "Only the hotel owner can change user roles or activation status"
            });
          }
        }
      }
      const user = await storage.updateUser(id, userData);
      const { passwordHash: _, ...sanitizedUser } = user;
      res.json(sanitizedUser);
    } catch (error) {
      res.status(400).json({ message: "Failed to update user" });
    }
  });
  app2.get("/api/users", async (req, res) => {
    try {
      const allUsers = await db.select({
        id: users.id,
        hotelId: users.hotelId,
        roleId: users.roleId,
        username: users.username,
        email: users.email,
        phone: users.phone,
        passwordHash: users.passwordHash,
        isActive: users.isActive,
        isOnline: users.isOnline,
        lastLogin: users.lastLogin,
        lastLogout: users.lastLogout,
        createdBy: users.createdBy,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        deletedAt: users.deletedAt,
        verification: users.verification,
        role: roles
      }).from(users).leftJoin(roles, eq2(users.roleId, roles.id)).where(isNull2(users.deletedAt)).orderBy(asc2(users.username));
      res.json(allUsers.map((user) => {
        const { passwordHash: _, ...sanitizedUser } = user;
        return {
          ...sanitizedUser,
          role: user.role || void 0
        };
      }));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.post("/api/users/:id/duty", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const currentUser = req.user;
      const { id } = req.params;
      const { isOnline } = req.body;
      if (currentUser.id !== id) {
        return res.status(403).json({ message: "Cannot update another user's duty status" });
      }
      const user = await storage.getUser(id);
      if (!user || !user.isActive) {
        return res.status(403).json({
          message: "Your account has been deactivated. Contact your manager."
        });
      }
      await storage.updateUserOnlineStatus(id, isOnline);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to update duty status" });
    }
  });
  app2.post("/api/manager/reset-staff-password", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const currentUser = req.user;
      const { targetUserId, newPassword } = req.body;
      if (!targetUserId || !newPassword) {
        return res.status(400).json({
          message: "Target user ID and new password are required"
        });
      }
      const currentRole = currentUser.role?.name || "";
      if (!["manager", "owner"].includes(currentRole)) {
        return res.status(403).json({
          message: "Only managers and owners can reset staff passwords"
        });
      }
      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "Target user not found" });
      }
      if (currentRole !== "super_admin" && targetUser.hotelId !== currentUser.hotelId) {
        return res.status(403).json({
          message: "Cannot reset passwords for users in other hotels"
        });
      }
      const targetRole = targetUser.role?.name || "";
      const managerCanReset = ["waiter", "kitchen_staff", "housekeeping_staff", "security_guard", "cashier", "front_desk", "storekeeper"];
      const ownerCanReset = [...managerCanReset, "manager", "housekeeping_supervisor", "restaurant_bar_manager", "security_head", "finance"];
      let canResetThisRole = false;
      if (currentRole === "owner") {
        canResetThisRole = ownerCanReset.includes(targetRole);
      } else if (currentRole === "manager") {
        canResetThisRole = managerCanReset.includes(targetRole);
      }
      if (!canResetThisRole) {
        return res.status(403).json({
          message: `You do not have permission to reset passwords for ${targetRole} role`
        });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({
          message: "New password must be at least 8 characters"
        });
      }
      const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
      const hashedPassword = await hashPassword2(newPassword);
      await storage.updateUser(targetUserId, { passwordHash: hashedPassword });
      await logAudit({
        userId: currentUser.id,
        hotelId: currentUser.hotelId || void 0,
        action: "manager_reset_staff_password",
        resourceType: "user",
        resourceId: targetUserId,
        details: {
          managerUsername: currentUser.username,
          targetUsername: targetUser.username,
          targetRole
        },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        success: true
      });
      res.json({
        message: "Password reset successfully",
        username: targetUser.username
      });
    } catch (error) {
      console.error("Manager password reset error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
  app2.get("/api/roles", async (req, res) => {
    try {
      const roles2 = await storage.getAllRoles();
      res.json(roles2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });
  app2.get("/api/hotels/:hotelId/rooms", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user;
      if (currentUser.role?.name !== "super_admin" && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const rooms2 = await storage.getRoomsByHotel(hotelId);
      res.json(rooms2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });
  app2.post("/api/rooms", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const currentUser = req.user;
      if (!currentUser?.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const roomData = insertRoomSchema.parse({
        ...req.body,
        hotelId: currentUser.hotelId
      });
      const room = await storage.createRoom(roomData);
      res.status(201).json(room);
    } catch (error) {
      console.error("Room creation error:", error);
      res.status(400).json({ message: "Failed to create room" });
    }
  });
  app2.put("/api/rooms/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const currentUser = req.user;
      const { id } = req.params;
      const updateData = req.body;
      const existingRoom = await storage.getRoom(id);
      if (!existingRoom || existingRoom.hotelId !== currentUser.hotelId) {
        return res.status(404).json({ message: "Room not found" });
      }
      const isStatusChange = "status" in updateData && updateData.status !== existingRoom.status;
      if (isStatusChange) {
        const canChangeStatus = ["manager", "owner", "housekeeping_supervisor"].includes(currentUser.role?.name || "");
        if (!canChangeStatus) {
          return res.status(403).json({
            message: "Only supervisors can change room status"
          });
        }
        if (updateData.status === "maintenance" && !updateData.maintenanceReason) {
          return res.status(400).json({
            message: "Maintenance status requires a reason"
          });
        }
      }
      const { occupantDetails, maintenanceReason, statusChangeReason, ...restBody } = updateData;
      const validatedData = insertRoomSchema.partial().parse(restBody);
      const roomData = occupantDetails !== void 0 ? { ...validatedData, occupantDetails } : validatedData;
      const isCheckout = existingRoom.isOccupied && roomData.isOccupied === false;
      if (isCheckout && existingRoom.occupantDetails) {
        const occupant = existingRoom.occupantDetails;
        const guestName = occupant?.guestName || occupant?.firstName ? `${occupant.firstName || ""} ${occupant.lastName || ""}`.trim() : "Guest";
        await storage.createRoomCleaningQueue({
          hotelId: existingRoom.hotelId,
          roomId: existingRoom.id,
          roomNumber: existingRoom.roomNumber || "Unknown",
          guestName,
          guestId: occupant?.guestId || null,
          status: "pending"
        });
      }
      const room = await storage.updateRoom(id, roomData);
      if (isStatusChange) {
        await storage.createRoomStatusLog({
          roomId: id,
          roomNumber: existingRoom.roomNumber || "Unknown",
          previousStatus: existingRoom.status || "",
          newStatus: updateData.status,
          reason: updateData.maintenanceReason || updateData.statusChangeReason || null,
          changedBy: currentUser.id
        });
      }
      wsEvents.roomStatusUpdated(currentUser.hotelId, room);
      res.json(room);
    } catch (error) {
      console.error("Room update error:", error);
      res.status(400).json({ message: "Failed to update room", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.delete("/api/rooms/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteRoom(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete room" });
    }
  });
  app2.post("/api/reservations", async (req, res) => {
    try {
      const reservationData = insertRoomReservationSchema.parse(req.body);
      const reservation = await storage.createRoomReservation(reservationData);
      await storage.updateRoom(reservationData.roomId, {
        status: "reserved",
        currentReservationId: reservation.id
      });
      res.status(201).json(reservation);
    } catch (error) {
      console.error("Reservation creation error:", error);
      if (error instanceof Error && error.message.includes("already booked")) {
        return res.status(409).json({
          message: "Room is not available for the selected dates. Please choose different dates or another room."
        });
      }
      res.status(400).json({
        message: "Failed to create reservation",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/reservations/:id/check-in", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const currentUser = req.user;
      const { id } = req.params;
      const reservation = await storage.checkInGuest(id);
      wsEvents.roomStatusUpdated(currentUser.hotelId, {
        id: reservation.roomId,
        status: "occupied",
        isOccupied: true
      });
      res.json(reservation);
    } catch (error) {
      console.error("Check-in error:", error);
      res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to check in guest"
      });
    }
  });
  app2.patch("/api/reservations/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const currentUser = req.user;
      const { id } = req.params;
      const { paidAmount } = req.body;
      const reservation = await storage.getRoomReservation(id);
      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }
      if (reservation.hotelId !== currentUser.hotelId) {
        return res.status(404).json({ message: "Reservation not found" });
      }
      const updated = await storage.updateRoomReservation(id, { paidAmount });
      res.json(updated);
    } catch (error) {
      console.error("Update reservation error:", error);
      res.status(500).json({ message: "Failed to update reservation" });
    }
  });
  app2.post("/api/reservations/:id/check-out", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const currentUser = req.user;
      const { id } = req.params;
      const { overrideBalance, overrideReason } = req.body;
      const reservation = await storage.getRoomReservation(id);
      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }
      if (reservation.hotelId !== currentUser.hotelId) {
        return res.status(404).json({ message: "Reservation not found" });
      }
      const totalAmount = Number(reservation.totalPrice || 0);
      const paidAmount = Number(reservation.paidAmount || 0);
      const balanceDue = totalAmount - paidAmount;
      if (balanceDue > 0) {
        if (!overrideBalance) {
          return res.status(400).json({
            message: `Cannot check out with outstanding balance of ${balanceDue}. Please collect payment first.`,
            balanceDue
          });
        }
        const canOverride = ["manager", "owner"].includes(currentUser.role?.name || "");
        if (!canOverride) {
          return res.status(403).json({
            message: `Outstanding balance of ${balanceDue} must be cleared. Contact your manager to override.`,
            balanceDue
          });
        }
        await storage.createCheckoutOverrideLog({
          reservationId: id,
          balanceDue: String(balanceDue),
          overriddenBy: currentUser.id,
          reason: overrideReason || "Manager override"
        });
      }
      const checkedOutReservation = await storage.checkOutGuest(id);
      wsEvents.roomStatusUpdated(currentUser.hotelId, {
        id: checkedOutReservation.roomId,
        status: "available",
        isOccupied: false
      });
      res.json(checkedOutReservation);
    } catch (error) {
      console.error("Checkout error:", error);
      res.status(500).json({ message: "Failed to check out guest" });
    }
  });
  app2.get("/api/rooms/availability", async (req, res) => {
    try {
      const { hotelId, roomId, checkIn, checkOut } = req.query;
      if (!hotelId || !roomId || !checkIn || !checkOut) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      const isAvailable = await storage.checkRoomAvailability(
        hotelId,
        roomId,
        new Date(checkIn),
        new Date(checkOut)
      );
      res.json({ available: isAvailable });
    } catch (error) {
      console.error("Availability check error:", error);
      res.status(500).json({ message: "Failed to check availability" });
    }
  });
  app2.get("/api/reservations/date-range", async (req, res) => {
    try {
      const { hotelId, startDate, endDate } = req.query;
      if (!hotelId || !startDate || !endDate) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      const reservations = await storage.getReservationsByDateRange(
        hotelId,
        new Date(startDate),
        new Date(endDate)
      );
      res.json(reservations);
    } catch (error) {
      console.error("Get reservations error:", error);
      res.status(500).json({ message: "Failed to get reservations" });
    }
  });
  app2.post("/api/hotels/current/room-service-charges", requireActiveUser, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser?.hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const chargeData = insertRoomServiceChargeSchema.parse({
        ...req.body,
        hotelId: currentUser.hotelId,
        addedBy: currentUser.id
      });
      const charge = await storage.createRoomServiceCharge(chargeData);
      res.json(charge);
    } catch (error) {
      console.error("Create room service charge error:", error);
      res.status(500).json({ message: "Failed to add service charge" });
    }
  });
  app2.get("/api/hotels/current/room-service-charges", requireActiveUser, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser?.hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const { reservationId } = req.query;
      if (reservationId) {
        const reservation = await storage.getRoomReservation(reservationId);
        if (!reservation || reservation.hotelId !== currentUser.hotelId) {
          return res.status(403).json({ message: "Access denied" });
        }
        const charges = await storage.getRoomServiceCharges(reservationId);
        res.json(charges);
      } else {
        const charges = await storage.getAllRoomServiceChargesByHotel(currentUser.hotelId);
        res.json(charges);
      }
    } catch (error) {
      console.error("Get room service charges error:", error);
      res.status(500).json({ message: "Failed to get service charges" });
    }
  });
  app2.delete("/api/hotels/current/room-service-charges/:id", requireActiveUser, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser?.hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const { id } = req.params;
      await storage.deleteRoomServiceCharge(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete room service charge error:", error);
      res.status(500).json({ message: "Failed to delete service charge" });
    }
  });
  app2.get("/api/hotels/:hotelId/menu-items", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user;
      if (currentUser.role?.name !== "super_admin" && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const menuItems2 = await storage.getMenuItemsByHotel(hotelId);
      res.json(menuItems2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });
  app2.get("/api/hotels/:hotelId/menu-categories", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user;
      if (currentUser.role?.name !== "super_admin" && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const categories = await storage.getMenuCategoriesByHotel(hotelId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu categories" });
    }
  });
  app2.post("/api/menu-items", async (req, res) => {
    try {
      const itemData = insertMenuItemSchema.parse(req.body);
      const item = await storage.createMenuItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid menu item data" });
    }
  });
  app2.put("/api/menu-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const itemData = insertMenuItemSchema.partial().parse(req.body);
      const item = await storage.updateMenuItem(id, itemData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Failed to update menu item" });
    }
  });
  app2.delete("/api/menu-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMenuItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete menu item" });
    }
  });
  app2.get("/api/tasks/my-tasks", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.id) {
        return res.status(400).json({ message: "User not found" });
      }
      const tasks2 = await storage.getTasksByUser(user.id);
      res.json(tasks2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });
  app2.get("/api/users/:userId/tasks", async (req, res) => {
    try {
      const { userId } = req.params;
      const tasks2 = await storage.getTasksByUser(userId);
      res.json(tasks2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });
  app2.get("/api/hotels/:hotelId/tasks", async (req, res) => {
    try {
      const { hotelId } = req.params;
      const tasks2 = await storage.getTasksByHotel(hotelId);
      res.json(tasks2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });
  app2.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });
  app2.put("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const taskData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(id, taskData);
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Failed to update task" });
    }
  });
  app2.delete("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTask(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete task" });
    }
  });
  app2.get("/api/hotels/:hotelId/transactions", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user;
      if (currentUser.role?.name !== "super_admin" && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const transactions2 = await storage.getTransactionsByHotel(hotelId);
      res.json(transactions2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });
  app2.post("/api/transactions", requireActiveUser, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser?.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { hotelId: _, createdBy: __, ...sanitizedBody } = req.body;
      const isVendorPayment = sanitizedBody.vendorId || sanitizedBody.purpose && String(sanitizedBody.purpose).toLowerCase().includes("vendor");
      if (isVendorPayment) {
        if (!sanitizedBody.reference) {
          return res.status(400).json({
            message: "Vendor payments require invoice or purchase order reference"
          });
        }
        const canApprove = ["manager", "owner", "super_admin"].includes(currentUser.role?.name || "");
        if (!canApprove) {
          return res.status(403).json({
            message: "Only managers can approve vendor payments"
          });
        }
        const amount = Number(sanitizedBody.amount || 0);
        if (amount > 1e4) {
          const details = sanitizedBody.details || {};
          if (!details.approvalDocuments || !Array.isArray(details.approvalDocuments) || details.approvalDocuments.length === 0) {
            return res.status(400).json({
              message: "Vendor payments over Rs. 10,000 require supporting documentation"
            });
          }
        }
      }
      const transactionData = insertTransactionSchema.parse({
        ...sanitizedBody,
        hotelId: currentUser.hotelId,
        createdBy: currentUser.id
      });
      const transaction = await storage.createTransaction(transactionData);
      wsEvents.transactionCreated(currentUser.hotelId, transaction);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Transaction creation error:", error);
      res.status(400).json({ message: "Invalid transaction data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.put("/api/transactions/:id", requireActiveUser, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedTransaction = await storage.updateTransaction(id, updateData);
      if (updatedTransaction && req.user?.hotelId) {
        wsEvents.transactionUpdated(req.user.hotelId, updatedTransaction);
      }
      res.json(updatedTransaction);
    } catch (error) {
      console.error("Transaction update error:", error);
      res.status(400).json({ message: "Failed to update transaction", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.delete("/api/transactions/:id", requireActiveUser, async (req, res) => {
    return res.status(403).json({
      message: "Transactions cannot be deleted. Use void functionality instead."
    });
  });
  app2.post("/api/transactions/:id/void", requireActiveUser, async (req, res) => {
    try {
      const currentUser = req.user;
      const { id } = req.params;
      const { reason } = req.body;
      const canVoid = ["manager", "owner"].includes(currentUser.role?.name || "");
      if (!canVoid) {
        return res.status(403).json({
          message: "Only managers and owners can void transactions"
        });
      }
      if (!reason || reason.trim().length < 15) {
        return res.status(400).json({
          message: "Void reason required (minimum 15 characters)"
        });
      }
      const transaction = await storage.getTransaction(id);
      if (!transaction || transaction.hotelId !== currentUser.hotelId) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      if (transaction.isVoided) {
        return res.status(400).json({ message: "Transaction already voided" });
      }
      const voidedTransaction = await storage.voidTransaction(id, currentUser.id, reason);
      res.json({ success: true, transaction: voidedTransaction });
    } catch (error) {
      console.error("Transaction void error:", error);
      res.status(500).json({ message: "Failed to void transaction" });
    }
  });
  app2.get("/api/hotels/:hotelId/maintenance-requests", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user;
      if (currentUser.role?.name !== "super_admin" && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const requests = await storage.getMaintenanceRequestsByHotel(hotelId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch maintenance requests" });
    }
  });
  app2.post("/api/maintenance-requests", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const requestData = insertMaintenanceRequestSchema.parse(req.body);
      const request = await storage.createMaintenanceRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      console.error("Maintenance request creation error:", error);
      res.status(400).json({ message: "Invalid maintenance request data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.put("/api/maintenance-requests/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const currentUser = req.user;
      const { id } = req.params;
      const updateData = req.body;
      const existingRequest = await storage.getMaintenanceRequest(id);
      if (!existingRequest || existingRequest.hotelId !== currentUser.hotelId) {
        return res.status(404).json({ message: "Maintenance request not found" });
      }
      if ("assignedTo" in updateData && updateData.assignedTo !== existingRequest.assignedTo) {
        const canReassign = ["manager", "owner", "security_head", "housekeeping_supervisor", "restaurant_bar_manager"].includes(currentUser.role?.name || "");
        if (!canReassign) {
          return res.status(403).json({
            message: "Only supervisors can reassign maintenance requests"
          });
        }
        await storage.createAuditLog({
          hotelId: currentUser.hotelId,
          resourceType: "maintenance_request",
          resourceId: id,
          action: "reassigned",
          userId: currentUser.id,
          details: {
            previousAssignee: existingRequest.assignedTo,
            newAssignee: updateData.assignedTo,
            timestamp: /* @__PURE__ */ new Date()
          }
        });
      }
      const isAssigned = existingRequest.assignedTo === currentUser.id;
      const isSupervisor = ["manager", "owner", "security_head", "housekeeping_supervisor", "restaurant_bar_manager"].includes(currentUser.role?.name || "");
      if (!isAssigned && !isSupervisor) {
        return res.status(403).json({
          message: "You can only update requests assigned to you"
        });
      }
      if ("status" in updateData && updateData.status !== existingRequest.status) {
        const statusActions = {
          "approved": "approved",
          "declined": "declined",
          "resolved": "resolved",
          "in_progress": "started"
        };
        const action = statusActions[updateData.status] || "updated";
        await storage.createAuditLog({
          hotelId: currentUser.hotelId,
          resourceType: "maintenance_request",
          resourceId: id,
          action,
          userId: currentUser.id,
          details: {
            previousStatus: existingRequest.status,
            newStatus: updateData.status,
            requestTitle: existingRequest.title,
            requestLocation: existingRequest.location,
            timestamp: /* @__PURE__ */ new Date()
          }
        });
      }
      const requestData = insertMaintenanceRequestSchema.partial().parse(updateData);
      const updatedRequest = await storage.updateMaintenanceRequest(id, requestData);
      res.json(updatedRequest);
    } catch (error) {
      console.error("Maintenance request update error:", error);
      res.status(400).json({ message: "Failed to update maintenance request" });
    }
  });
  app2.get("/api/hotels/:hotelId/kot-orders", async (req, res) => {
    try {
      const { hotelId } = req.params;
      const kotOrders2 = await storage.getKotOrdersByHotel(hotelId);
      res.json(kotOrders2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch KOT orders" });
    }
  });
  app2.get("/api/kot-orders/:kotId/items", async (req, res) => {
    try {
      const { kotId } = req.params;
      const items = await storage.getKotItems(kotId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch KOT items" });
    }
  });
  app2.post("/api/kot-orders", requireActiveUser, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser || !currentUser.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { items, ...kotData } = req.body;
      const enrichedKotData = {
        ...kotData,
        hotelId: currentUser.hotelId,
        createdBy: currentUser.id
      };
      if (items && items.length > 0) {
        const kot = await storage.createKotOrderWithItems(enrichedKotData, items);
        wsEvents.kotOrderCreated(currentUser.hotelId, kot);
        res.status(201).json(kot);
      } else {
        const kot = await storage.createKotOrder(enrichedKotData);
        wsEvents.kotOrderCreated(currentUser.hotelId, kot);
        res.status(201).json(kot);
      }
    } catch (error) {
      console.error("KOT order creation error:", error);
      res.status(400).json({ message: "Invalid KOT data" });
    }
  });
  app2.put("/api/kot-orders/:id", requireActiveUser, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const kotData = req.body;
      const kot = await storage.updateKotOrder(id, kotData);
      if (user?.hotelId) {
        wsEvents.kotOrderUpdated(user.hotelId, kot);
      }
      res.json(kot);
    } catch (error) {
      res.status(400).json({ message: "Failed to update KOT order" });
    }
  });
  app2.put("/api/kot-items/:id", requireActiveUser, async (req, res) => {
    try {
      const currentUser = req.user;
      const { id } = req.params;
      const updateData = req.body;
      if (!currentUser || !currentUser.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const existingItem = await storage.getKotItemById(id);
      if (!existingItem) {
        return res.status(404).json({ message: "KOT item not found" });
      }
      const kotOrder = await db.query.kotOrders.findFirst({
        where: (orders, { eq: eq4 }) => eq4(orders.id, existingItem.kotId)
      });
      if (!kotOrder || kotOrder.hotelId !== currentUser.hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      if (updateData.status === "declined" || updateData.status === "cancelled") {
        const canDecline = ["manager", "owner", "restaurant_bar_manager"].includes(currentUser.role?.name || "");
        if (!canDecline) {
          return res.status(403).json({
            message: "Only managers can decline or cancel orders. Contact your supervisor."
          });
        }
      }
      const validatedData = updateKotItemSchema.parse(updateData);
      if (validatedData.status === "declined" || validatedData.status === "cancelled") {
        await storage.createKotAuditLog({
          kotItemId: id,
          action: validatedData.status,
          performedBy: currentUser.id,
          reason: validatedData.declineReason,
          previousStatus: existingItem.status || void 0,
          newStatus: validatedData.status
        });
      }
      if (validatedData.status === "completed" && existingItem.status !== "completed") {
        const menuItem = await storage.getMenuItem(existingItem.menuItemId);
        if (menuItem && menuItem.recipe) {
          validatedData.inventoryVerified = true;
        }
      }
      if (validatedData.status === "approved" && existingItem.status !== "approved") {
        await storage.deductInventoryForKotItem(id);
      }
      const updatedItem = await storage.updateKotItem(id, validatedData);
      if (existingItem.kotId) {
        await storage.updateKotOrderStatus(existingItem.kotId);
      }
      if (currentUser?.hotelId) {
        wsEvents.kotOrderUpdated(currentUser.hotelId, updatedItem);
      }
      res.json(updatedItem);
    } catch (error) {
      console.error("KOT item update error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid data" });
      }
      res.status(400).json({ message: "Failed to update KOT item" });
    }
  });
  app2.delete("/api/kot-orders/:id", requireActiveUser, async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const kotOrder = await db.query.kotOrders.findFirst({
        where: (orders, { eq: eq4 }) => eq4(orders.id, id)
      });
      if (!kotOrder) {
        return res.status(404).json({ message: "KOT order not found" });
      }
      if (kotOrder.hotelId !== user.hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.deleteKotOrderWithInventoryRestore(id);
      res.status(204).send();
    } catch (error) {
      console.error("KOT deletion error:", error);
      res.status(400).json({ message: "Failed to delete KOT order" });
    }
  });
  app2.get("/api/hotels/current/bills", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { startDate, endDate, status } = req.query;
      const filters = {};
      if (startDate) {
        filters.startDate = new Date(startDate);
      }
      if (endDate) {
        filters.endDate = new Date(endDate);
      }
      if (status) {
        filters.status = status;
      }
      const bills = await storage.getRestaurantBillsByHotel(user.hotelId, filters);
      res.json(bills);
    } catch (error) {
      console.error("Bill fetch error:", error);
      res.status(500).json({ message: "Failed to fetch bills" });
    }
  });
  app2.get("/api/hotels/current/bills/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      const { id } = req.params;
      const bill = await storage.getRestaurantBill(id);
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }
      if (bill.hotelId !== user.hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const payments2 = await storage.getBillPayments(id);
      res.json({ ...bill, payments: payments2 });
    } catch (error) {
      console.error("Bill fetch error:", error);
      res.status(500).json({ message: "Failed to fetch bill" });
    }
  });
  app2.post("/api/hotels/current/bills", requireActiveUser, async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { payments: payments2, ...billData } = req.body;
      const timestamp2 = Date.now();
      const billNumber = `BILL-${timestamp2.toString().slice(-8)}`;
      const bill = await storage.createRestaurantBill({
        ...billData,
        billNumber,
        hotelId: user.hotelId,
        createdBy: user.id,
        finalizedAt: billData.status === "final" ? /* @__PURE__ */ new Date() : null
      });
      const createdPayments = [];
      for (const payment of payments2) {
        const transaction = await storage.createTransaction({
          hotelId: user.hotelId,
          txnType: payment.paymentMethod === "cash" ? "cash_in" : payment.paymentMethod === "pos" ? "pos_in" : "fonepay_in",
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          purpose: "restaurant_sale",
          reference: `Bill: ${billNumber}`,
          createdBy: user.id
        });
        const billPayment = await storage.createBillPayment({
          billId: bill.id,
          hotelId: user.hotelId,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          transactionId: transaction.id,
          reference: payment.reference,
          receivedBy: user.id
        });
        createdPayments.push(billPayment);
      }
      if (createdPayments.length > 0) {
        const totalPaid = createdPayments.filter((p) => !p.isVoided).reduce((sum, p) => sum + Number(p.amount), 0);
        const grandTotal = Number(bill.grandTotal);
        if (totalPaid >= grandTotal) {
          await storage.updateRestaurantBill(bill.id, {
            status: "paid",
            finalizedAt: /* @__PURE__ */ new Date()
          });
          bill.status = "paid";
          bill.finalizedAt = /* @__PURE__ */ new Date();
        }
      }
      if (billData.status === "final" && billData.orderIds) {
        for (const orderId of billData.orderIds) {
          await storage.updateKotOrder(orderId, { status: "served" });
        }
      }
      res.status(201).json({ ...bill, payments: createdPayments });
    } catch (error) {
      console.error("Bill creation error:", error);
      res.status(400).json({ message: "Failed to create bill", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.put("/api/hotels/current/bills/:id", requireActiveUser, async (req, res) => {
    try {
      const user = req.user;
      const { id } = req.params;
      const existingBill = await storage.getRestaurantBill(id);
      if (!existingBill) {
        return res.status(404).json({ message: "Bill not found" });
      }
      if (existingBill.hotelId !== user.hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      if (existingBill.status === "paid" || existingBill.status === "finalized") {
        const isManager = ["manager", "owner", "super_admin"].includes(user.role?.name || "");
        if (!isManager) {
          return res.status(403).json({
            message: "Cannot modify paid bills. Contact your manager for amendments."
          });
        }
        if (!req.body.amendmentNote || req.body.amendmentNote.trim().length < 10) {
          return res.status(400).json({
            message: "Amendments to paid bills require detailed notes (minimum 10 characters)"
          });
        }
        await storage.createAuditLog({
          hotelId: user.hotelId,
          resourceType: "restaurant_bill",
          resourceId: id,
          action: "amendment",
          userId: user.id,
          details: {
            originalStatus: existingBill.status,
            changes: req.body,
            amendmentNote: req.body.amendmentNote,
            originalBillData: {
              grandTotal: existingBill.grandTotal,
              status: existingBill.status,
              items: existingBill.items
            }
          }
        });
      }
      const updateData = {
        ...req.body,
        amendedBy: user.id,
        amendedAt: /* @__PURE__ */ new Date()
      };
      const updatedBill = await storage.updateRestaurantBill(id, updateData);
      res.json(updatedBill);
    } catch (error) {
      console.error("Bill update error:", error);
      res.status(400).json({ message: "Failed to update bill" });
    }
  });
  app2.post("/api/bill-payments/:paymentId/void", requireActiveUser, async (req, res) => {
    console.log("\u{1F525} VOID ENDPOINT HIT:", req.params.paymentId, req.isAuthenticated());
    try {
      const currentUser = req.user;
      console.log("\u{1F525} USER:", currentUser.username, currentUser.role?.name);
      const { paymentId } = req.params;
      const { reason } = req.body;
      const canVoid = ["manager", "owner"].includes(currentUser.role?.name || "");
      if (!canVoid) {
        return res.status(403).json({
          message: "Only managers can void payments"
        });
      }
      if (!reason || reason.trim().length < 15) {
        return res.status(400).json({
          message: "Void reason required (minimum 15 characters)"
        });
      }
      const payment = await storage.getBillPayment(paymentId);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      if (payment.isVoided) {
        return res.status(400).json({ message: "Payment already voided" });
      }
      if (payment.hotelId !== currentUser.hotelId) {
        return res.status(404).json({ message: "Payment not found" });
      }
      const paymentDate = new Date(payment.createdAt);
      const daysSince = (Date.now() - paymentDate.getTime()) / (1e3 * 60 * 60 * 24);
      if (daysSince >= 7) {
        if (currentUser.role?.name !== "owner") {
          return res.status(403).json({
            message: "Cannot void payments 7 days or older. Contact hotel owner."
          });
        }
      }
      const voidedPayment = await storage.voidBillPayment(paymentId, currentUser.id, reason);
      await logAudit({
        userId: currentUser.id,
        hotelId: currentUser.hotelId,
        action: "void_payment",
        resourceType: "bill_payment",
        resourceId: paymentId,
        details: {
          reason,
          amount: payment.amount,
          billId: payment.billId,
          paymentMethod: payment.paymentMethod
        },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      });
      const bill = await storage.getRestaurantBill(payment.billId);
      const allPayments = await storage.getBillPayments(payment.billId);
      const totalPaid = allPayments.filter((p) => !p.isVoided).reduce((sum, p) => sum + Number(p.amount), 0);
      const grandTotal = Number(bill.grandTotal);
      if (totalPaid >= grandTotal) {
        await storage.updateRestaurantBill(payment.billId, {
          status: "paid"
        });
      } else if (totalPaid > 0) {
        await storage.updateRestaurantBill(payment.billId, {
          status: "partial"
        });
      } else {
        await storage.updateRestaurantBill(payment.billId, {
          status: "draft"
        });
      }
      res.json({
        success: true,
        payment: voidedPayment,
        message: "Payment voided successfully"
      });
    } catch (error) {
      console.error("Payment void error:", error);
      res.status(500).json({ message: "Failed to void payment" });
    }
  });
  app2.post("/api/hotels/current/wastages", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const wastageData = req.body;
      if (!wastageData.itemId || wastageData.qty === void 0 || wastageData.qty === null || !wastageData.reason) {
        return res.status(400).json({
          message: "Item, quantity, and reason are required"
        });
      }
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(wastageData.itemId)) {
        return res.status(400).json({
          message: "Invalid inventory item selected"
        });
      }
      const qty = Number(wastageData.qty);
      if (!Number.isFinite(qty) || qty <= 0) {
        return res.status(400).json({
          message: "Quantity must be a positive number"
        });
      }
      if (!wastageData.reason || wastageData.reason.trim().length < 15) {
        return res.status(400).json({
          message: "Wastage reason must be detailed (minimum 15 characters)"
        });
      }
      const inventoryItem = await storage.getInventoryItem(wastageData.itemId);
      if (!inventoryItem || inventoryItem.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      const wastageQty = Number(wastageData.qty);
      const itemCost = Number(inventoryItem.costPerUnit || 0);
      const wastageValue = wastageQty * itemCost;
      const highValueThreshold = 1e3;
      const isManager = ["manager", "owner"].includes(user.role?.name || "");
      if (wastageValue > highValueThreshold && !isManager) {
        const finalWastageData2 = {
          ...wastageData,
          hotelId: user.hotelId,
          recordedBy: user.id,
          status: "pending_approval",
          estimatedValue: wastageValue
        };
        const wastage2 = await storage.createWastage(finalWastageData2);
        const managerRole = await storage.getRoleByName("manager");
        if (managerRole) {
          const managers = await storage.getUsersByRole(managerRole.id);
          const hotelManagers = managers.filter((m) => m.hotelId === user.hotelId);
          for (const manager of hotelManagers) {
            await storage.createNotification({
              userId: manager.id,
              title: "High-Value Wastage Approval Required",
              message: `${user.username} reported wastage of ${wastageData.qty} ${wastageData.unit || inventoryItem.unit} ${inventoryItem.name} (Value: Rs. ${wastageValue.toFixed(2)}). Reason: ${wastageData.reason}`,
              type: "wastage_approval",
              relatedId: wastage2.id,
              hotelId: user.hotelId
            });
          }
        }
        return res.status(201).json({
          ...wastage2,
          message: "High-value wastage requires manager approval"
        });
      }
      const finalWastageData = {
        ...wastageData,
        hotelId: user.hotelId,
        recordedBy: user.id,
        status: "approved",
        approvedBy: user.id,
        approvedAt: /* @__PURE__ */ new Date(),
        estimatedValue: wastageValue
      };
      const wastage = await storage.createWastage(finalWastageData);
      res.status(201).json(wastage);
    } catch (error) {
      console.error("Wastage creation error:", error);
      res.status(400).json({ message: error.message || "Failed to report wastage" });
    }
  });
  app2.get("/api/hotels/current/wastages", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const wastages2 = await storage.getWastagesByHotel(user.hotelId);
      res.json(wastages2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wastages" });
    }
  });
  app2.post("/api/wastages/:id/approve", requireActiveUser, async (req, res) => {
    try {
      const currentUser = req.user;
      const { id } = req.params;
      const { approved, rejectionReason } = req.body;
      const canApprove = ["manager", "owner"].includes(currentUser.role?.name || "");
      if (!canApprove) {
        return res.status(403).json({
          message: "Only managers can approve wastage"
        });
      }
      const wastage = await storage.getWastage(id);
      if (!wastage || wastage.hotelId !== currentUser.hotelId) {
        return res.status(404).json({ message: "Wastage report not found" });
      }
      if (wastage.status !== "pending_approval") {
        return res.status(400).json({ message: "Wastage already processed" });
      }
      if (approved) {
        const approvedWastage = await storage.approveWastage(id, currentUser.id);
        await storage.createNotification({
          userId: wastage.recordedBy,
          title: "Wastage Approved",
          message: `Your wastage report has been approved by ${currentUser.username}.`,
          type: "wastage_approved",
          relatedId: id,
          hotelId: currentUser.hotelId
        });
        res.json(approvedWastage);
      } else {
        if (!rejectionReason || rejectionReason.trim().length < 10) {
          return res.status(400).json({
            message: "Rejection reason required (minimum 10 characters)"
          });
        }
        const rejectedWastage = await storage.rejectWastage(id, currentUser.id, rejectionReason);
        await storage.createNotification({
          userId: wastage.recordedBy,
          title: "Wastage Rejected",
          message: `Your wastage report has been rejected by ${currentUser.username}. Reason: ${rejectionReason}`,
          type: "wastage_rejected",
          relatedId: id,
          hotelId: currentUser.hotelId
        });
        res.json(rejectedWastage);
      }
    } catch (error) {
      console.error("Wastage approval error:", error);
      res.status(500).json({ message: error.message || "Failed to process wastage approval" });
    }
  });
  app2.get("/api/hotels/current/inventory", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const items = await storage.getInventoryItemsByHotel(user.hotelId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory items" });
    }
  });
  app2.get("/api/hotels/:hotelId/inventory", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user;
      if (currentUser.role?.name !== "super_admin" && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const items = await storage.getInventoryItemsByHotel(hotelId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory items" });
    }
  });
  app2.get("/api/hotels/:hotelId/inventory/low-stock", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user;
      if (currentUser.role?.name !== "super_admin" && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const items = await storage.getLowStockItems(hotelId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch low stock items" });
    }
  });
  app2.get("/api/hotels/:hotelId/vendors", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user;
      if (currentUser.role?.name !== "super_admin" && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const vendors2 = await storage.getVendorsByHotel(hotelId);
      res.json(vendors2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });
  app2.get("/api/hotels/:hotelId/restaurant-tables", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user;
      if (currentUser.role?.name !== "super_admin" && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const tables = await storage.getRestaurantTablesByHotel(hotelId);
      res.json(tables);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch restaurant tables" });
    }
  });
  app2.get("/api/hotels/:hotelId/taxes", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user;
      if (currentUser.role?.name !== "super_admin" && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const taxes = await storage.getHotelTaxes(hotelId);
      res.json(taxes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hotel taxes" });
    }
  });
  app2.put("/api/hotels/:hotelId/taxes/:taxType", requireActiveUser, async (req, res) => {
    try {
      const { hotelId, taxType } = req.params;
      const { isActive, percent } = req.body;
      const currentUser = req.user;
      if (currentUser.role?.name !== "super_admin" && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      if (currentUser.role?.name !== "owner" && currentUser.role?.name !== "super_admin") {
        return res.status(403).json({
          message: "Only the hotel owner can modify tax settings"
        });
      }
      const existingTax = await storage.getHotelTax(hotelId, taxType);
      await storage.createTaxChangeLog({
        hotelId,
        taxType,
        previousPercent: existingTax?.percent || null,
        newPercent: percent !== void 0 ? percent : null,
        previousActive: existingTax?.isActive ?? void 0,
        newActive: isActive,
        changedBy: currentUser.id
      });
      const tax = await storage.updateHotelTax(hotelId, taxType, isActive, percent);
      res.json(tax);
    } catch (error) {
      console.error("Tax update error:", error);
      res.status(400).json({ message: "Failed to update tax" });
    }
  });
  app2.get("/api/hotels/:hotelId/vouchers", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user;
      if (currentUser.role?.name !== "super_admin" && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const vouchers2 = await storage.getVouchersByHotel(hotelId);
      res.json(vouchers2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vouchers" });
    }
  });
  app2.post("/api/vouchers", requireActiveUser, async (req, res) => {
    try {
      const currentUser = req.user;
      const voucherData = insertVoucherSchema.parse({
        ...req.body,
        hotelId: currentUser.hotelId,
        createdBy: currentUser.id
      });
      const voucher = await storage.createVoucher(voucherData);
      res.status(201).json(voucher);
    } catch (error) {
      console.error("Voucher creation error:", error);
      res.status(400).json({ message: "Failed to create voucher" });
    }
  });
  app2.post("/api/vouchers/validate", requireActiveUser, async (req, res) => {
    try {
      const { code } = req.body;
      const currentUser = req.user;
      if (!code || typeof code !== "string") {
        return res.json({ valid: false, message: "Voucher code required" });
      }
      const voucherList = await db.select().from(vouchers).where(eq2(vouchers.code, code)).limit(1);
      if (!voucherList.length) {
        return res.json({ valid: false, message: "Voucher not found" });
      }
      const voucher = voucherList[0];
      if (voucher.hotelId !== currentUser.hotelId) {
        return res.json({ valid: false, message: "Voucher not found" });
      }
      const now = /* @__PURE__ */ new Date();
      if (voucher.validFrom && new Date(voucher.validFrom) > now) {
        return res.json({ valid: false, message: "Voucher not yet valid" });
      }
      if (voucher.validUntil && new Date(voucher.validUntil) < now) {
        return res.json({ valid: false, message: "Voucher has expired" });
      }
      if (voucher.maxUses) {
        const currentUsage = Number(voucher.usedCount || 0);
        if (currentUsage >= Number(voucher.maxUses)) {
          return res.json({ valid: false, message: "Voucher usage limit reached" });
        }
      }
      res.json({
        valid: true,
        voucher: {
          id: voucher.id,
          code: voucher.code,
          discountType: voucher.discountType,
          discountAmount: voucher.discountAmount,
          usedCount: voucher.usedCount,
          maxUses: voucher.maxUses
        }
      });
    } catch (error) {
      console.error("Voucher validation error:", error);
      res.status(500).json({ valid: false, message: "Error validating voucher" });
    }
  });
  app2.post("/api/vouchers/redeem", requireActiveUser, async (req, res) => {
    try {
      const { voucherId } = req.body;
      const currentUser = req.user;
      const result = await db.transaction(async (tx) => {
        const [voucher] = await tx.select().from(vouchers).where(eq2(vouchers.id, voucherId)).for("update");
        if (!voucher) {
          throw new Error("Voucher not found");
        }
        if (voucher.hotelId !== currentUser.hotelId) {
          throw new Error("Voucher not found");
        }
        const now = /* @__PURE__ */ new Date();
        if (voucher.validFrom && new Date(voucher.validFrom) > now) {
          throw new Error("Voucher not yet valid");
        }
        if (voucher.validUntil && new Date(voucher.validUntil) < now) {
          throw new Error("Voucher has expired");
        }
        const currentUsage = Number(voucher.usedCount || 0);
        if (voucher.maxUses && currentUsage >= Number(voucher.maxUses)) {
          throw new Error("Voucher usage limit reached");
        }
        const [updated] = await tx.update(vouchers).set({
          usedCount: sql3`${vouchers.usedCount} + 1`
        }).where(eq2(vouchers.id, voucherId)).returning();
        return updated;
      });
      res.json({ success: true, voucher: result });
    } catch (error) {
      console.error("Voucher redemption error:", error);
      res.status(400).json({ message: error.message || "Failed to redeem voucher" });
    }
  });
  app2.put("/api/vouchers/:id", requireActiveUser, async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.user;
      const existingVoucher = await db.select().from(vouchers).where(eq2(vouchers.id, id)).limit(1);
      if (!existingVoucher.length) {
        return res.status(404).json({ message: "Voucher not found" });
      }
      if (existingVoucher[0].hotelId !== currentUser.hotelId) {
        return res.status(403).json({ message: "Cannot modify vouchers from other hotels" });
      }
      const { hotelId, createdBy, ...sanitizedData } = req.body;
      const voucherData = insertVoucherSchema.partial().parse(sanitizedData);
      const voucher = await storage.updateVoucher(id, voucherData);
      res.json(voucher);
    } catch (error) {
      console.error("Voucher update error:", error);
      res.status(400).json({ message: "Failed to update voucher" });
    }
  });
  app2.delete("/api/vouchers/:id", requireActiveUser, async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.user;
      const existingVoucher = await db.select().from(vouchers).where(eq2(vouchers.id, id)).limit(1);
      if (!existingVoucher.length) {
        return res.status(404).json({ message: "Voucher not found" });
      }
      if (existingVoucher[0].hotelId !== currentUser.hotelId) {
        return res.status(403).json({ message: "Cannot delete vouchers from other hotels" });
      }
      await storage.deleteVoucher(id);
      res.status(204).send();
    } catch (error) {
      console.error("Voucher deletion error:", error);
      res.status(400).json({ message: "Failed to delete voucher" });
    }
  });
  app2.get("/api/hotels/current/vehicle-logs", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.json([]);
      }
      const logs = await storage.getVehicleLogsByHotel(user.hotelId);
      res.json(logs);
    } catch (error) {
      console.error("Vehicle logs fetch error:", error);
      res.status(500).json({ message: "Failed to fetch vehicle logs" });
    }
  });
  app2.get("/api/hotels/:hotelId/vehicle-logs", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user;
      if (currentUser.role?.name !== "super_admin" && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const logs = await storage.getVehicleLogsByHotel(hotelId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicle logs" });
    }
  });
  app2.get("/api/hotels/current/room-service-orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const orders = await storage.getRoomServiceOrdersByHotel(user.hotelId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch room service orders" });
    }
  });
  app2.get("/api/hotels/:hotelId/room-service-orders", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user;
      if (currentUser.role?.name !== "super_admin" && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const orders = await storage.getRoomServiceOrdersByHotel(hotelId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch room service orders" });
    }
  });
  app2.post("/api/room-service-orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const orderData = {
        hotelId: user.hotelId,
        roomId: req.body.roomId,
        requestedBy: user.id,
        status: req.body.status || "pending",
        specialInstructions: req.body.specialInstructions
      };
      const order = await storage.createRoomServiceOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      console.error("Room service order creation error:", error);
      res.status(400).json({ message: "Failed to create room service order" });
    }
  });
  app2.get("/api/hotels/current/leave-requests", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const userRole = user.role?.name || "";
      const canViewAllRequests = ["manager", "owner", "super_admin"].includes(userRole);
      const isDepartmentHead = ["restaurant_bar_manager", "housekeeping_supervisor", "security_head"].includes(userRole);
      let leaveRequests2;
      if (canViewAllRequests) {
        leaveRequests2 = await storage.getLeaveRequestsForManager(user.hotelId);
      } else if (isDepartmentHead) {
        leaveRequests2 = await storage.getLeaveRequestsForApprover(userRole, user.hotelId);
      } else {
        leaveRequests2 = await storage.getLeaveRequestsByUser(user.id);
      }
      res.json(leaveRequests2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leave requests" });
    }
  });
  app2.get("/api/hotels/current/leave-requests/my-requests", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.id) {
        return res.status(400).json({ message: "User not authenticated" });
      }
      const leaveRequests2 = await storage.getLeaveRequestsByUser(user.id);
      res.json(leaveRequests2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user leave requests" });
    }
  });
  app2.get("/api/hotels/current/leave-requests/pending-approvals", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const userRole = user.role?.name || "";
      const canViewApprovals = [
        "restaurant_bar_manager",
        "housekeeping_supervisor",
        "security_head",
        "manager",
        "owner"
      ].includes(userRole);
      if (!canViewApprovals) {
        return res.status(403).json({ message: "You don't have permission to view leave approvals" });
      }
      const leaveRequests2 = await storage.getPendingLeaveRequestsForApprover(userRole, user.hotelId);
      res.json(leaveRequests2);
    } catch (error) {
      console.error("Failed to fetch pending leave requests:", error);
      res.status(500).json({ message: "Failed to fetch pending leave requests" });
    }
  });
  app2.post("/api/hotels/current/leave-requests", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const userRole = user.role?.name || "";
      const roleHierarchy = {
        // Restaurant & Bar staff → Restaurant and Bar Manager
        "waiter": "restaurant_bar_manager",
        "cashier": "restaurant_bar_manager",
        "bartender": "restaurant_bar_manager",
        "kitchen_staff": "restaurant_bar_manager",
        "barista": "restaurant_bar_manager",
        // Housekeeping staff → Housekeeping Supervisor
        "housekeeping_staff": "housekeeping_supervisor",
        // Security staff → Security Head
        "security_guard": "security_head",
        "surveillance_officer": "security_head",
        // Department heads → Manager
        "restaurant_bar_manager": "manager",
        "housekeeping_supervisor": "manager",
        "security_head": "manager",
        // Other staff → Manager
        "finance": "manager",
        "front_desk": "manager",
        "storekeeper": "manager",
        // Manager → Owner
        "manager": "owner"
      };
      if (!roleHierarchy[userRole]) {
        return res.status(403).json({
          message: `Your role (${userRole}) is not eligible to submit leave requests or does not have an assigned approver.`
        });
      }
      const leaveRequestData = insertLeaveRequestSchema.parse({
        ...req.body,
        hotelId: user.hotelId,
        requestedBy: user.id,
        status: "pending"
      });
      const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
      const startDate = new Date(leaveRequestData.startDate);
      const endDate = new Date(leaveRequestData.endDate);
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        return res.status(400).json({
          message: "Cannot request leave for past dates. Contact your manager for backdated leave."
        });
      }
      const maxFutureDate = new Date(today);
      maxFutureDate.setFullYear(today.getFullYear() + 2);
      if (startDate > maxFutureDate || endDate > maxFutureDate) {
        return res.status(400).json({
          message: "Cannot request leave more than 2 years in advance"
        });
      }
      if (endDate < startDate) {
        return res.status(400).json({
          message: "End date must be after start date"
        });
      }
      const leaveDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1e3 * 60 * 60 * 24)) + 1;
      await storage.initializeLeaveBalances(user.id, user.hotelId, currentYear);
      const balance = await storage.getLeaveBalance(user.id, leaveRequestData.leaveType, currentYear);
      if (!balance) {
        return res.status(400).json({ message: "Leave balance not found for this leave type" });
      }
      const remainingDays = parseFloat(balance.remainingDays);
      if (leaveDays > remainingDays) {
        return res.status(400).json({
          message: `Insufficient leave balance. You have ${remainingDays} days remaining, but requested ${leaveDays} days.`
        });
      }
      const overlapping = await storage.getOverlappingLeaves(user.id, startDate, endDate);
      if (overlapping.length > 0) {
        return res.status(400).json({
          message: "You have overlapping approved or pending leave for these dates"
        });
      }
      const leaveRequest = await storage.createLeaveRequest(leaveRequestData);
      res.status(201).json(leaveRequest);
    } catch (error) {
      console.error("Leave request creation error:", error);
      res.status(400).json({ message: "Invalid leave request data" });
    }
  });
  app2.post("/api/leave-requests/:id/approve", requireActiveUser, async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const userRole = user.role?.name || "";
      const canApprove = [
        "restaurant_bar_manager",
        "housekeeping_supervisor",
        "security_head",
        "manager",
        "owner",
        "super_admin"
      ].includes(userRole);
      if (!canApprove) {
        return res.status(403).json({ message: "You don't have permission to approve leave requests" });
      }
      const { id } = req.params;
      const { managerNotes } = req.body;
      const existingRequest = await storage.getLeaveRequest(id);
      if (!existingRequest || existingRequest.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Leave request not found" });
      }
      if (existingRequest.status !== "pending") {
        return res.status(400).json({ message: "Leave request has already been processed" });
      }
      const startDate = new Date(existingRequest.startDate);
      const endDate = new Date(existingRequest.endDate);
      const leaveDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1e3 * 60 * 60 * 24)) + 1;
      const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
      if (!existingRequest.requestedBy) {
        return res.status(400).json({ message: "Leave request missing user information" });
      }
      const balance = await storage.getLeaveBalance(existingRequest.requestedBy, existingRequest.leaveType, currentYear);
      if (!balance) {
        return res.status(400).json({ message: "Leave balance not found" });
      }
      const usedDays = parseFloat(balance.usedDays) + leaveDays;
      const remainingDays = parseFloat(balance.remainingDays) - leaveDays;
      await storage.updateLeaveBalance(balance.id, {
        usedDays: usedDays.toString(),
        remainingDays: remainingDays.toString()
      });
      const updateData = {
        status: "approved",
        approvedBy: user.id,
        approvalDate: /* @__PURE__ */ new Date()
      };
      if (managerNotes) {
        updateData.managerNotes = managerNotes;
      }
      const leaveRequest = await storage.updateLeaveRequest(id, updateData);
      await storage.createNotification({
        hotelId: user.hotelId,
        userId: existingRequest.requestedBy,
        type: "leave_approved",
        title: "Leave Request Approved",
        message: `Your ${existingRequest.leaveType} leave request from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()} has been approved.`,
        relatedId: id,
        isRead: false
      });
      res.json(leaveRequest);
    } catch (error) {
      console.error("Leave request approval error:", error);
      res.status(500).json({ message: "Failed to approve leave request" });
    }
  });
  app2.post("/api/leave-requests/:id/reject", requireActiveUser, async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const userRole = user.role?.name || "";
      const canReject = [
        "restaurant_bar_manager",
        "housekeeping_supervisor",
        "security_head",
        "manager",
        "owner",
        "super_admin"
      ].includes(userRole);
      if (!canReject) {
        return res.status(403).json({ message: "You don't have permission to reject leave requests" });
      }
      const { id } = req.params;
      const { managerNotes } = req.body;
      const existingRequest = await storage.getLeaveRequest(id);
      if (!existingRequest || existingRequest.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Leave request not found" });
      }
      if (existingRequest.status !== "pending") {
        return res.status(400).json({ message: "Leave request has already been processed" });
      }
      const updateData = {
        status: "rejected",
        approvedBy: user.id,
        approvalDate: /* @__PURE__ */ new Date()
      };
      if (managerNotes) {
        updateData.managerNotes = managerNotes;
      }
      const leaveRequest = await storage.updateLeaveRequest(id, updateData);
      const startDate = new Date(existingRequest.startDate);
      const endDate = new Date(existingRequest.endDate);
      await storage.createNotification({
        hotelId: user.hotelId,
        userId: existingRequest.requestedBy,
        type: "leave_rejected",
        title: "Leave Request Rejected",
        message: `Your ${existingRequest.leaveType} leave request from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()} has been rejected.${managerNotes ? " Reason: " + managerNotes : ""}`,
        relatedId: id,
        isRead: false
      });
      res.json(leaveRequest);
    } catch (error) {
      console.error("Leave request rejection error:", error);
      res.status(500).json({ message: "Failed to reject leave request" });
    }
  });
  app2.get("/api/notifications", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      const notifications2 = await storage.getNotificationsByUser(user.id);
      res.json(notifications2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  app2.get("/api/notifications/unread", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      const notifications2 = await storage.getUnreadNotificationsByUser(user.id);
      res.json(notifications2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread notifications" });
    }
  });
  app2.post("/api/notifications/:id/read", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { id } = req.params;
      const notification = await storage.markNotificationAsRead(id);
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  app2.post("/api/notifications/read-all", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      await storage.markAllNotificationsAsRead(user.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });
  app2.get("/api/leave-balances", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      const year = req.query.year ? parseInt(req.query.year) : (/* @__PURE__ */ new Date()).getFullYear();
      await storage.initializeLeaveBalances(user.id, user.hotelId, year);
      const balances = await storage.getLeaveBalancesByUser(user.id, year);
      res.json(balances);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leave balances" });
    }
  });
  app2.get("/api/hotels/current/leave-policies", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const policies = await storage.getLeavePoliciesByHotel(user.hotelId);
      res.json(policies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leave policies" });
    }
  });
  app2.post("/api/hotels/current/leave-policies", requireActiveUser, async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const userRole = user.role?.name || "";
      if (userRole !== "owner") {
        return res.status(403).json({ message: "Only hotel owners can create leave policies" });
      }
      const policyData = insertLeavePolicySchema.parse({
        ...req.body,
        hotelId: user.hotelId
      });
      const policy = await storage.createLeavePolicy(policyData);
      res.json(policy);
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid policy data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create leave policy" });
    }
  });
  app2.patch("/api/leave-policies/:id", requireActiveUser, async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const userRole = user.role?.name || "";
      if (userRole !== "owner") {
        return res.status(403).json({ message: "Only hotel owners can update leave policies" });
      }
      const { id } = req.params;
      const policy = await storage.updateLeavePolicy(id, req.body);
      res.json(policy);
    } catch (error) {
      res.status(500).json({ message: "Failed to update leave policy" });
    }
  });
  app2.delete("/api/leave-policies/:id", requireActiveUser, async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const userRole = user.role?.name || "";
      if (userRole !== "owner") {
        return res.status(403).json({ message: "Only hotel owners can delete leave policies" });
      }
      const { id } = req.params;
      await storage.deleteLeavePolicy(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete leave policy" });
    }
  });
  app2.get("/api/hotels/current/stock-requests", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const userRole = user.role?.name || "";
      const canViewAll = ["manager", "owner", "storekeeper"].includes(userRole);
      if (!canViewAll) {
        return res.status(403).json({ message: "Only manager, owner, or storekeeper can view all stock requests" });
      }
      const requests = await storage.getStockRequestsByHotel(user.hotelId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock requests" });
    }
  });
  app2.get("/api/hotels/current/stock-requests/my-requests", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const userRole = user.role?.name || "";
      const canRequestStock = ["bartender", "kitchen_staff", "barista"].includes(userRole);
      if (!canRequestStock) {
        return res.status(403).json({ message: "Only bartender, kitchen staff, and barista can view their stock requests" });
      }
      const requests = await storage.getStockRequestsByUser(user.id);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock requests" });
    }
  });
  app2.get("/api/hotels/current/stock-requests/pending", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const userRole = user.role?.name || "";
      if (userRole !== "storekeeper") {
        return res.status(403).json({ message: "Only storekeeper can view pending stock requests" });
      }
      const requests = await storage.getPendingStockRequestsForStorekeeper(user.hotelId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending stock requests" });
    }
  });
  app2.get("/api/hotels/current/stock-requests/department", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const userRole = user.role?.name || "";
      let department = req.query.department;
      if (userRole === "restaurant_bar_manager") {
        department = "restaurant_bar";
      } else if (userRole === "housekeeping_supervisor") {
        department = "housekeeping";
      } else if (userRole === "security_head") {
        department = "security";
      } else if (!["manager", "owner", "super_admin"].includes(userRole)) {
        return res.status(403).json({ message: "Not authorized to view department stock requests" });
      }
      if (!department) {
        return res.status(400).json({ message: "Department could not be determined" });
      }
      const requests = await storage.getStockRequestsByDepartment(user.hotelId, department);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch department stock requests" });
    }
  });
  app2.post("/api/hotels/current/stock-requests", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const userRole = user.role?.name || "";
      const canRequestStock = ["bartender", "kitchen_staff", "barista"].includes(userRole);
      if (!canRequestStock) {
        return res.status(403).json({ message: "Only bartender, kitchen staff, and barista can request stock" });
      }
      let department = "";
      if (userRole === "bartender" || userRole === "kitchen_staff" || userRole === "barista") {
        department = "restaurant_bar";
      }
      const requestData = insertStockRequestSchema.parse({
        ...req.body,
        hotelId: user.hotelId,
        requestedBy: user.id,
        department,
        status: "pending"
      });
      const request = await storage.createStockRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      console.error("Stock request creation error:", error);
      res.status(400).json({ message: "Invalid stock request data" });
    }
  });
  app2.patch("/api/hotels/current/stock-requests/:id/approve", requireActiveUser, async (req, res) => {
    try {
      const user = req.user;
      const { id } = req.params;
      const canApprove = ["storekeeper", "manager", "owner"].includes(user.role?.name || "");
      if (!canApprove) {
        return res.status(403).json({
          message: "Only storekeeper, manager, or owner can approve stock requests"
        });
      }
      const stockRequest = await storage.getStockRequest(id);
      if (!stockRequest) {
        return res.status(404).json({ message: "Stock request not found" });
      }
      if (stockRequest.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Stock request not found" });
      }
      if (stockRequest.status !== "pending") {
        return res.status(400).json({ message: "Only pending requests can be approved" });
      }
      const inventoryItem = await storage.getInventoryItem(stockRequest.itemId);
      if (!inventoryItem) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      const currentStock = Number(inventoryItem.baseStockQty || inventoryItem.stockQty || 0);
      const requestedQty = Number(stockRequest.quantity || 0);
      let requestedInBaseUnit = requestedQty;
      if (stockRequest.unit && stockRequest.unit !== inventoryItem.baseUnit) {
        const { convertToBase: convertToBase2 } = await Promise.resolve().then(() => (init_measurements(), measurements_exports));
        const category = inventoryItem.measurementCategory || "weight";
        try {
          requestedInBaseUnit = convertToBase2(
            requestedQty,
            stockRequest.unit,
            inventoryItem.baseUnit || "kg",
            category,
            inventoryItem.conversionProfile
          );
        } catch (error) {
          console.error("Unit conversion error:", error);
        }
      }
      if (requestedInBaseUnit > currentStock) {
        return res.status(400).json({
          message: `Insufficient inventory. Available: ${currentStock} ${inventoryItem.baseUnit}, Requested: ${requestedInBaseUnit} ${inventoryItem.baseUnit}`,
          availableStock: currentStock,
          requestedStock: requestedInBaseUnit,
          unit: inventoryItem.baseUnit
        });
      }
      const approvedRequest = await storage.approveStockRequest(id, user.id);
      res.json(approvedRequest);
    } catch (error) {
      console.error("Stock request approval error:", error);
      res.status(500).json({ message: "Failed to approve stock request" });
    }
  });
  app2.patch("/api/hotels/current/stock-requests/:id/deliver", requireActiveUser, async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const userRole = user.role?.name || "";
      if (userRole !== "storekeeper") {
        return res.status(403).json({ message: "Only storekeeper can deliver stock requests" });
      }
      const { id } = req.params;
      const existingRequest = await storage.getStockRequest(id);
      if (!existingRequest || existingRequest.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Stock request not found" });
      }
      if (existingRequest.status !== "approved") {
        return res.status(400).json({ message: "Can only deliver approved stock requests" });
      }
      const request = await storage.deliverStockRequest(id, user.id);
      res.json(request);
    } catch (error) {
      console.error("Stock request delivery error:", error);
      res.status(400).json({ message: "Failed to deliver stock request" });
    }
  });
  app2.post("/api/hotels/current/vehicle-logs", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const validatedData = insertVehicleLogSchema.parse(req.body);
      const logData = {
        ...validatedData,
        hotelId: user.hotelId,
        recordedBy: user.id
      };
      const log2 = await storage.createVehicleLog(logData);
      res.status(201).json(log2);
    } catch (error) {
      console.error("Vehicle log creation error:", error);
      res.status(400).json({ message: "Invalid vehicle log data" });
    }
  });
  app2.patch("/api/vehicle-logs/:id/checkout", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const currentUser = req.user;
      const { id } = req.params;
      const { checkoutTime } = req.body;
      const log2 = await storage.getVehicleLog(id);
      if (!log2 || log2.hotelId !== currentUser.hotelId) {
        return res.status(404).json({ message: "Vehicle log not found" });
      }
      if (log2.checkOut) {
        return res.status(400).json({ message: "Vehicle already checked out" });
      }
      const userRole = currentUser.role?.name || "";
      const isAuthorized = log2.recordedBy === currentUser.id || userRole === "security_head";
      if (!isAuthorized) {
        return res.status(403).json({ message: "Unauthorized to checkout this vehicle" });
      }
      const checkinTime = log2.checkIn ? new Date(log2.checkIn) : /* @__PURE__ */ new Date();
      const checkout = checkoutTime ? new Date(checkoutTime) : /* @__PURE__ */ new Date();
      const minutesDiff = (checkout.getTime() - checkinTime.getTime()) / (1e3 * 60);
      if (minutesDiff < 5) {
        const canOverride = ["manager", "owner", "security_head"].includes(currentUser.role?.name || "");
        if (!canOverride) {
          return res.status(400).json({
            message: "Suspicious checkout timing. Vehicle was checked in less than 5 minutes ago. Contact security supervisor."
          });
        }
        await storage.createSecurityAlert({
          hotelId: log2.hotelId,
          type: "quick_vehicle_checkout",
          description: `Vehicle ${log2.vehicleNumber} checked out ${minutesDiff.toFixed(1)} minutes after check-in`,
          vehicleLogId: id,
          performedBy: currentUser.id,
          overriddenBy: currentUser.id
        });
      }
      const updatedLog = await storage.updateVehicleLog(id, { checkOut: checkout });
      res.json(updatedLog);
    } catch (error) {
      console.error("Vehicle checkout error:", error);
      res.status(500).json({ message: "Failed to checkout vehicle" });
    }
  });
  app2.post("/api/hotels/current/security/officers", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const userRole = user.role?.name || "";
      if (userRole !== "security_head") {
        return res.status(403).json({ message: "Only Security Head can create Surveillance Officers" });
      }
      const officerRole = await storage.getRoleByName("surveillance_officer");
      if (!officerRole) {
        return res.status(400).json({ message: "Surveillance Officer role not found" });
      }
      const { username, password, email, phone } = req.body;
      if (!username || !password || !email || !phone) {
        return res.status(400).json({ message: "Username, password, email, and phone are required" });
      }
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
      const passwordHash = await hashPassword2(password);
      const userData = insertUserSchema.parse({
        username,
        email,
        phone,
        passwordHash,
        roleId: officerRole.id,
        hotelId: user.hotelId,
        createdBy: user.id,
        isActive: true
      });
      const officer = await storage.createUser(userData);
      const { passwordHash: _, ...sanitizedOfficer } = officer;
      res.status(201).json(sanitizedOfficer);
    } catch (error) {
      console.error("Officer creation error:", error);
      res.status(400).json({ message: "Failed to create Surveillance Officer" });
    }
  });
  app2.get("/api/hotels/current/security/officers", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const userRole = user.role?.name || "";
      if (userRole !== "security_head") {
        return res.status(403).json({ message: "Only Security Head can view Surveillance Officers" });
      }
      const allUsers = await storage.getUsersByHotel(user.hotelId);
      const officers = allUsers.filter((u) => u.role?.name === "surveillance_officer");
      res.json(officers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Surveillance Officers" });
    }
  });
  app2.post("/api/hotels/current/security/tasks", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const userRole = user.role?.name || "";
      if (userRole !== "security_head") {
        return res.status(403).json({ message: "Only Security Head can create tasks" });
      }
      const taskData = insertTaskSchema.parse({
        ...req.body,
        hotelId: user.hotelId,
        createdBy: user.id
      });
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      console.error("Task creation error:", error);
      res.status(400).json({ message: "Failed to create task" });
    }
  });
  app2.get("/api/hotels/current/security/tasks", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const userRole = user.role?.name || "";
      if (userRole === "security_head") {
        const allTasks = await storage.getTasksByHotel(user.hotelId);
        res.json(allTasks);
      } else if (userRole === "surveillance_officer") {
        const myTasks = await storage.getTasksByUser(user.id);
        res.json(myTasks);
      } else {
        return res.status(403).json({ message: "Unauthorized" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });
  app2.patch("/api/tasks/:id/status", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      const { id } = req.params;
      const { status } = req.body;
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      if (task.assignedTo !== user.id && task.createdBy !== user.id) {
        return res.status(403).json({ message: "Unauthorized to update this task" });
      }
      const updatedTask = await storage.updateTask(id, { status });
      res.json(updatedTask);
    } catch (error) {
      console.error("Task update error:", error);
      res.status(400).json({ message: "Failed to update task" });
    }
  });
  app2.post("/api/maintenance-requests/:id/forward", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      const { id } = req.params;
      const { financeUserId } = req.body;
      const userRole = user.role?.name || "";
      if (userRole !== "security_head") {
        return res.status(403).json({ message: "Only Security Head can forward maintenance requests" });
      }
      const request = await storage.getMaintenanceRequest(id);
      if (!request || request.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Maintenance request not found" });
      }
      const financeUser = await storage.getUser(financeUserId);
      if (!financeUser || financeUser.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Finance user not found" });
      }
      const updatedRequest = await storage.updateMaintenanceRequest(id, {
        assignedTo: financeUserId,
        status: "forwarded"
      });
      res.json(updatedRequest);
    } catch (error) {
      console.error("Maintenance forward error:", error);
      res.status(400).json({ message: "Failed to forward maintenance request" });
    }
  });
  app2.patch("/api/users/me/duty", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      const { isOnline } = req.body;
      if (typeof isOnline !== "boolean") {
        return res.status(400).json({ message: "Invalid duty status" });
      }
      if (!user.isActive) {
        return res.status(403).json({
          message: "Your account has been deactivated. Contact your manager."
        });
      }
      await storage.updateUserOnlineStatus(user.id, isOnline);
      res.json({ success: true, isOnline });
    } catch (error) {
      console.error("Duty status update error:", error);
      res.status(400).json({ message: "Failed to update duty status" });
    }
  });
  app2.get("/api/hotels/current/meal-plans", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const plans = await storage.getMealPlansByHotel(user.hotelId);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meal plans" });
    }
  });
  app2.get("/api/hotels/:hotelId/meal-plans", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user;
      if (currentUser.role?.name !== "super_admin" && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const plans = await storage.getMealPlansByHotel(hotelId);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meal plans" });
    }
  });
  app2.post("/api/hotels/:hotelId/meal-plans", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      const { hotelId } = req.params;
      const userRole = user.role?.name || "";
      const canManage = ["manager", "owner", "super_admin"].includes(userRole);
      if (!canManage) {
        return res.status(403).json({ message: "Only managers can manage meal plans" });
      }
      const planData = insertMealPlanSchema.parse({
        ...req.body,
        hotelId
      });
      const plan = await storage.createMealPlan(planData);
      res.status(201).json(plan);
    } catch (error) {
      console.error("Meal plan creation error:", error);
      res.status(400).json({ message: "Invalid meal plan data" });
    }
  });
  app2.put("/api/hotels/:hotelId/meal-plans/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      const { id, hotelId } = req.params;
      const userRole = user.role?.name || "";
      const canManage = ["manager", "owner", "super_admin"].includes(userRole);
      if (!canManage) {
        return res.status(403).json({ message: "Only managers can manage meal plans" });
      }
      const planData = insertMealPlanSchema.partial().parse(req.body);
      const plan = await storage.updateMealPlan(id, planData);
      res.json(plan);
    } catch (error) {
      console.error("Meal plan update error:", error);
      res.status(400).json({ message: "Failed to update meal plan" });
    }
  });
  app2.delete("/api/hotels/:hotelId/meal-plans/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      const { id, hotelId } = req.params;
      const userRole = user.role?.name || "";
      const canManage = ["manager", "owner", "super_admin"].includes(userRole);
      if (!canManage) {
        return res.status(403).json({ message: "Only managers can manage meal plans" });
      }
      const success = await storage.deleteMealPlan(id, hotelId);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Meal plan not found" });
      }
    } catch (error) {
      console.error("Meal plan deletion error:", error);
      res.status(400).json({ message: "Failed to delete meal plan" });
    }
  });
  app2.post("/api/meal-vouchers/generate", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { roomId, guestName, mealPlanId, mealPlanType, numberOfPersons, checkInDate, checkOutDate, hotelId } = req.body;
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1e3 * 3600 * 24)));
      const vouchers2 = [];
      for (let i = 0; i < nights; i++) {
        const voucherDate = new Date(checkIn);
        voucherDate.setDate(voucherDate.getDate() + i);
        const voucher = await storage.createMealVoucher({
          hotelId,
          roomId,
          guestName,
          mealPlanId: mealPlanId || null,
          mealPlanType,
          numberOfPersons,
          voucherDate,
          status: "unused"
        });
        vouchers2.push(voucher);
      }
      res.json({ success: true, vouchers: vouchers2 });
    } catch (error) {
      console.error("Meal voucher generation error:", error);
      res.status(500).json({ message: "Failed to generate meal vouchers" });
    }
  });
  app2.get("/api/hotels/current/meal-vouchers", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { status, date } = req.query;
      const vouchers2 = await storage.getMealVouchers(user.hotelId, {
        status,
        date: date ? new Date(date) : void 0
      });
      res.json(vouchers2);
    } catch (error) {
      console.error("Get meal vouchers error:", error);
      res.status(500).json({ message: "Failed to get meal vouchers" });
    }
  });
  app2.get("/api/hotels/:hotelId/meal-vouchers", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { hotelId } = req.params;
      const { status, date } = req.query;
      const vouchers2 = await storage.getMealVouchers(hotelId, {
        status,
        date: date ? new Date(date) : void 0
      });
      res.json(vouchers2);
    } catch (error) {
      console.error("Get meal vouchers error:", error);
      res.status(500).json({ message: "Failed to get meal vouchers" });
    }
  });
  app2.get("/api/meal-vouchers/room/:roomId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { roomId } = req.params;
      const vouchers2 = await storage.getMealVouchersByRoom(roomId);
      res.json(vouchers2);
    } catch (error) {
      console.error("Get room meal vouchers error:", error);
      res.status(500).json({ message: "Failed to get room meal vouchers" });
    }
  });
  app2.post("/api/meal-vouchers/:id/redeem", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      const { id } = req.params;
      const { notes } = req.body;
      const voucher = await storage.redeemMealVoucher(id, user.id, notes);
      if (!voucher) {
        return res.status(404).json({ message: "Voucher not found or already redeemed" });
      }
      res.json({ success: true, voucher });
    } catch (error) {
      console.error("Meal voucher redemption error:", error);
      res.status(500).json({ message: "Failed to redeem meal voucher" });
    }
  });
  app2.get("/api/hotels/current/hall-bookings", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const bookings = await storage.getHallBookingsByHotel(user.hotelId);
      res.json(bookings);
    } catch (error) {
      console.error("Get hall bookings error:", error);
      res.status(500).json({ message: "Failed to get hall bookings" });
    }
  });
  app2.get("/api/hotels/:hotelId/hall-bookings", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user;
      if (currentUser.role?.name !== "super_admin" && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const bookings = await storage.getHallBookingsByHotel(hotelId);
      res.json(bookings);
    } catch (error) {
      console.error("Get hall bookings error:", error);
      res.status(500).json({ message: "Failed to get hall bookings" });
    }
  });
  app2.get("/api/halls/:hallId/bookings", requireActiveUser, async (req, res) => {
    try {
      const { hallId } = req.params;
      const currentUser = req.user;
      const hall = await storage.getHall(hallId);
      if (!hall) {
        return res.status(404).json({ message: "Hall not found" });
      }
      if (currentUser.role?.name !== "super_admin" && currentUser.hotelId !== hall.hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const bookings = await storage.getHallBookingsByHall(hallId);
      res.json(bookings);
    } catch (error) {
      console.error("Get hall bookings by hall error:", error);
      res.status(500).json({ message: "Failed to get hall bookings" });
    }
  });
  app2.get("/api/hall-bookings/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { id } = req.params;
      const booking = await storage.getHallBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Get hall booking error:", error);
      res.status(500).json({ message: "Failed to get hall booking" });
    }
  });
  app2.post("/api/halls/:hallId/check-availability", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { hallId } = req.params;
      const { startTime, endTime, excludeBookingId } = req.body;
      const isAvailable = await storage.checkHallAvailability(
        hallId,
        new Date(startTime),
        new Date(endTime),
        excludeBookingId
      );
      res.json({ available: isAvailable });
    } catch (error) {
      console.error("Check hall availability error:", error);
      res.status(500).json({ message: "Failed to check availability" });
    }
  });
  app2.post("/api/hotels/:hotelId/hall-bookings", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      const { hotelId } = req.params;
      const userRole = user.role?.name || "";
      const canManage = ["manager", "owner", "super_admin"].includes(userRole);
      if (!canManage) {
        return res.status(403).json({ message: "Only managers and owners can create bookings" });
      }
      const bookingData = insertHallBookingSchema.parse({
        ...req.body,
        hotelId,
        createdBy: user.id
      });
      const isAvailable = await storage.checkHallAvailability(
        bookingData.hallId,
        bookingData.bookingStartTime,
        bookingData.bookingEndTime
      );
      if (!isAvailable) {
        return res.status(409).json({ message: "Hall is not available for the selected time" });
      }
      const booking = await storage.createHallBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      console.error("Create hall booking error:", error);
      res.status(400).json({ message: "Failed to create hall booking" });
    }
  });
  app2.put("/api/hall-bookings/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      const { id } = req.params;
      const userRole = user.role?.name || "";
      const canManage = ["manager", "owner", "super_admin"].includes(userRole);
      const isFinance = userRole === "finance";
      const isCashier = userRole === "cashier";
      const isFrontDesk = userRole === "front_desk";
      if (isCashier || isFrontDesk) {
        return res.status(403).json({ message: "Only managers and owners can update bookings" });
      }
      const booking = await storage.getHallBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      const bookingData = insertHallBookingSchema.partial().parse(req.body);
      if (isFinance) {
        const paymentFields = ["totalAmount", "advancePaid", "balanceDue", "paymentMethod"];
        const requestedFields = Object.keys(bookingData);
        const hasNonPaymentFields = requestedFields.some((field) => !paymentFields.includes(field));
        if (hasNonPaymentFields) {
          return res.status(403).json({ message: "Finance can only update payment-related fields" });
        }
      }
      if (canManage && (bookingData.bookingStartTime || bookingData.bookingEndTime)) {
        const startTime = bookingData.bookingStartTime || booking.bookingStartTime;
        const endTime = bookingData.bookingEndTime || booking.bookingEndTime;
        const isAvailable = await storage.checkHallAvailability(
          booking.hallId,
          startTime,
          endTime,
          id
        );
        if (!isAvailable) {
          return res.status(409).json({ message: "Hall is not available for the selected time" });
        }
      }
      if (!canManage && !isFinance) {
        return res.status(403).json({ message: "Insufficient permissions to update bookings" });
      }
      const updatedBooking = await storage.updateHallBooking(id, bookingData);
      res.json(updatedBooking);
    } catch (error) {
      console.error("Update hall booking error:", error);
      res.status(400).json({ message: "Failed to update hall booking" });
    }
  });
  app2.post("/api/hall-bookings/:id/confirm", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      const { id } = req.params;
      const userRole = user.role?.name || "";
      const canConfirm = ["manager", "owner", "super_admin"].includes(userRole);
      if (!canConfirm) {
        return res.status(403).json({ message: "Only managers and owners can confirm bookings" });
      }
      const booking = await storage.confirmHallBooking(id, user.id);
      res.json(booking);
    } catch (error) {
      console.error("Confirm hall booking error:", error);
      res.status(400).json({ message: "Failed to confirm hall booking" });
    }
  });
  app2.post("/api/hall-bookings/:id/cancel", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      const { id } = req.params;
      const { reason } = req.body;
      const userRole = user.role?.name || "";
      const canCancel = ["manager", "owner", "super_admin"].includes(userRole);
      if (!canCancel) {
        return res.status(403).json({ message: "Only managers and owners can cancel bookings" });
      }
      if (!reason) {
        return res.status(400).json({ message: "Cancellation reason is required" });
      }
      const booking = await storage.cancelHallBooking(id, user.id, reason);
      res.json(booking);
    } catch (error) {
      console.error("Cancel hall booking error:", error);
      res.status(400).json({ message: "Failed to cancel hall booking" });
    }
  });
  app2.patch("/api/hotels/:hotelId/hall-bookings/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      const { hotelId, id } = req.params;
      if (user.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const userRole = user.role?.name || "";
      const canManage = ["manager", "owner", "super_admin", "front_desk", "finance", "cashier"].includes(userRole);
      if (!canManage) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const booking = await storage.getHallBooking(id);
      if (!booking || booking.hotelId !== hotelId) {
        return res.status(404).json({ message: "Booking not found" });
      }
      const updateData = {};
      if (req.body.actualNumberOfPeople !== void 0) updateData.actualNumberOfPeople = req.body.actualNumberOfPeople;
      if (req.body.customServices !== void 0) updateData.customServices = req.body.customServices;
      if (req.body.totalAmount !== void 0) updateData.totalAmount = req.body.totalAmount;
      if (req.body.balanceDue !== void 0) updateData.balanceDue = req.body.balanceDue;
      if (req.body.paymentMethod !== void 0) updateData.paymentMethod = req.body.paymentMethod;
      if (req.body.status !== void 0) updateData.status = req.body.status;
      if (req.body.status === "completed") updateData.finalizedBy = user.id;
      if (req.body.status === "completed") updateData.finalizedAt = /* @__PURE__ */ new Date();
      const updatedBooking = await storage.updateHallBooking(id, updateData);
      res.json(updatedBooking);
    } catch (error) {
      console.error("Update hall booking error:", error);
      res.status(400).json({ message: "Failed to update hall booking" });
    }
  });
  app2.post("/api/hotels/:hotelId/booking-payments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      const { hotelId } = req.params;
      if (user.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const userRole = user.role?.name || "";
      const canRecord = ["manager", "owner", "super_admin", "front_desk", "finance", "cashier"].includes(userRole);
      if (!canRecord) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const paymentData = {
        hotelId,
        bookingId: req.body.bookingId,
        amount: req.body.amount,
        paymentMethod: req.body.paymentMethod,
        receiptNumber: req.body.receiptNumber || null,
        notes: req.body.notes || null,
        recordedBy: user.id
      };
      const payment = await storage.createBookingPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      console.error("Create booking payment error:", error);
      res.status(400).json({ message: "Failed to record payment" });
    }
  });
  app2.get("/api/halls/:hallId/calendar", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      const { hallId } = req.params;
      const { date } = req.query;
      const hall = await db.query.halls.findFirst({
        where: and2(
          eq2(halls.id, hallId),
          eq2(halls.hotelId, user.hotelId)
        )
      });
      if (!hall) {
        return res.status(404).json({ message: "Hall not found" });
      }
      const targetDate = date ? new Date(date) : /* @__PURE__ */ new Date();
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      const bookings = await db.query.hallBookings.findMany({
        where: and2(
          eq2(hallBookings.hallId, hallId),
          eq2(hallBookings.hotelId, user.hotelId),
          sql3`${hallBookings.bookingStartTime} < ${endOfDay.toISOString()}`,
          sql3`${hallBookings.bookingEndTime} > ${startOfDay.toISOString()}`
        ),
        with: {
          guest: true
        }
      });
      const slots = bookings.map((booking) => ({
        id: booking.id,
        startTime: booking.bookingStartTime,
        endTime: booking.bookingEndTime,
        status: booking.status,
        customerName: booking.customerName,
        color: booking.status === "confirmed" ? "red" : booking.status === "in_progress" ? "yellow" : "gray"
      }));
      res.json({ date: targetDate, slots });
    } catch (error) {
      console.error("Get hall calendar error:", error);
      res.status(500).json({ message: "Failed to get hall calendar" });
    }
  });
  app2.post("/api/halls/check-availability-quick", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      const { hallId, date, startTime, endTime } = req.body;
      const hall = await db.query.halls.findFirst({
        where: and2(
          eq2(halls.id, hallId),
          eq2(halls.hotelId, user.hotelId)
        )
      });
      if (!hall) {
        return res.status(404).json({ message: "Hall not found" });
      }
      const start = /* @__PURE__ */ new Date(`${date}T${startTime}:00`);
      const end = /* @__PURE__ */ new Date(`${date}T${endTime}:00`);
      const isAvailable = await storage.checkHallAvailability(hallId, start, end);
      let suggestions = [];
      if (!isAvailable) {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        const bookings = await db.query.hallBookings.findMany({
          where: and2(
            eq2(hallBookings.hallId, hallId),
            eq2(hallBookings.hotelId, user.hotelId),
            ne2(hallBookings.status, "cancelled"),
            sql3`${hallBookings.bookingStartTime} < ${dayEnd.toISOString()}`,
            sql3`${hallBookings.bookingEndTime} > ${dayStart.toISOString()}`
          ),
          orderBy: [asc2(hallBookings.bookingStartTime)]
        });
        const duration = (end.getTime() - start.getTime()) / (1e3 * 60 * 60);
        const slots = [];
        let currentTime = new Date(dayStart);
        currentTime.setHours(6, 0, 0, 0);
        for (const booking of bookings) {
          const bookingStart = new Date(booking.bookingStartTime);
          const gap = (bookingStart.getTime() - currentTime.getTime()) / (1e3 * 60 * 60);
          if (gap >= duration) {
            slots.push({
              startTime: currentTime.toISOString(),
              endTime: new Date(currentTime.getTime() + duration * 60 * 60 * 1e3).toISOString()
            });
          }
          currentTime = new Date(booking.bookingEndTime);
        }
        const endOfOperations = new Date(dayStart);
        endOfOperations.setHours(22, 0, 0, 0);
        const finalGap = (endOfOperations.getTime() - currentTime.getTime()) / (1e3 * 60 * 60);
        if (finalGap >= duration) {
          slots.push({
            startTime: currentTime.toISOString(),
            endTime: new Date(currentTime.getTime() + duration * 60 * 60 * 1e3).toISOString()
          });
        }
        suggestions = slots.slice(0, 3);
      }
      res.json({ available: isAvailable, suggestions });
    } catch (error) {
      console.error("Quick availability check error:", error);
      res.status(500).json({ message: "Failed to check availability" });
    }
  });
  app2.get("/api/guests/search", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      const { phone, email } = req.query;
      if (!phone && !email) {
        return res.status(400).json({ message: "Phone or email is required" });
      }
      let guest = null;
      if (phone) {
        guest = await db.query.guests.findFirst({
          where: and2(
            eq2(guests.hotelId, user.hotelId),
            eq2(guests.phone, phone)
          )
        });
      } else if (email) {
        guest = await db.query.guests.findFirst({
          where: and2(
            eq2(guests.hotelId, user.hotelId),
            eq2(guests.email, email)
          )
        });
      }
      res.json(guest || null);
    } catch (error) {
      console.error("Guest search error:", error);
      res.status(500).json({ message: "Failed to search guest" });
    }
  });
  app2.get("/api/service-packages", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      const packages = await db.query.servicePackages.findMany({
        where: eq2(servicePackages.hotelId, user.hotelId)
      });
      res.json(packages);
    } catch (error) {
      console.error("Get service packages error:", error);
      res.status(500).json({ message: "Failed to get service packages" });
    }
  });
  app2.post("/api/service-packages", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      const userRole = user.role?.name || "";
      const canManage = ["manager", "owner", "super_admin"].includes(userRole);
      if (!canManage) {
        return res.status(403).json({ message: "Only managers can create service packages" });
      }
      const packageData = insertServicePackageSchema.parse({
        ...req.body,
        hotelId: user.hotelId
      });
      const [newPackage] = await db.insert(servicePackages).values(packageData).returning();
      res.status(201).json(newPackage);
    } catch (error) {
      console.error("Create service package error:", error);
      res.status(400).json({ message: "Failed to create service package" });
    }
  });
  app2.put("/api/service-packages/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      const { id } = req.params;
      const userRole = user.role?.name || "";
      const canManage = ["manager", "owner", "super_admin"].includes(userRole);
      if (!canManage) {
        return res.status(403).json({ message: "Only managers can update service packages" });
      }
      const packageData = insertServicePackageSchema.partial().parse(req.body);
      const [updated] = await db.update(servicePackages).set({ ...packageData, updatedAt: /* @__PURE__ */ new Date() }).where(and2(
        eq2(servicePackages.id, id),
        eq2(servicePackages.hotelId, user.hotelId)
      )).returning();
      if (!updated) {
        return res.status(404).json({ message: "Service package not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Update service package error:", error);
      res.status(400).json({ message: "Failed to update service package" });
    }
  });
  app2.delete("/api/service-packages/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      const { id } = req.params;
      const userRole = user.role?.name || "";
      const canManage = ["manager", "owner", "super_admin"].includes(userRole);
      if (!canManage) {
        return res.status(403).json({ message: "Only managers can delete service packages" });
      }
      await db.delete(servicePackages).where(and2(
        eq2(servicePackages.id, id),
        eq2(servicePackages.hotelId, user.hotelId)
      ));
      res.status(204).send();
    } catch (error) {
      console.error("Delete service package error:", error);
      res.status(400).json({ message: "Failed to delete service package" });
    }
  });
  app2.get("/api/bookings/:bookingId/payments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { bookingId } = req.params;
      const payments2 = await db.query.bookingPayments.findMany({
        where: eq2(bookingPayments.bookingId, bookingId),
        with: {
          recordedBy: {
            columns: {
              id: true,
              username: true
            }
          }
        },
        orderBy: [asc2(bookingPayments.createdAt)]
      });
      res.json(payments2);
    } catch (error) {
      console.error("Get booking payments error:", error);
      res.status(500).json({ message: "Failed to get booking payments" });
    }
  });
  app2.post("/api/bookings/:bookingId/payments", requireActiveUser, async (req, res) => {
    try {
      const user = req.user;
      const { bookingId } = req.params;
      const userRole = user.role?.name || "";
      const canRecord = ["manager", "owner", "super_admin", "front_desk", "cashier", "finance"].includes(userRole);
      if (!canRecord) {
        return res.status(403).json({ message: "Insufficient permissions to record payments" });
      }
      const booking = await db.query.hallBookings.findFirst({
        where: eq2(hallBookings.id, bookingId)
      });
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      const paymentData = insertBookingPaymentSchema.parse({
        ...req.body,
        bookingId,
        hotelId: user.hotelId,
        recordedBy: user.id
      });
      const [payment] = await db.insert(bookingPayments).values(paymentData).returning();
      const newAdvancePaid = Number(booking.advancePaid || 0) + Number(paymentData.amount);
      const newBalanceDue = Number(booking.totalAmount) - newAdvancePaid;
      await db.update(hallBookings).set({
        advancePaid: newAdvancePaid.toString(),
        balanceDue: newBalanceDue.toString(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(hallBookings.id, bookingId));
      res.status(201).json(payment);
    } catch (error) {
      console.error("Record payment error:", error);
      res.status(400).json({ message: "Failed to record payment" });
    }
  });
  app2.post("/api/attendance/clock-in", requireActiveUser, async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const canClockInResult = await storage.canClockIn(user.id);
      if (!canClockInResult.canClockIn) {
        return res.status(400).json({ message: canClockInResult.reason || "Cannot clock in" });
      }
      const { location } = req.body;
      const ip = req.ip || req.socket.remoteAddress || null;
      const source = req.body.source || "web";
      const clockInTime = /* @__PURE__ */ new Date();
      const attendanceRecord = await storage.createAttendance(
        user.id,
        user.hotelId,
        clockInTime,
        location || null,
        ip,
        source
      );
      await storage.updateUserOnlineStatus(user.id, true);
      wsEvents.attendanceUpdated(user.hotelId, attendanceRecord);
      res.status(201).json(attendanceRecord);
    } catch (error) {
      console.error("Clock-in error:", error);
      res.status(500).json({ message: "Failed to clock in" });
    }
  });
  app2.post("/api/attendance/clock-out", requireActiveUser, async (req, res) => {
    try {
      const user = req.user;
      const activeAttendance = await storage.getActiveAttendance(user.id);
      if (!activeAttendance) {
        return res.status(400).json({ message: "No active clock-in found" });
      }
      const { location } = req.body;
      const ip = req.ip || req.socket.remoteAddress || null;
      const source = req.body.source || "web";
      const clockOutTime = /* @__PURE__ */ new Date();
      const clockInTime = new Date(activeAttendance.clockInTime);
      if (clockOutTime <= clockInTime) {
        return res.status(400).json({ message: "Clock-out time must be after clock-in time" });
      }
      const updatedRecord = await storage.clockOut(
        activeAttendance.id,
        clockOutTime,
        location || null,
        ip,
        source
      );
      await storage.updateUserOnlineStatus(user.id, false);
      wsEvents.attendanceUpdated(user.hotelId, updatedRecord);
      res.json(updatedRecord);
    } catch (error) {
      console.error("Clock-out error:", error);
      res.status(500).json({ message: "Failed to clock out" });
    }
  });
  app2.get("/api/attendance/history", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      const { startDate, endDate } = req.query;
      let start;
      let end;
      if (startDate && typeof startDate === "string") {
        start = new Date(startDate);
      }
      if (endDate && typeof endDate === "string") {
        end = new Date(endDate);
      }
      if (!start) {
        const now = /* @__PURE__ */ new Date();
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      const records = await storage.getAttendanceByUser(user.id, start, end);
      res.json(records);
    } catch (error) {
      console.error("Get attendance history error:", error);
      res.status(500).json({ message: "Failed to fetch attendance history" });
    }
  });
  app2.get("/api/attendance/daily", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const userRole = user.role?.name || "";
      const managerRoles = ["super_admin", "owner", "manager", "housekeeping_supervisor", "restaurant_bar_manager", "security_head", "finance"];
      if (!managerRoles.includes(userRole)) {
        return res.status(403).json({ message: "Only managers can view hotel attendance" });
      }
      const { date } = req.query;
      const queryDate = date && typeof date === "string" ? new Date(date) : /* @__PURE__ */ new Date();
      const records = await storage.getAttendanceByHotel(user.hotelId, queryDate);
      res.json(records);
    } catch (error) {
      console.error("Get daily attendance error:", error);
      res.status(500).json({ message: "Failed to fetch daily attendance" });
    }
  });
  app2.get("/api/attendance/status", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      const activeAttendance = await storage.getActiveAttendance(user.id);
      res.json({
        isOnDuty: !!activeAttendance,
        attendance: activeAttendance || null
      });
    } catch (error) {
      console.error("Get attendance status error:", error);
      res.status(500).json({ message: "Failed to fetch attendance status" });
    }
  });
  app2.get("/api/hotels/current/attendance", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const userRole = user.role?.name || "";
      const managerRoles = ["super_admin", "owner", "manager", "housekeeping_supervisor", "restaurant_bar_manager", "security_head", "finance"];
      if (!managerRoles.includes(userRole)) {
        return res.status(403).json({ message: "Only managers can view hotel attendance records" });
      }
      const { startDate, endDate } = req.query;
      const start = startDate && typeof startDate === "string" ? new Date(startDate) : void 0;
      const end = endDate && typeof endDate === "string" ? new Date(endDate) : void 0;
      const records = await storage.getAllAttendanceByHotel(user.hotelId, start, end);
      res.json(records);
    } catch (error) {
      console.error("Get all attendance error:", error);
      res.status(500).json({ message: "Failed to fetch attendance records" });
    }
  });
  app2.get("/api/audit-logs", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const currentUser = req.user;
      if (!currentUser || !currentUser.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const canViewAudit = ["manager", "owner", "finance"].includes(currentUser.role?.name || "");
      if (!canViewAudit) {
        return res.status(403).json({
          message: "Only managers can view audit logs"
        });
      }
      const { startDate, endDate, userId, action, resourceType, limit } = req.query;
      const conditions = [eq2(auditLogs.hotelId, currentUser.hotelId)];
      if (userId && typeof userId === "string") {
        conditions.push(eq2(auditLogs.userId, userId));
      }
      if (action && typeof action === "string") {
        conditions.push(eq2(auditLogs.action, action));
      }
      if (resourceType && typeof resourceType === "string") {
        conditions.push(eq2(auditLogs.resourceType, resourceType));
      }
      if (startDate && typeof startDate === "string") {
        conditions.push(sql3`${auditLogs.createdAt} >= ${new Date(startDate).toISOString()}`);
      }
      if (endDate && typeof endDate === "string") {
        conditions.push(sql3`${auditLogs.createdAt} <= ${new Date(endDate).toISOString()}`);
      }
      const maxLimit = limit && typeof limit === "string" ? Math.min(parseInt(limit), 1e3) : 500;
      const logs = await db.select({
        id: auditLogs.id,
        hotelId: auditLogs.hotelId,
        userId: auditLogs.userId,
        action: auditLogs.action,
        resourceType: auditLogs.resourceType,
        resourceId: auditLogs.resourceId,
        details: auditLogs.details,
        ipAddress: auditLogs.ipAddress,
        userAgent: auditLogs.userAgent,
        success: auditLogs.success,
        errorMessage: auditLogs.errorMessage,
        createdAt: auditLogs.createdAt,
        user: sql3`json_build_object(
            'id', ${users.id},
            'username', ${users.username},
            'role', json_build_object(
              'id', ${roles.id},
              'name', ${roles.name}
            )
          )`
      }).from(auditLogs).leftJoin(users, eq2(auditLogs.userId, users.id)).leftJoin(roles, eq2(users.roleId, roles.id)).where(and2(...conditions)).orderBy(sql3`${auditLogs.createdAt} DESC`).limit(maxLimit);
      res.json(logs);
    } catch (error) {
      console.error("Audit log fetch error:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });
  app2.get("/api/maintenance-requests/:id/history", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const currentUser = req.user;
      const canView = ["manager", "owner", "super_admin"].includes(currentUser.role?.name || "");
      if (!canView) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const history = await db.select({
        id: maintenanceStatusHistory.id,
        previousStatus: maintenanceStatusHistory.previousStatus,
        newStatus: maintenanceStatusHistory.newStatus,
        notes: maintenanceStatusHistory.notes,
        createdAt: maintenanceStatusHistory.createdAt,
        changedBy: {
          id: users.id,
          username: users.username,
          email: users.email,
          role: roles.name
        }
      }).from(maintenanceStatusHistory).leftJoin(users, eq2(maintenanceStatusHistory.changedBy, users.id)).leftJoin(roles, eq2(users.roleId, roles.id)).where(eq2(maintenanceStatusHistory.requestId, req.params.id)).orderBy(desc2(maintenanceStatusHistory.createdAt));
      res.json(history);
    } catch (error) {
      console.error("Fetch maintenance history error:", error);
      res.status(500).json({ message: "Failed to fetch maintenance history" });
    }
  });
  app2.get("/api/price-change-logs", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const currentUser = req.user;
      const canView = ["manager", "owner", "super_admin", "finance"].includes(currentUser.role?.name || "");
      if (!canView) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const { itemType, startDate, endDate, limit } = req.query;
      const conditions = [eq2(priceChangeLogs.hotelId, currentUser.hotelId)];
      if (itemType && typeof itemType === "string") {
        conditions.push(eq2(priceChangeLogs.itemType, itemType));
      }
      if (startDate && typeof startDate === "string") {
        conditions.push(sql3`${priceChangeLogs.createdAt} >= ${new Date(startDate).toISOString()}`);
      }
      if (endDate && typeof endDate === "string") {
        conditions.push(sql3`${priceChangeLogs.createdAt} <= ${new Date(endDate).toISOString()}`);
      }
      const maxLimit = limit && typeof limit === "string" ? Math.min(parseInt(limit), 500) : 100;
      const logs = await db.select({
        id: priceChangeLogs.id,
        itemId: priceChangeLogs.itemId,
        itemType: priceChangeLogs.itemType,
        itemName: priceChangeLogs.itemName,
        previousPrice: priceChangeLogs.previousPrice,
        newPrice: priceChangeLogs.newPrice,
        createdAt: priceChangeLogs.createdAt,
        changedBy: {
          id: users.id,
          username: users.username,
          email: users.email,
          role: roles.name
        }
      }).from(priceChangeLogs).leftJoin(users, eq2(priceChangeLogs.changedBy, users.id)).leftJoin(roles, eq2(users.roleId, roles.id)).where(and2(...conditions)).orderBy(desc2(priceChangeLogs.createdAt)).limit(maxLimit);
      res.json(logs);
    } catch (error) {
      console.error("Fetch price change logs error:", error);
      res.status(500).json({ message: "Failed to fetch price change logs" });
    }
  });
  app2.get("/api/tax-change-logs", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const currentUser = req.user;
      const canView = ["manager", "owner", "super_admin", "finance"].includes(currentUser.role?.name || "");
      if (!canView) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const logs = await db.select({
        id: taxChangeLogs.id,
        taxType: taxChangeLogs.taxType,
        previousPercent: taxChangeLogs.previousPercent,
        newPercent: taxChangeLogs.newPercent,
        previousActive: taxChangeLogs.previousActive,
        newActive: taxChangeLogs.newActive,
        createdAt: taxChangeLogs.createdAt,
        changedBy: {
          id: users.id,
          username: users.username,
          email: users.email,
          role: roles.name
        }
      }).from(taxChangeLogs).leftJoin(users, eq2(taxChangeLogs.changedBy, users.id)).leftJoin(roles, eq2(users.roleId, roles.id)).where(eq2(taxChangeLogs.hotelId, currentUser.hotelId)).orderBy(desc2(taxChangeLogs.createdAt)).limit(100);
      res.json(logs);
    } catch (error) {
      console.error("Fetch tax change logs error:", error);
      res.status(500).json({ message: "Failed to fetch tax change logs" });
    }
  });
  app2.get("/api/inventory-movement-logs", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const currentUser = req.user;
      const canView = ["manager", "owner", "super_admin", "storekeeper", "finance"].includes(currentUser.role?.name || "");
      if (!canView) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const { itemId, startDate, endDate, transactionType, limit } = req.query;
      const conditions = [eq2(inventoryTransactions.hotelId, currentUser.hotelId)];
      if (itemId && typeof itemId === "string") {
        conditions.push(eq2(inventoryTransactions.itemId, itemId));
      }
      if (transactionType && typeof transactionType === "string") {
        conditions.push(eq2(inventoryTransactions.transactionType, transactionType));
      }
      if (startDate && typeof startDate === "string") {
        conditions.push(sql3`${inventoryTransactions.createdAt} >= ${new Date(startDate).toISOString()}`);
      }
      if (endDate && typeof endDate === "string") {
        conditions.push(sql3`${inventoryTransactions.createdAt} <= ${new Date(endDate).toISOString()}`);
      }
      const maxLimit = limit && typeof limit === "string" ? Math.min(parseInt(limit), 500) : 100;
      const logs = await db.select({
        id: inventoryTransactions.id,
        transactionType: inventoryTransactions.transactionType,
        qtyPackage: inventoryTransactions.qtyPackage,
        qtyBase: inventoryTransactions.qtyBase,
        department: inventoryTransactions.department,
        notes: inventoryTransactions.notes,
        createdAt: inventoryTransactions.createdAt,
        item: {
          id: inventoryItems.id,
          name: inventoryItems.name,
          sku: inventoryItems.sku,
          unit: inventoryItems.unit
        },
        recordedBy: {
          id: users.id,
          username: users.username,
          role: roles.name
        },
        issuedTo: {
          id: sql3`issued_user.id`,
          username: sql3`issued_user.username`,
          role: sql3`issued_role.name`
        }
      }).from(inventoryTransactions).leftJoin(inventoryItems, eq2(inventoryTransactions.itemId, inventoryItems.id)).leftJoin(users, eq2(inventoryTransactions.recordedBy, users.id)).leftJoin(roles, eq2(users.roleId, roles.id)).leftJoin(sql3`users AS issued_user`, sql3`${inventoryTransactions.issuedToUserId} = issued_user.id`).leftJoin(sql3`roles AS issued_role`, sql3`issued_user.role_id = issued_role.id`).where(and2(...conditions)).orderBy(desc2(inventoryTransactions.createdAt)).limit(maxLimit);
      res.json(logs);
    } catch (error) {
      console.error("Fetch inventory movement logs error:", error);
      res.status(500).json({ message: "Failed to fetch inventory movement logs" });
    }
  });
  app2.get("/api/staff-activity-summary", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const currentUser = req.user;
      const canView = ["manager", "owner", "super_admin"].includes(currentUser.role?.name || "");
      if (!canView) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const { userId, startDate, endDate } = req.query;
      const conditions = [eq2(auditLogs.hotelId, currentUser.hotelId)];
      if (userId && typeof userId === "string") {
        conditions.push(eq2(auditLogs.userId, userId));
      }
      if (startDate && typeof startDate === "string") {
        conditions.push(sql3`${auditLogs.createdAt} >= ${new Date(startDate).toISOString()}`);
      }
      if (endDate && typeof endDate === "string") {
        conditions.push(sql3`${auditLogs.createdAt} <= ${new Date(endDate).toISOString()}`);
      }
      const activityLogs = await db.select({
        userId: auditLogs.userId,
        username: users.username,
        role: roles.name,
        action: auditLogs.action,
        resourceType: auditLogs.resourceType,
        count: sql3`COUNT(*)::int`,
        lastActivity: sql3`MAX(${auditLogs.createdAt})`
      }).from(auditLogs).leftJoin(users, eq2(auditLogs.userId, users.id)).leftJoin(roles, eq2(users.roleId, roles.id)).where(and2(...conditions)).groupBy(auditLogs.userId, users.username, roles.name, auditLogs.action, auditLogs.resourceType).orderBy(desc2(sql3`MAX(${auditLogs.createdAt})`)).limit(200);
      res.json(activityLogs);
    } catch (error) {
      console.error("Fetch staff activity summary error:", error);
      res.status(500).json({ message: "Failed to fetch staff activity summary" });
    }
  });
  app2.get("/api/transactions/:id/details", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const currentUser = req.user;
      const canView = ["manager", "owner", "super_admin", "finance"].includes(currentUser.role?.name || "");
      if (!canView) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const transaction = await db.select({
        id: transactions.id,
        txnType: transactions.txnType,
        amount: transactions.amount,
        currency: transactions.currency,
        paymentMethod: transactions.paymentMethod,
        purpose: transactions.purpose,
        reference: transactions.reference,
        details: transactions.details,
        createdAt: transactions.createdAt,
        isVoided: transactions.isVoided,
        voidReason: transactions.voidReason,
        voidedAt: transactions.voidedAt,
        vendor: {
          id: vendors.id,
          name: vendors.name,
          contact: vendors.contact
        },
        createdBy: {
          id: sql3`creator.id`,
          username: sql3`creator.username`,
          email: sql3`creator.email`,
          role: sql3`creator_role.name`
        },
        voidedBy: {
          id: sql3`voider.id`,
          username: sql3`voider.username`,
          role: sql3`voider_role.name`
        }
      }).from(transactions).leftJoin(vendors, eq2(transactions.vendorId, vendors.id)).leftJoin(sql3`users AS creator`, sql3`${transactions.createdBy} = creator.id`).leftJoin(sql3`roles AS creator_role`, sql3`creator.role_id = creator_role.id`).leftJoin(sql3`users AS voider`, sql3`${transactions.voidedBy} = voider.id`).leftJoin(sql3`roles AS voider_role`, sql3`voider.role_id = voider_role.id`).where(eq2(transactions.id, req.params.id)).limit(1);
      if (!transaction || transaction.length === 0) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction[0]);
    } catch (error) {
      console.error("Fetch transaction details error:", error);
      res.status(500).json({ message: "Failed to fetch transaction details" });
    }
  });
  app2.get("/api/rooms/:roomId/status-history", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const currentUser = req.user;
      const canView = ["manager", "owner", "super_admin", "front_desk", "housekeeping_supervisor"].includes(currentUser.role?.name || "");
      if (!canView) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const history = await db.select({
        id: roomStatusLogs.id,
        roomNumber: roomStatusLogs.roomNumber,
        previousStatus: roomStatusLogs.previousStatus,
        newStatus: roomStatusLogs.newStatus,
        reason: roomStatusLogs.reason,
        createdAt: roomStatusLogs.createdAt,
        changedBy: {
          id: users.id,
          username: users.username,
          role: roles.name
        }
      }).from(roomStatusLogs).leftJoin(users, eq2(roomStatusLogs.changedBy, users.id)).leftJoin(roles, eq2(users.roleId, roles.id)).where(eq2(roomStatusLogs.roomId, req.params.roomId)).orderBy(desc2(roomStatusLogs.createdAt)).limit(100);
      res.json(history);
    } catch (error) {
      console.error("Fetch room status history error:", error);
      res.status(500).json({ message: "Failed to fetch room status history" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
init_storage();
init_db();
init_schema();
import cron from "node-cron";
import { and as and3, eq as eq3, isNull as isNull3 } from "drizzle-orm";
process.env.TZ = "Asia/Kathmandu";
var app = express2();
app.set("etag", false);
app.use(express2.json({ limit: "10mb" }));
app.use(express2.urlencoded({ extended: false, limit: "10mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  setupWebSocket(server);
  log("WebSocket server initialized");
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  cron.schedule("*/5 * * * *", async () => {
    try {
      log("Running periodic KOT order status sync...");
      const activeOrders = await db.select().from(kotOrders);
      const ordersToSync = activeOrders.filter(
        (order) => order.status !== "completed" && order.status !== "cancelled"
      );
      for (const order of ordersToSync) {
        await storage.updateKotOrderStatus(order.id);
      }
      log(`KOT sync completed for ${ordersToSync.length} orders`);
    } catch (error) {
      console.error("Error in KOT sync cron job:", error);
    }
  });
  log("KOT order status sync cron job scheduled (every 5 minutes)");
  cron.schedule("0 0 1 1 *", async () => {
    try {
      log("Running annual leave balance reset...");
      const newYear = (/* @__PURE__ */ new Date()).getFullYear();
      const activeUsers = await db.select().from(users).where(and3(
        eq3(users.isActive, true),
        isNull3(users.deletedAt)
      ));
      let resetCount = 0;
      for (const user of activeUsers) {
        if (user.hotelId) {
          await storage.initializeLeaveBalances(user.id, user.hotelId, newYear);
          resetCount++;
        }
      }
      log(`Leave balances reset completed for ${resetCount} users for year ${newYear}`);
    } catch (error) {
      console.error("Error in annual leave balance reset cron job:", error);
    }
  });
  log("Annual leave balance reset cron job scheduled (every January 1st)");
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
