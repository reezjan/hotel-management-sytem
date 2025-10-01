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
  index
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
  vatNo: text("vat_no"),
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
  email: text("email"),
  phone: text("phone"),
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
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  action: text("action").notNull(),
  changedBy: uuid("changed_by").references(() => users.id),
  changeTime: timestamp("change_time", { withTimezone: true }).defaultNow(),
  payload: jsonb("payload")
});

// Room Types Table
export const roomTypes = pgTable("room_types", {
  id: serial("id").primaryKey(),
  hotelId: uuid("hotel_id").references(() => hotels.id, { onDelete: "cascade" }),
  name: text("name"),
  description: text("description")
});

// Rooms Table
export const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id, { onDelete: "cascade" }),
  roomNumber: text("room_number"),
  roomTypeId: integer("room_type_id").references(() => roomTypes.id),
  isOccupied: boolean("is_occupied").default(false),
  occupantDetails: jsonb("occupant_details"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true })
});

// Halls Table
export const halls = pgTable("halls", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  name: text("name"),
  capacity: integer("capacity"),
  priceInhouse: numeric("price_inhouse", { precision: 12, scale: 2 }),
  priceWalkin: numeric("price_walkin", { precision: 12, scale: 2 }),
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
  reorderLevel: numeric("reorder_level", { precision: 12, scale: 3 }).default('0'),
  costPerUnit: numeric("cost_per_unit", { precision: 12, scale: 2 }).default('0'),
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
  reason: text("reason").notNull(),
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
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true })
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
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
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
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Restaurant Tables Table
export const restaurantTables = pgTable("restaurant_tables", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  name: text("name"),
  capacity: integer("capacity"),
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
  status: text("status"),
  clockIn: timestamp("clock_in", { withTimezone: true }),
  clockOut: timestamp("clock_out", { withTimezone: true }),
  source: text("source"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
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
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// Hotel Taxes Table
export const hotelTaxes = pgTable("hotel_taxes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  taxType: text("tax_type").notNull(),
  percent: numeric("percent", { precision: 5, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

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
  vehicleNumber: text("vehicle_number"),
  vehicleType: text("vehicle_type"),
  driverName: text("driver_name"),
  purpose: text("purpose"),
  checkIn: timestamp("check_in", { withTimezone: true }).defaultNow(),
  checkOut: timestamp("check_out", { withTimezone: true }),
  recordedBy: uuid("recorded_by").references(() => users.id)
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
  roomServiceOrders: many(roomServiceOrders)
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

// Schema exports for forms
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true
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

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
  createdAt: true
}).extend({
  price: z.union([z.string(), z.number()]).transform((val) => String(val))
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  deletedAt: true
});

export const insertMaintenanceRequestSchema = createInsertSchema(maintenanceRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true
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
  updatedAt: true
}).extend({
  startDate: z.string().or(z.date()).transform((val) => val instanceof Date ? val : new Date(val)),
  endDate: z.string().or(z.date()).transform((val) => val instanceof Date ? val : new Date(val))
});

export const insertWastageSchema = createInsertSchema(wastages).omit({
  id: true,
  createdAt: true,
  hotelId: true,
  recordedBy: true
});

export const insertVehicleLogSchema = createInsertSchema(vehicleLogs).omit({
  id: true,
  hotelId: true,
  recordedBy: true
});

export const updateKotItemSchema = z.object({
  status: z.enum(['pending', 'approved', 'declined', 'ready']),
  declineReason: z.string().optional()
}).refine(
  (data) => data.status !== 'declined' || (data.declineReason && data.declineReason.trim().length > 0),
  { message: "Decline reason is required when declining a KOT item", path: ['declineReason'] }
);

// Types
export type User = typeof users.$inferSelect;
export type UserWithRole = User & { role?: Role };
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Hotel = typeof hotels.$inferSelect;
export type InsertHotel = z.infer<typeof insertHotelSchema>;
export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
export type InsertMaintenanceRequest = z.infer<typeof insertMaintenanceRequestSchema>;
export type InsertVoucher = z.infer<typeof insertVoucherSchema>;
export type KotOrder = typeof kotOrders.$inferSelect;
export type KotItem = typeof kotItems.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type Vendor = typeof vendors.$inferSelect;
export type RestaurantTable = typeof restaurantTables.$inferSelect;
export type MenuCategory = typeof menuCategories.$inferSelect;
export type HotelTax = typeof hotelTaxes.$inferSelect;
export type Voucher = typeof vouchers.$inferSelect;
export type VehicleLog = typeof vehicleLogs.$inferSelect;
export type InsertVehicleLog = z.infer<typeof insertVehicleLogSchema>;
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
export type Attendance = typeof attendance.$inferSelect;
export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type Wastage = typeof wastages.$inferSelect;
export type InsertWastage = z.infer<typeof insertWastageSchema>;
