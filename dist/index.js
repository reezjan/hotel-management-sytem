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
  halls: () => halls,
  hotelRelations: () => hotelRelations,
  hotelTaxes: () => hotelTaxes,
  hotels: () => hotels,
  insertHotelSchema: () => insertHotelSchema,
  insertMaintenanceRequestSchema: () => insertMaintenanceRequestSchema,
  insertMenuItemSchema: () => insertMenuItemSchema,
  insertRoomSchema: () => insertRoomSchema,
  insertTaskSchema: () => insertTaskSchema,
  insertTransactionSchema: () => insertTransactionSchema,
  insertUserSchema: () => insertUserSchema,
  inventoryConsumptions: () => inventoryConsumptions,
  inventoryItems: () => inventoryItems,
  kotItemRelations: () => kotItemRelations,
  kotItems: () => kotItems,
  kotOrderRelations: () => kotOrderRelations,
  kotOrders: () => kotOrders,
  maintenanceRequests: () => maintenanceRequests,
  menuCategories: () => menuCategories,
  menuItemRelations: () => menuItemRelations,
  menuItems: () => menuItems,
  passwordResets: () => passwordResets,
  payments: () => payments,
  pools: () => pools,
  restaurantTables: () => restaurantTables,
  roleCreationPermissions: () => roleCreationPermissions,
  roles: () => roles,
  roomRelations: () => roomRelations,
  roomServiceOrders: () => roomServiceOrders,
  roomTypes: () => roomTypes,
  rooms: () => rooms,
  services: () => services,
  taskRelations: () => taskRelations,
  tasks: () => tasks,
  transactions: () => transactions,
  userRelations: () => userRelations,
  userSessions: () => userSessions,
  users: () => users,
  vehicleLogs: () => vehicleLogs,
  vendors: () => vendors,
  vouchers: () => vouchers
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
  jsonb
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var hotels, roles, roleCreationPermissions, users, userSessions, auditLogs, roomTypes, rooms, halls, pools, services, inventoryItems, inventoryConsumptions, vendors, transactions, maintenanceRequests, tasks, restaurantTables, menuCategories, menuItems, kotOrders, kotItems, payments, passwordResets, attendance, hotelTaxes, vouchers, vehicleLogs, roomServiceOrders, hotelRelations, userRelations, roomRelations, menuItemRelations, kotOrderRelations, kotItemRelations, taskRelations, insertUserSchema, insertHotelSchema, insertRoomSchema, insertMenuItemSchema, insertTaskSchema, insertTransactionSchema, insertMaintenanceRequestSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    hotels = pgTable("hotels", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      address: text("address"),
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
      entity: text("entity").notNull(),
      entityId: text("entity_id"),
      action: text("action").notNull(),
      changedBy: uuid("changed_by").references(() => users.id),
      changeTime: timestamp("change_time", { withTimezone: true }).defaultNow(),
      payload: jsonb("payload")
    });
    roomTypes = pgTable("room_types", {
      id: serial("id").primaryKey(),
      hotelId: uuid("hotel_id").references(() => hotels.id, { onDelete: "cascade" }),
      name: text("name"),
      description: text("description")
    });
    rooms = pgTable("rooms", {
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
    halls = pgTable("halls", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      name: text("name"),
      capacity: integer("capacity"),
      priceInhouse: numeric("price_inhouse", { precision: 12, scale: 2 }),
      priceWalkin: numeric("price_walkin", { precision: 12, scale: 2 }),
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
      reorderLevel: numeric("reorder_level", { precision: 12, scale: 3 }).default("0"),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
      deletedAt: timestamp("deleted_at", { withTimezone: true })
    });
    inventoryConsumptions = pgTable("inventory_consumptions", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      itemId: uuid("item_id").references(() => inventoryItems.id),
      qty: numeric("qty", { precision: 12, scale: 3 }).notNull(),
      reason: text("reason"),
      referenceEntity: text("reference_entity"),
      createdBy: uuid("created_by").references(() => users.id),
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
      createdBy: uuid("created_by").references(() => users.id),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
      deletedAt: timestamp("deleted_at", { withTimezone: true })
    });
    maintenanceRequests = pgTable("maintenance_requests", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      raisedBy: uuid("raised_by").references(() => users.id),
      department: text("department"),
      description: text("description"),
      status: text("status").default("open"),
      assignedTo: uuid("assigned_to").references(() => users.id),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
    });
    tasks = pgTable("tasks", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      createdBy: uuid("created_by").references(() => users.id),
      assignedTo: uuid("assigned_to").references(() => users.id),
      title: text("title").notNull(),
      description: text("description"),
      status: text("status").default("pending"),
      context: jsonb("context"),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
    });
    restaurantTables = pgTable("restaurant_tables", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      name: text("name"),
      capacity: integer("capacity"),
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
      status: text("status"),
      clockIn: timestamp("clock_in", { withTimezone: true }),
      clockOut: timestamp("clock_out", { withTimezone: true }),
      source: text("source"),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
    });
    hotelTaxes = pgTable("hotel_taxes", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      hotelId: uuid("hotel_id").references(() => hotels.id),
      taxType: text("tax_type").notNull(),
      percent: numeric("percent", { precision: 5, scale: 2 }),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
    });
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
      vehicleNumber: text("vehicle_number"),
      driverName: text("driver_name"),
      purpose: text("purpose"),
      checkIn: timestamp("check_in", { withTimezone: true }).defaultNow(),
      checkOut: timestamp("check_out", { withTimezone: true }),
      recordedBy: uuid("recorded_by").references(() => users.id)
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
      roomServiceOrders: many(roomServiceOrders)
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
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true
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
    insertMenuItemSchema = createInsertSchema(menuItems).omit({
      id: true,
      createdAt: true
    });
    insertTaskSchema = createInsertSchema(tasks).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertTransactionSchema = createInsertSchema(transactions).omit({
      id: true,
      createdAt: true,
      deletedAt: true
    });
    insertMaintenanceRequestSchema = createInsertSchema(maintenanceRequests).omit({
      id: true,
      createdAt: true,
      updatedAt: true
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
    client = postgres(process.env.DATABASE_URL, { ssl: false });
    db = drizzle(client, { schema: schema_exports });
  }
});

// server/storage.ts
import { eq, and, isNull, desc, asc } from "drizzle-orm";
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
        }).from(users).leftJoin(roles, eq(users.roleId, roles.id)).where(and(eq(users.username, username), isNull(users.deletedAt)));
        if (!result) return void 0;
        return {
          ...result,
          role: result.role || void 0
        };
      }
      async getUsersByHotel(hotelId) {
        return await db.select().from(users).where(and(eq(users.hotelId, hotelId), isNull(users.deletedAt))).orderBy(asc(users.username));
      }
      async getUsersByRole(roleId) {
        return await db.select().from(users).where(and(eq(users.roleId, roleId), isNull(users.deletedAt))).orderBy(asc(users.username));
      }
      async createUser(insertUser) {
        const [user] = await db.insert(users).values(insertUser).returning();
        return user;
      }
      async updateUser(id, userData) {
        const [user] = await db.update(users).set({ ...userData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
        return user;
      }
      async deleteUser(id) {
        await db.update(users).set({ deletedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id));
      }
      async updateUserOnlineStatus(id, isOnline) {
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
      // Room operations
      async getRoomsByHotel(hotelId) {
        return await db.select().from(rooms).where(and(eq(rooms.hotelId, hotelId), isNull(rooms.deletedAt))).orderBy(asc(rooms.roomNumber));
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
      // Menu operations
      async getMenuItemsByHotel(hotelId) {
        return await db.select().from(menuItems).where(eq(menuItems.hotelId, hotelId)).orderBy(asc(menuItems.name));
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
      // Transaction operations
      async getTransactionsByHotel(hotelId) {
        return await db.select().from(transactions).where(and(eq(transactions.hotelId, hotelId), isNull(transactions.deletedAt))).orderBy(desc(transactions.createdAt));
      }
      async createTransaction(transactionData) {
        const [transaction] = await db.insert(transactions).values(transactionData).returning();
        return transaction;
      }
      async deleteTransaction(id) {
        await db.update(transactions).set({ deletedAt: /* @__PURE__ */ new Date() }).where(eq(transactions.id, id));
      }
      // Maintenance operations
      async getMaintenanceRequestsByHotel(hotelId) {
        return await db.select().from(maintenanceRequests).where(eq(maintenanceRequests.hotelId, hotelId)).orderBy(desc(maintenanceRequests.createdAt));
      }
      async createMaintenanceRequest(requestData) {
        const [request] = await db.insert(maintenanceRequests).values(requestData).returning();
        return request;
      }
      async updateMaintenanceRequest(id, requestData) {
        const [request] = await db.update(maintenanceRequests).set({ ...requestData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(maintenanceRequests.id, id)).returning();
        return request;
      }
      // KOT operations
      async getKotOrdersByHotel(hotelId) {
        return await db.select().from(kotOrders).where(eq(kotOrders.hotelId, hotelId)).orderBy(desc(kotOrders.createdAt));
      }
      async getKotItems(kotId) {
        return await db.select().from(kotItems).where(eq(kotItems.kotId, kotId)).orderBy(asc(kotItems.createdAt));
      }
      async createKotOrder(kotData) {
        const [kot] = await db.insert(kotOrders).values(kotData).returning();
        return kot;
      }
      async updateKotOrder(id, kotData) {
        const [kot] = await db.update(kotOrders).set({ ...kotData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(kotOrders.id, id)).returning();
        return kot;
      }
      // Inventory operations
      async getInventoryItemsByHotel(hotelId) {
        return await db.select().from(inventoryItems).where(and(eq(inventoryItems.hotelId, hotelId), isNull(inventoryItems.deletedAt))).orderBy(asc(inventoryItems.name));
      }
      async getLowStockItems(hotelId) {
        return await db.select().from(inventoryItems).where(and(
          eq(inventoryItems.hotelId, hotelId),
          isNull(inventoryItems.deletedAt)
        )).orderBy(asc(inventoryItems.name));
      }
      // Vendor operations
      async getVendorsByHotel(hotelId) {
        return await db.select().from(vendors).where(eq(vendors.hotelId, hotelId)).orderBy(asc(vendors.name));
      }
      // Restaurant operations
      async getRestaurantTablesByHotel(hotelId) {
        return await db.select().from(restaurantTables).where(eq(restaurantTables.hotelId, hotelId)).orderBy(asc(restaurantTables.name));
      }
      // Tax operations
      async getHotelTaxes(hotelId) {
        return await db.select().from(hotelTaxes).where(eq(hotelTaxes.hotelId, hotelId)).orderBy(asc(hotelTaxes.taxType));
      }
      async updateHotelTax(hotelId, taxType, isActive, percent) {
        const [tax] = await db.update(hotelTaxes).set({ isActive, percent: percent?.toString() }).where(and(eq(hotelTaxes.hotelId, hotelId), eq(hotelTaxes.taxType, taxType))).returning();
        return tax;
      }
      // Voucher operations
      async getVouchersByHotel(hotelId) {
        return await db.select().from(vouchers).where(eq(vouchers.hotelId, hotelId)).orderBy(desc(vouchers.createdAt));
      }
      // Vehicle operations
      async getVehicleLogsByHotel(hotelId) {
        return await db.select().from(vehicleLogs).where(eq(vehicleLogs.hotelId, hotelId)).orderBy(desc(vehicleLogs.checkIn));
      }
      // Room service operations
      async getRoomServiceOrdersByHotel(hotelId) {
        return await db.select().from(roomServiceOrders).where(eq(roomServiceOrders.hotelId, hotelId)).orderBy(desc(roomServiceOrders.createdAt));
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/auth.ts
var auth_exports = {};
__export(auth_exports, {
  hashPassword: () => hashPassword,
  setupAuth: () => setupAuth
});
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
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
    store: storage.sessionStore
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !await comparePasswords(password, user.passwordHash)) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });
  app2.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }
    const user = await storage.createUser({
      ...req.body,
      passwordHash: await hashPassword(req.body.password)
    });
    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  });
  app2.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
var scryptAsync;
var init_auth = __esm({
  "server/auth.ts"() {
    "use strict";
    init_storage();
    scryptAsync = promisify(scrypt);
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
init_storage();
init_auth();
init_schema();
import { createServer } from "http";
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
      const hotelData = insertHotelSchema.parse(req.body);
      const hotel = await storage.createHotel(hotelData);
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
  app2.get("/api/hotels/:hotelId/users", async (req, res) => {
    try {
      const { hotelId } = req.params;
      const users2 = await storage.getUsersByHotel(hotelId);
      res.json(users2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.post("/api/users", async (req, res) => {
    try {
      const { role, password, confirmPassword, firstName, lastName, ...userData } = req.body;
      let roleId = userData.roleId;
      if (role && !roleId) {
        const roleRecord = await storage.getRoleByName(role);
        if (roleRecord) {
          roleId = roleRecord.id;
        } else {
          return res.status(400).json({ message: `Role '${role}' not found` });
        }
      }
      let passwordHash = userData.passwordHash;
      if (password) {
        const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
        passwordHash = await hashPassword2(password);
      }
      const processedUserData = {
        ...userData,
        roleId,
        passwordHash,
        verification: userData.verification || {}
      };
      const validatedData = insertUserSchema.parse(processedUserData);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
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
  app2.put("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const userData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Failed to update user" });
    }
  });
  app2.delete("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete user" });
    }
  });
  app2.post("/api/users/:id/duty", async (req, res) => {
    try {
      const { id } = req.params;
      const { isOnline } = req.body;
      await storage.updateUserOnlineStatus(id, isOnline);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to update duty status" });
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
  app2.get("/api/hotels/:hotelId/rooms", async (req, res) => {
    try {
      const { hotelId } = req.params;
      const rooms2 = await storage.getRoomsByHotel(hotelId);
      res.json(rooms2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });
  app2.post("/api/rooms", async (req, res) => {
    try {
      const roomData = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(roomData);
      res.status(201).json(room);
    } catch (error) {
      res.status(400).json({ message: "Invalid room data" });
    }
  });
  app2.put("/api/rooms/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const roomData = insertRoomSchema.partial().parse(req.body);
      const room = await storage.updateRoom(id, roomData);
      res.json(room);
    } catch (error) {
      res.status(400).json({ message: "Failed to update room" });
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
  app2.get("/api/hotels/:hotelId/menu-items", async (req, res) => {
    try {
      const { hotelId } = req.params;
      const menuItems2 = await storage.getMenuItemsByHotel(hotelId);
      res.json(menuItems2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });
  app2.get("/api/hotels/:hotelId/menu-categories", async (req, res) => {
    try {
      const { hotelId } = req.params;
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
  app2.get("/api/hotels/:hotelId/transactions", async (req, res) => {
    try {
      const { hotelId } = req.params;
      const transactions2 = await storage.getTransactionsByHotel(hotelId);
      res.json(transactions2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });
  app2.post("/api/transactions", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });
  app2.delete("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTransaction(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete transaction" });
    }
  });
  app2.get("/api/hotels/:hotelId/maintenance-requests", async (req, res) => {
    try {
      const { hotelId } = req.params;
      const requests = await storage.getMaintenanceRequestsByHotel(hotelId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch maintenance requests" });
    }
  });
  app2.post("/api/maintenance-requests", async (req, res) => {
    try {
      const requestData = insertMaintenanceRequestSchema.parse(req.body);
      const request = await storage.createMaintenanceRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      res.status(400).json({ message: "Invalid maintenance request data" });
    }
  });
  app2.put("/api/maintenance-requests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const requestData = insertMaintenanceRequestSchema.partial().parse(req.body);
      const request = await storage.updateMaintenanceRequest(id, requestData);
      res.json(request);
    } catch (error) {
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
  app2.post("/api/kot-orders", async (req, res) => {
    try {
      const kotData = req.body;
      const kot = await storage.createKotOrder(kotData);
      res.status(201).json(kot);
    } catch (error) {
      res.status(400).json({ message: "Invalid KOT data" });
    }
  });
  app2.put("/api/kot-orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const kotData = req.body;
      const kot = await storage.updateKotOrder(id, kotData);
      res.json(kot);
    } catch (error) {
      res.status(400).json({ message: "Failed to update KOT order" });
    }
  });
  app2.get("/api/hotels/:hotelId/inventory", async (req, res) => {
    try {
      const { hotelId } = req.params;
      const items = await storage.getInventoryItemsByHotel(hotelId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory items" });
    }
  });
  app2.get("/api/hotels/:hotelId/inventory/low-stock", async (req, res) => {
    try {
      const { hotelId } = req.params;
      const items = await storage.getLowStockItems(hotelId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch low stock items" });
    }
  });
  app2.get("/api/hotels/:hotelId/vendors", async (req, res) => {
    try {
      const { hotelId } = req.params;
      const vendors2 = await storage.getVendorsByHotel(hotelId);
      res.json(vendors2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });
  app2.get("/api/hotels/:hotelId/restaurant-tables", async (req, res) => {
    try {
      const { hotelId } = req.params;
      const tables = await storage.getRestaurantTablesByHotel(hotelId);
      res.json(tables);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch restaurant tables" });
    }
  });
  app2.get("/api/hotels/:hotelId/taxes", async (req, res) => {
    try {
      const { hotelId } = req.params;
      const taxes = await storage.getHotelTaxes(hotelId);
      res.json(taxes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hotel taxes" });
    }
  });
  app2.put("/api/hotels/:hotelId/taxes/:taxType", async (req, res) => {
    try {
      const { hotelId, taxType } = req.params;
      const { isActive, percent } = req.body;
      const tax = await storage.updateHotelTax(hotelId, taxType, isActive, percent);
      res.json(tax);
    } catch (error) {
      res.status(400).json({ message: "Failed to update tax" });
    }
  });
  app2.get("/api/hotels/:hotelId/vouchers", async (req, res) => {
    try {
      const { hotelId } = req.params;
      const vouchers2 = await storage.getVouchersByHotel(hotelId);
      res.json(vouchers2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vouchers" });
    }
  });
  app2.get("/api/hotels/:hotelId/vehicle-logs", async (req, res) => {
    try {
      const { hotelId } = req.params;
      const logs = await storage.getVehicleLogsByHotel(hotelId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicle logs" });
    }
  });
  app2.get("/api/hotels/:hotelId/room-service-orders", async (req, res) => {
    try {
      const { hotelId } = req.params;
      const orders = await storage.getRoomServiceOrdersByHotel(hotelId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch room service orders" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

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
    hmr: {
      port: 5e3
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
    hmr: { server },
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

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
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
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
