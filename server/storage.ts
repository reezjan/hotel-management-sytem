import {
  users,
  hotels,
  roles,
  rooms,
  roomTypes,
  menuItems,
  menuCategories,
  tasks,
  transactions,
  maintenanceRequests,
  kotOrders,
  kotItems,
  inventoryItems,
  inventoryConsumptions,
  inventoryTransactions,
  vendors,
  restaurantTables,
  hotelTaxes,
  vouchers,
  vehicleLogs,
  roomServiceOrders,
  payments,
  attendance,
  halls,
  pools,
  services,
  leaveRequests,
  wastages,
  mealPlans,
  guests,
  type User,
  type UserWithRole,
  type InsertUser,
  type Hotel,
  type InsertHotel,
  type Room,
  type InsertRoom,
  type MenuItem,
  type InsertMenuItem,
  type Task,
  type InsertTask,
  type Transaction,
  type InsertTransaction,
  type MaintenanceRequest,
  type InsertMaintenanceRequest,
  type KotOrder,
  type KotItem,
  type Role,
  type InventoryItem,
  type InventoryConsumption,
  type RoomType,
  type InsertRoomType,
  type Payment,
  type Vendor,
  type InsertVendor,
  type RestaurantTable,
  type MenuCategory,
  type HotelTax,
  type Voucher,
  type InsertVoucher,
  type VehicleLog,
  type InsertVehicleLog,
  type RoomServiceOrder,
  type Hall,
  type InsertHall,
  type Pool,
  type InsertPool,
  type Service,
  type InsertService,
  type LeaveRequest,
  type InsertLeaveRequest,
  type Wastage,
  type InsertWastage,
  type MealPlan,
  type InsertMealPlan,
  type Guest,
  type InsertGuest
} from "@shared/schema";
import { db } from "./db";
import { eq, and, isNull, desc, asc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Session store
  sessionStore: connectPg.PGStore;
  
  // User operations
  getUser(id: string): Promise<UserWithRole | undefined>;
  getUserByUsername(username: string): Promise<UserWithRole | undefined>;
  getUsersByHotel(hotelId: string): Promise<UserWithRole[]>;
  getUsersByRole(roleId: number): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  updateUserOnlineStatus(id: string, isOnline: boolean): Promise<void>;
  
  // Hotel operations
  getHotel(id: string): Promise<Hotel | undefined>;
  getAllHotels(): Promise<Hotel[]>;
  createHotel(hotel: InsertHotel): Promise<Hotel>;
  updateHotel(id: string, hotel: Partial<InsertHotel>): Promise<Hotel>;
  deleteHotel(id: string): Promise<void>;
  
  // Role operations
  getAllRoles(): Promise<Role[]>;
  getRoleByName(name: string): Promise<Role | undefined>;
  getRole(id: number): Promise<Role | undefined>;
  
  // Room operations
  getRoomsByHotel(hotelId: string): Promise<Room[]>;
  getRoom(id: string): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoom(id: string, room: Partial<InsertRoom>): Promise<Room>;
  deleteRoom(id: string): Promise<void>;

  // Room type operations
  getRoomTypesByHotel(hotelId: string): Promise<RoomType[]>;
  createRoomType(roomType: InsertRoomType): Promise<RoomType>;
  updateRoomType(id: number, hotelId: string, roomType: Partial<InsertRoomType>): Promise<RoomType | null>;
  deleteRoomType(id: number, hotelId: string): Promise<boolean>;
  
  // Amenity operations - Halls
  getHallsByHotel(hotelId: string): Promise<Hall[]>;
  createHall(hall: InsertHall): Promise<Hall>;
  updateHall(id: string, hotelId: string, hall: Partial<InsertHall>): Promise<Hall | null>;
  deleteHall(id: string, hotelId: string): Promise<boolean>;
  
  // Amenity operations - Pools
  getPoolsByHotel(hotelId: string): Promise<Pool[]>;
  createPool(pool: InsertPool): Promise<Pool>;
  updatePool(id: string, hotelId: string, pool: Partial<InsertPool>): Promise<Pool | null>;
  deletePool(id: string, hotelId: string): Promise<boolean>;
  
  // Amenity operations - Services
  getServicesByHotel(hotelId: string): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, hotelId: string, service: Partial<InsertService>): Promise<Service | null>;
  deleteService(id: string, hotelId: string): Promise<boolean>;
  
  // Menu operations
  getMenuItemsByHotel(hotelId: string): Promise<MenuItem[]>;
  getMenuCategoriesByHotel(hotelId: string): Promise<MenuCategory[]>;
  getMenuItem(id: string): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: string, item: Partial<InsertMenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: string): Promise<void>;
  
  // Menu category operations
  createMenuCategory(category: { hotelId: string; name: string }): Promise<MenuCategory>;
  updateMenuCategory(id: string, category: { name: string }): Promise<MenuCategory | undefined>;
  deleteMenuCategory(id: string): Promise<void>;
  
  // Task operations
  getTasksByUser(userId: string): Promise<Task[]>;
  getTasksByHotel(hotelId: string): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  
  // Transaction operations
  getTransactionsByHotel(hotelId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;
  
  // Maintenance operations
  getMaintenanceRequestsByHotel(hotelId: string): Promise<MaintenanceRequest[]>;
  createMaintenanceRequest(request: InsertMaintenanceRequest): Promise<MaintenanceRequest>;
  updateMaintenanceRequest(id: string, request: Partial<InsertMaintenanceRequest>): Promise<MaintenanceRequest>;
  getMaintenanceRequest(id: string): Promise<MaintenanceRequest | undefined>;
  
  // KOT operations
  getKotOrdersByHotel(hotelId: string): Promise<KotOrder[]>;
  getKotItems(kotId: string): Promise<KotItem[]>;
  getKotItemById(id: string): Promise<KotItem | undefined>;
  createKotOrder(kot: any): Promise<KotOrder>;
  updateKotOrder(id: string, kot: any): Promise<KotOrder>;
  updateKotItem(id: string, item: Partial<KotItem>): Promise<KotItem>;
  
  // Wastage operations
  createWastage(wastageData: any): Promise<any>;
  getWastagesByHotel(hotelId: string): Promise<any[]>;
  
  // Inventory operations
  getInventoryItemsByHotel(hotelId: string): Promise<InventoryItem[]>;
  getLowStockItems(hotelId: string): Promise<InventoryItem[]>;
  getInventoryItem(id: string): Promise<InventoryItem | undefined>;
  createInventoryItem(item: any): Promise<InventoryItem>;
  updateInventoryItem(id: string, item: any): Promise<InventoryItem>;
  deleteInventoryItem(id: string): Promise<void>;
  getInventoryTransactionsByHotel(hotelId: string): Promise<any[]>;
  createInventoryTransaction(transaction: any): Promise<any>;
  
  // Vendor operations
  getVendorsByHotel(hotelId: string): Promise<Vendor[]>;
  
  // Restaurant operations
  getRestaurantTablesByHotel(hotelId: string): Promise<RestaurantTable[]>;
  getRestaurantTable(id: string): Promise<RestaurantTable | undefined>;
  createRestaurantTable(table: any): Promise<RestaurantTable>;
  updateRestaurantTable(id: string, table: any): Promise<RestaurantTable>;
  deleteRestaurantTable(id: string): Promise<void>;
  
  // Tax operations
  getHotelTaxes(hotelId: string): Promise<HotelTax[]>;
  updateHotelTax(hotelId: string, taxType: string, isActive: boolean, percent?: number): Promise<HotelTax>;
  
  // Voucher operations
  getVouchersByHotel(hotelId: string): Promise<Voucher[]>;
  createVoucher(voucherData: InsertVoucher): Promise<Voucher>;
  updateVoucher(id: string, voucherData: Partial<InsertVoucher>): Promise<Voucher>;
  deleteVoucher(id: string): Promise<void>;
  
  // Vehicle operations
  getVehicleLogsByHotel(hotelId: string): Promise<VehicleLog[]>;
  createVehicleLog(log: any): Promise<VehicleLog>;
  updateVehicleLog(id: string, log: Partial<VehicleLog>): Promise<VehicleLog>;
  getVehicleLog(id: string): Promise<VehicleLog | undefined>;
  
  // Room service operations
  getRoomServiceOrdersByHotel(hotelId: string): Promise<RoomServiceOrder[]>;
  createRoomServiceOrder(order: any): Promise<RoomServiceOrder>;
  
  // Leave request operations
  getLeaveRequestsByHotel(hotelId: string): Promise<LeaveRequest[]>;
  getLeaveRequestsByUser(userId: string): Promise<LeaveRequest[]>;
  getLeaveRequestsForManager(hotelId: string): Promise<LeaveRequest[]>;
  getPendingLeaveRequestsForManager(hotelId: string): Promise<LeaveRequest[]>;
  createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest>;
  updateLeaveRequest(id: string, request: Partial<InsertLeaveRequest>): Promise<LeaveRequest>;
  getLeaveRequest(id: string): Promise<LeaveRequest | undefined>;
  
  // Meal plan operations
  getMealPlansByHotel(hotelId: string): Promise<MealPlan[]>;
  getMealPlan(id: string): Promise<MealPlan | undefined>;
  createMealPlan(plan: InsertMealPlan): Promise<MealPlan>;
  updateMealPlan(id: string, plan: Partial<InsertMealPlan>): Promise<MealPlan>;
  deleteMealPlan(id: string, hotelId: string): Promise<boolean>;
  
  // Guest operations
  getGuestsByHotel(hotelId: string): Promise<Guest[]>;
  getGuest(id: string): Promise<Guest | undefined>;
  createGuest(guest: InsertGuest): Promise<Guest>;
  updateGuest(id: string, guest: Partial<InsertGuest>): Promise<Guest>;
  deleteGuest(id: string): Promise<void>;
  searchGuests(hotelId: string, searchTerm: string): Promise<Guest[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: connectPg.PGStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true
    });
  }

  // User operations
  async getUser(id: string): Promise<UserWithRole | undefined> {
    const [result] = await db
      .select({
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
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(and(eq(users.id, id), isNull(users.deletedAt)));
    if (!result) return undefined;
    return {
      ...result,
      role: result.role || undefined
    };
  }

  async getUserByUsername(username: string): Promise<UserWithRole | undefined> {
    const [result] = await db
      .select({
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
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(and(eq(users.username, username), isNull(users.deletedAt)));
    if (!result) return undefined;
    return {
      ...result,
      role: result.role || undefined
    };
  }

  async getUsersByHotel(hotelId: string): Promise<UserWithRole[]> {
    const results = await db
      .select({
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
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(and(eq(users.hotelId, hotelId), isNull(users.deletedAt)))
      .orderBy(asc(users.username));
      
    return results.map((result: any) => ({
      ...result,
      role: result.role || undefined
    }));
  }

  async getUsersByRole(roleId: number): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(and(eq(users.roleId, roleId), isNull(users.deletedAt)))
      .orderBy(asc(users.username));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, id));
  }

  async updateUserOnlineStatus(id: string, isOnline: boolean): Promise<void> {
    await db
      .update(users)
      .set({ 
        isOnline,
        lastLogin: isOnline ? new Date() : undefined,
        lastLogout: !isOnline ? new Date() : undefined
      })
      .where(eq(users.id, id));
  }

  // Hotel operations
  async getHotel(id: string): Promise<Hotel | undefined> {
    const [hotel] = await db
      .select()
      .from(hotels)
      .where(and(eq(hotels.id, id), isNull(hotels.deletedAt)));
    return hotel || undefined;
  }

  async getAllHotels(): Promise<Hotel[]> {
    return await db
      .select()
      .from(hotels)
      .where(isNull(hotels.deletedAt))
      .orderBy(asc(hotels.name));
  }

  async createHotel(hotelData: InsertHotel): Promise<Hotel> {
    const [hotel] = await db
      .insert(hotels)
      .values(hotelData)
      .returning();
    return hotel;
  }

  async updateHotel(id: string, hotelData: Partial<InsertHotel>): Promise<Hotel> {
    const [hotel] = await db
      .update(hotels)
      .set({ ...hotelData, updatedAt: new Date() })
      .where(eq(hotels.id, id))
      .returning();
    return hotel;
  }

  async deleteHotel(id: string): Promise<void> {
    await db
      .update(hotels)
      .set({ deletedAt: new Date() })
      .where(eq(hotels.id, id));
  }

  // Role operations
  async getAllRoles(): Promise<Role[]> {
    return await db
      .select()
      .from(roles)
      .orderBy(asc(roles.name));
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    const [role] = await db
      .select()
      .from(roles)
      .where(eq(roles.name, name));
    return role || undefined;
  }

  async getRole(id: number): Promise<Role | undefined> {
    const [role] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, id));
    return role || undefined;
  }

  // Room operations
  async getRoomsByHotel(hotelId: string): Promise<Room[]> {
    const results = await db
      .select({
        id: rooms.id,
        hotelId: rooms.hotelId,
        roomNumber: rooms.roomNumber,
        roomTypeId: rooms.roomTypeId,
        isOccupied: rooms.isOccupied,
        occupantDetails: rooms.occupantDetails,
        createdAt: rooms.createdAt,
        updatedAt: rooms.updatedAt,
        deletedAt: rooms.deletedAt,
        roomType: roomTypes
      })
      .from(rooms)
      .leftJoin(roomTypes, eq(rooms.roomTypeId, roomTypes.id))
      .where(and(eq(rooms.hotelId, hotelId), isNull(rooms.deletedAt)))
      .orderBy(asc(rooms.roomNumber));
    return results as any;
  }

  async getRoom(id: string): Promise<Room | undefined> {
    const [room] = await db
      .select()
      .from(rooms)
      .where(and(eq(rooms.id, id), isNull(rooms.deletedAt)));
    return room || undefined;
  }

  async createRoom(roomData: InsertRoom): Promise<Room> {
    const [room] = await db
      .insert(rooms)
      .values(roomData)
      .returning();
    return room;
  }

  async updateRoom(id: string, roomData: Partial<InsertRoom>): Promise<Room> {
    const [room] = await db
      .update(rooms)
      .set({ ...roomData, updatedAt: new Date() })
      .where(eq(rooms.id, id))
      .returning();
    return room;
  }

  async deleteRoom(id: string): Promise<void> {
    await db
      .update(rooms)
      .set({ deletedAt: new Date() })
      .where(eq(rooms.id, id));
  }

  // Menu operations
  async getMenuItemsByHotel(hotelId: string): Promise<MenuItem[]> {
    const items = await db
      .select({
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
      })
      .from(menuItems)
      .leftJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
      .where(eq(menuItems.hotelId, hotelId))
      .orderBy(asc(menuItems.name));
    return items as any;
  }

  async getMenuCategoriesByHotel(hotelId: string): Promise<MenuCategory[]> {
    return await db
      .select()
      .from(menuCategories)
      .where(eq(menuCategories.hotelId, hotelId))
      .orderBy(asc(menuCategories.name));
  }

  async createMenuItem(itemData: InsertMenuItem): Promise<MenuItem> {
    const [item] = await db
      .insert(menuItems)
      .values(itemData)
      .returning();
    return item;
  }

  async updateMenuItem(id: string, itemData: Partial<InsertMenuItem>): Promise<MenuItem> {
    const [item] = await db
      .update(menuItems)
      .set(itemData)
      .where(eq(menuItems.id, id))
      .returning();
    return item;
  }

  async deleteMenuItem(id: string): Promise<void> {
    await db
      .update(menuItems)
      .set({ active: false })
      .where(eq(menuItems.id, id));
  }

  // Menu category operations
  async createMenuCategory(category: { hotelId: string; name: string }): Promise<MenuCategory> {
    const [newCategory] = await db
      .insert(menuCategories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateMenuCategory(id: string, category: { name: string }): Promise<MenuCategory | undefined> {
    const [updated] = await db
      .update(menuCategories)
      .set(category)
      .where(eq(menuCategories.id, id))
      .returning();
    return updated;
  }

  async deleteMenuCategory(id: string): Promise<void> {
    await db
      .delete(menuCategories)
      .where(eq(menuCategories.id, id));
  }

  // Task operations
  async getTasksByUser(userId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.assignedTo, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async getTasksByHotel(hotelId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.hotelId, hotelId))
      .orderBy(desc(tasks.createdAt));
  }

  async createTask(taskData: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(taskData)
      .returning();
    return task;
  }

  async updateTask(id: string, taskData: Partial<InsertTask>): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set({ ...taskData, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async deleteTask(id: string): Promise<void> {
    await db
      .delete(tasks)
      .where(eq(tasks.id, id));
  }

  // Transaction operations
  async getTransactionsByHotel(hotelId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.hotelId, hotelId), isNull(transactions.deletedAt)))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(transactionData)
      .returning();
    return transaction;
  }

  async deleteTransaction(id: string): Promise<void> {
    await db
      .update(transactions)
      .set({ deletedAt: new Date() })
      .where(eq(transactions.id, id));
  }

  // Maintenance operations
  async getMaintenanceRequestsByHotel(hotelId: string): Promise<any[]> {
    const results = await db
      .select({
        id: maintenanceRequests.id,
        hotelId: maintenanceRequests.hotelId,
        title: maintenanceRequests.title,
        location: maintenanceRequests.location,
        description: maintenanceRequests.description,
        photo: maintenanceRequests.photo,
        priority: maintenanceRequests.priority,
        status: maintenanceRequests.status,
        assignedTo: maintenanceRequests.assignedTo,
        resolvedAt: maintenanceRequests.resolvedAt,
        createdAt: maintenanceRequests.createdAt,
        updatedAt: maintenanceRequests.updatedAt,
        reportedById: users.id,
        reportedByUsername: users.username,
        reportedByRoleId: roles.id,
        reportedByRoleName: roles.name
      })
      .from(maintenanceRequests)
      .leftJoin(users, eq(maintenanceRequests.reportedBy, users.id))
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(eq(maintenanceRequests.hotelId, hotelId))
      .orderBy(desc(maintenanceRequests.createdAt));
    
    // Transform the flat results into the expected structure
    return results.map(result => ({
      id: result.id,
      hotelId: result.hotelId,
      title: result.title,
      location: result.location,
      description: result.description,
      photo: result.photo,
      priority: result.priority,
      status: result.status,
      assignedTo: result.assignedTo,
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
      } : null
    }));
  }

  async createMaintenanceRequest(requestData: InsertMaintenanceRequest): Promise<MaintenanceRequest> {
    const [request] = await db
      .insert(maintenanceRequests)
      .values(requestData)
      .returning();
    return request;
  }

  async updateMaintenanceRequest(id: string, requestData: Partial<InsertMaintenanceRequest>): Promise<MaintenanceRequest> {
    const [request] = await db
      .update(maintenanceRequests)
      .set({ ...requestData, updatedAt: new Date() })
      .where(eq(maintenanceRequests.id, id))
      .returning();
    return request;
  }

  async getMaintenanceRequest(id: string): Promise<MaintenanceRequest | undefined> {
    const [request] = await db
      .select()
      .from(maintenanceRequests)
      .where(eq(maintenanceRequests.id, id));
    return request;
  }

  // KOT operations
  async getKotOrdersByHotel(hotelId: string): Promise<any[]> {
    const orders = await db
      .select()
      .from(kotOrders)
      .where(eq(kotOrders.hotelId, hotelId))
      .orderBy(desc(kotOrders.createdAt));
    
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const itemResults = await db
          .select({
            itemId: kotItems.id,
            itemKotId: kotItems.kotId,
            itemMenuItemId: kotItems.menuItemId,
            itemQty: kotItems.qty,
            itemNotes: kotItems.description, // Changed from .notes to .description to match schema
            itemStatus: kotItems.status,
            itemDeclineReason: kotItems.declineReason,
            menuItemId: menuItems.id,
            menuItemName: menuItems.name,
            menuItemPrice: menuItems.price,
            menuItemCategory: menuItems.categoryId // Reading categoryId from DB but aliasing as category for API contract
          })
          .from(kotItems)
          .leftJoin(menuItems, eq(kotItems.menuItemId, menuItems.id))
          .where(eq(kotItems.kotId, order.id));
        
        const items = itemResults.map(row => ({
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
            category: row.menuItemCategory // Keeping original field name for API contract
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

  async getKotItems(kotId: string): Promise<KotItem[]> {
    return await db
      .select()
      .from(kotItems)
      .where(eq(kotItems.kotId, kotId))
      .orderBy(asc(kotItems.createdAt));
  }

  async getKotItemById(id: string): Promise<KotItem | undefined> {
    const [item] = await db
      .select()
      .from(kotItems)
      .where(eq(kotItems.id, id))
      .limit(1);
    return item;
  }

  async createKotOrder(kotData: any): Promise<KotOrder> {
    const [kot] = await db
      .insert(kotOrders)
      .values(kotData)
      .returning();
    return kot;
  }

  async updateKotOrder(id: string, kotData: any): Promise<KotOrder> {
    const [kot] = await db
      .update(kotOrders)
      .set({ ...kotData, updatedAt: new Date() })
      .where(eq(kotOrders.id, id))
      .returning();
    return kot;
  }

  async updateKotItem(id: string, itemData: Partial<KotItem>): Promise<KotItem> {
    const [item] = await db
      .update(kotItems)
      .set(itemData)
      .where(eq(kotItems.id, id))
      .returning();
    return item;
  }

  // Wastage operations
  async createWastage(wastageData: any): Promise<any> {
    const [wastage] = await db
      .insert(wastages)
      .values(wastageData)
      .returning();
    return wastage;
  }

  async getWastagesByHotel(hotelId: string): Promise<any[]> {
    return db
      .select()
      .from(wastages)
      .where(eq(wastages.hotelId, hotelId))
      .orderBy(desc(wastages.createdAt));
  }

  // Inventory operations
  async getInventoryItemsByHotel(hotelId: string): Promise<InventoryItem[]> {
    return await db
      .select()
      .from(inventoryItems)
      .where(and(eq(inventoryItems.hotelId, hotelId), isNull(inventoryItems.deletedAt)))
      .orderBy(asc(inventoryItems.name));
  }

  async getLowStockItems(hotelId: string): Promise<InventoryItem[]> {
    return await db
      .select()
      .from(inventoryItems)
      .where(and(
        eq(inventoryItems.hotelId, hotelId),
        isNull(inventoryItems.deletedAt)
      ))
      .orderBy(asc(inventoryItems.name));
  }

  // Vendor operations
  async getVendorsByHotel(hotelId: string): Promise<Vendor[]> {
    return await db
      .select()
      .from(vendors)
      .where(eq(vendors.hotelId, hotelId))
      .orderBy(asc(vendors.name));
  }

  async createVendor(vendorData: InsertVendor): Promise<Vendor> {
    const [vendor] = await db.insert(vendors).values(vendorData).returning();
    return vendor;
  }

  async updateVendor(id: string, vendorData: Partial<InsertVendor>): Promise<Vendor> {
    const [vendor] = await db
      .update(vendors)
      .set(vendorData)
      .where(eq(vendors.id, id))
      .returning();
    return vendor;
  }

  async deleteVendor(id: string): Promise<void> {
    await db.delete(vendors).where(eq(vendors.id, id));
  }

  // Restaurant operations
  async getRestaurantTablesByHotel(hotelId: string): Promise<RestaurantTable[]> {
    return await db
      .select()
      .from(restaurantTables)
      .where(eq(restaurantTables.hotelId, hotelId))
      .orderBy(asc(restaurantTables.name));
  }

  // Tax operations
  async getHotelTaxes(hotelId: string): Promise<HotelTax[]> {
    return await db
      .select()
      .from(hotelTaxes)
      .where(eq(hotelTaxes.hotelId, hotelId))
      .orderBy(asc(hotelTaxes.taxType));
  }

  async updateHotelTax(hotelId: string, taxType: string, isActive: boolean, percent?: number): Promise<HotelTax> {
    const [tax] = await db
      .insert(hotelTaxes)
      .values({
        hotelId,
        taxType,
        isActive,
        percent: percent?.toString()
      })
      .onConflictDoUpdate({
        target: [hotelTaxes.hotelId, hotelTaxes.taxType],
        set: {
          isActive,
          percent: percent?.toString()
        }
      })
      .returning();
    return tax;
  }

  // Voucher operations
  async getVouchersByHotel(hotelId: string): Promise<Voucher[]> {
    return await db
      .select()
      .from(vouchers)
      .where(eq(vouchers.hotelId, hotelId))
      .orderBy(desc(vouchers.createdAt));
  }

  async createVoucher(voucherData: InsertVoucher): Promise<Voucher> {
    const [voucher] = await db
      .insert(vouchers)
      .values(voucherData)
      .returning();
    return voucher;
  }

  async updateVoucher(id: string, voucherData: Partial<InsertVoucher>): Promise<Voucher> {
    const [voucher] = await db
      .update(vouchers)
      .set(voucherData)
      .where(eq(vouchers.id, id))
      .returning();
    return voucher;
  }

  async deleteVoucher(id: string): Promise<void> {
    await db
      .delete(vouchers)
      .where(eq(vouchers.id, id));
  }

  // Vehicle operations
  async getVehicleLogsByHotel(hotelId: string): Promise<VehicleLog[]> {
    return await db
      .select()
      .from(vehicleLogs)
      .where(eq(vehicleLogs.hotelId, hotelId))
      .orderBy(desc(vehicleLogs.checkIn));
  }

  async createVehicleLog(log: InsertVehicleLog): Promise<VehicleLog> {
    const [result] = await db.insert(vehicleLogs).values(log).returning();
    return result;
  }

  async updateVehicleLog(id: string, log: Partial<VehicleLog>): Promise<VehicleLog> {
    const [result] = await db
      .update(vehicleLogs)
      .set(log)
      .where(eq(vehicleLogs.id, id))
      .returning();
    return result;
  }

  async getVehicleLog(id: string): Promise<VehicleLog | undefined> {
    const [result] = await db
      .select()
      .from(vehicleLogs)
      .where(eq(vehicleLogs.id, id));
    return result;
  }

  // Room service operations
  async getRoomServiceOrdersByHotel(hotelId: string): Promise<RoomServiceOrder[]> {
    return await db
      .select()
      .from(roomServiceOrders)
      .where(eq(roomServiceOrders.hotelId, hotelId))
      .orderBy(desc(roomServiceOrders.createdAt));
  }

  async createRoomServiceOrder(orderData: any): Promise<RoomServiceOrder> {
    const [order] = await db
      .insert(roomServiceOrders)
      .values(orderData)
      .returning();
    return order;
  }

  // Inventory consumption operations
  async getInventoryConsumptionsByHotel(hotelId: string): Promise<InventoryConsumption[]> {
    return await db
      .select()
      .from(inventoryConsumptions)
      .where(eq(inventoryConsumptions.hotelId, hotelId))
      .orderBy(desc(inventoryConsumptions.createdAt));
  }

  // Room type operations
  async getRoomTypesByHotel(hotelId: string): Promise<RoomType[]> {
    return await db
      .select()
      .from(roomTypes)
      .where(eq(roomTypes.hotelId, hotelId))
      .orderBy(asc(roomTypes.name));
  }

  async createRoomType(roomType: InsertRoomType): Promise<RoomType> {
    const [created] = await db.insert(roomTypes).values(roomType).returning();
    return created;
  }

  async updateRoomType(id: number, hotelId: string, roomType: Partial<InsertRoomType>): Promise<RoomType | null> {
    const [updated] = await db
      .update(roomTypes)
      .set(roomType)
      .where(and(eq(roomTypes.id, id), eq(roomTypes.hotelId, hotelId)))
      .returning();
    return updated || null;
  }

  async deleteRoomType(id: number, hotelId: string): Promise<boolean> {
    const result = await db
      .delete(roomTypes)
      .where(and(eq(roomTypes.id, id), eq(roomTypes.hotelId, hotelId)))
      .returning();
    return result.length > 0;
  }

  // Amenity operations - Halls
  async getHallsByHotel(hotelId: string): Promise<Hall[]> {
    return await db
      .select()
      .from(halls)
      .where(eq(halls.hotelId, hotelId))
      .orderBy(asc(halls.name));
  }

  async createHall(hall: InsertHall): Promise<Hall> {
    const [created] = await db.insert(halls).values(hall).returning();
    return created;
  }

  async updateHall(id: string, hotelId: string, hall: Partial<InsertHall>): Promise<Hall | null> {
    const [updated] = await db
      .update(halls)
      .set(hall)
      .where(and(eq(halls.id, id), eq(halls.hotelId, hotelId)))
      .returning();
    return updated || null;
  }

  async deleteHall(id: string, hotelId: string): Promise<boolean> {
    const result = await db
      .delete(halls)
      .where(and(eq(halls.id, id), eq(halls.hotelId, hotelId)))
      .returning();
    return result.length > 0;
  }

  // Amenity operations - Pools
  async getPoolsByHotel(hotelId: string): Promise<Pool[]> {
    return await db
      .select()
      .from(pools)
      .where(eq(pools.hotelId, hotelId))
      .orderBy(asc(pools.name));
  }

  async createPool(pool: InsertPool): Promise<Pool> {
    const [created] = await db.insert(pools).values(pool).returning();
    return created;
  }

  async updatePool(id: string, hotelId: string, pool: Partial<InsertPool>): Promise<Pool | null> {
    const [updated] = await db
      .update(pools)
      .set(pool)
      .where(and(eq(pools.id, id), eq(pools.hotelId, hotelId)))
      .returning();
    return updated || null;
  }

  async deletePool(id: string, hotelId: string): Promise<boolean> {
    const result = await db
      .delete(pools)
      .where(and(eq(pools.id, id), eq(pools.hotelId, hotelId)))
      .returning();
    return result.length > 0;
  }

  // Amenity operations - Services
  async getServicesByHotel(hotelId: string): Promise<Service[]> {
    return await db
      .select()
      .from(services)
      .where(eq(services.hotelId, hotelId))
      .orderBy(asc(services.name));
  }

  async createService(service: InsertService): Promise<Service> {
    const [created] = await db.insert(services).values(service).returning();
    return created;
  }

  async updateService(id: string, hotelId: string, service: Partial<InsertService>): Promise<Service | null> {
    const [updated] = await db
      .update(services)
      .set(service)
      .where(and(eq(services.id, id), eq(services.hotelId, hotelId)))
      .returning();
    return updated || null;
  }

  async deleteService(id: string, hotelId: string): Promise<boolean> {
    const result = await db
      .delete(services)
      .where(and(eq(services.id, id), eq(services.hotelId, hotelId)))
      .returning();
    return result.length > 0;
  }

  // Payment operations
  async getPaymentsByHotel(hotelId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.hotelId, hotelId))
      .orderBy(desc(payments.createdAt));
  }

  // Menu item operations
  async getMenuItem(id: string): Promise<MenuItem | undefined> {
    const [result] = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, id));
    return result;
  }

  // Task operations
  async getTask(id: string): Promise<Task | undefined> {
    const [result] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id));
    return result;
  }

  // Restaurant table operations
  async getRestaurantTable(id: string): Promise<RestaurantTable | undefined> {
    const [result] = await db
      .select()
      .from(restaurantTables)
      .where(eq(restaurantTables.id, id));
    return result;
  }

  async createRestaurantTable(tableData: any): Promise<RestaurantTable> {
    const [table] = await db
      .insert(restaurantTables)
      .values(tableData)
      .returning();
    return table;
  }

  async updateRestaurantTable(id: string, tableData: any): Promise<RestaurantTable> {
    const [table] = await db
      .update(restaurantTables)
      .set(tableData)
      .where(eq(restaurantTables.id, id))
      .returning();
    return table;
  }

  async deleteRestaurantTable(id: string): Promise<void> {
    await db
      .delete(restaurantTables)
      .where(eq(restaurantTables.id, id));
  }

  // Inventory item operations
  async getInventoryItem(id: string): Promise<InventoryItem | undefined> {
    const [result] = await db
      .select()
      .from(inventoryItems)
      .where(and(eq(inventoryItems.id, id), isNull(inventoryItems.deletedAt)));
    return result;
  }

  async createInventoryItem(itemData: any): Promise<InventoryItem> {
    const [item] = await db
      .insert(inventoryItems)
      .values(itemData)
      .returning();
    return item;
  }

  async updateInventoryItem(id: string, itemData: any): Promise<InventoryItem> {
    const [item] = await db
      .update(inventoryItems)
      .set({ ...itemData, updatedAt: new Date() })
      .where(eq(inventoryItems.id, id))
      .returning();
    return item;
  }

  async deleteInventoryItem(id: string): Promise<void> {
    await db
      .update(inventoryItems)
      .set({ deletedAt: new Date() })
      .where(eq(inventoryItems.id, id));
  }

  async getInventoryTransactionsByHotel(hotelId: string): Promise<any[]> {
    return await db
      .select()
      .from(inventoryTransactions)
      .where(eq(inventoryTransactions.hotelId, hotelId))
      .orderBy(desc(inventoryTransactions.createdAt));
  }

  async createInventoryTransaction(transactionData: any): Promise<any> {
    const [transaction] = await db
      .insert(inventoryTransactions)
      .values(transactionData)
      .returning();
    return transaction;
  }

  async createKotOrderWithItems(kotData: any, items: any[]): Promise<KotOrder> {
    // Create the KOT order first
    const [kot] = await db
      .insert(kotOrders)
      .values(kotData)
      .returning();

    // Insert each KOT item and handle inventory deduction for items with recipes
    for (const item of items) {
      let inventoryUsage = null;

      // If the item has a menuItemId, check if it has a recipe with ingredients
      if (item.menuItemId) {
        const menuItem = await db.query.menuItems.findFirst({
          where: (menuItemsTable, { eq }) => eq(menuItemsTable.id, item.menuItemId)
        });

        const recipe = menuItem?.recipe as any;
        if (recipe?.ingredients && Array.isArray(recipe.ingredients)) {
          const ingredients = recipe.ingredients;
          const usageRecords = [];

          // Deduct inventory for each ingredient
          for (const ingredient of ingredients) {
            if (ingredient.inventoryItemId && ingredient.quantity) {
              const inventoryItem = await db.query.inventoryItems.findFirst({
                where: (inventoryItemsTable, { eq }) => eq(inventoryItemsTable.id, ingredient.inventoryItemId)
              });

              if (inventoryItem) {
                let quantityInBaseUnit = ingredient.quantity;
                
                if (ingredient.unit && ingredient.unit !== inventoryItem.baseUnit) {
                  const { convertToBase, MeasurementCategory } = await import('@shared/measurements');
                  const category = (inventoryItem.measurementCategory || 'weight') as any;
                  const conversionProfile = inventoryItem.conversionProfile as any;
                  
                  try {
                    quantityInBaseUnit = convertToBase(
                      ingredient.quantity,
                      ingredient.unit as any,
                      (inventoryItem.baseUnit || 'kg') as any,
                      category,
                      conversionProfile
                    );
                  } catch (error) {
                    console.error(`Unit conversion error for ${inventoryItem.name}:`, error);
                  }
                }
                
                const totalQuantityToDeduct = quantityInBaseUnit * (item.qty || 1);
                const currentStock = Number(inventoryItem.baseStockQty || inventoryItem.stockQty || 0);
                const newQuantity = currentStock - totalQuantityToDeduct;
                
                await db
                  .update(inventoryItems)
                  .set({ 
                    baseStockQty: String(newQuantity),
                    stockQty: String(newQuantity),
                    updatedAt: new Date()
                  })
                  .where(eq(inventoryItems.id, ingredient.inventoryItemId));

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
            inventoryUsage = { usedIngredients: usageRecords };
          }
        }
      }

      // Insert the KOT item with inventory usage record
      await db
        .insert(kotItems)
        .values({
          ...item,
          kotId: kot.id,
          inventoryUsage
        });
    }

    return kot;
  }

  async updateKotItemQuantity(kotItemId: string, oldQty: number, newQty: number): Promise<void> {
    // Update the KOT item quantity
    await db
      .update(kotItems)
      .set({ qty: newQty })
      .where(eq(kotItems.id, kotItemId));
  }

  async deleteKotOrderWithInventoryRestore(kotId: string): Promise<void> {
    // Delete the KOT items
    await db
      .delete(kotItems)
      .where(eq(kotItems.kotId, kotId));

    // Delete the KOT order
    await db
      .delete(kotOrders)
      .where(eq(kotOrders.id, kotId));
  }

  // Leave request operations
  async getLeaveRequestsByHotel(hotelId: string): Promise<LeaveRequest[]> {
    return await db
      .select()
      .from(leaveRequests)
      .where(eq(leaveRequests.hotelId, hotelId))
      .orderBy(desc(leaveRequests.createdAt));
  }

  async getLeaveRequestsByUser(userId: string): Promise<LeaveRequest[]> {
    return await db
      .select()
      .from(leaveRequests)
      .where(eq(leaveRequests.requestedBy, userId))
      .orderBy(desc(leaveRequests.createdAt));
  }

  async getLeaveRequestsForManager(hotelId: string): Promise<LeaveRequest[]> {
    // Get all leave requests for the hotel (for manager overview)
    return await db
      .select()
      .from(leaveRequests)
      .where(eq(leaveRequests.hotelId, hotelId))
      .orderBy(desc(leaveRequests.createdAt));
  }

  async getPendingLeaveRequestsForManager(hotelId: string): Promise<LeaveRequest[]> {
    // Get leave requests that need manager approval (pending status only)
    return await db
      .select()
      .from(leaveRequests)
      .where(and(
        eq(leaveRequests.hotelId, hotelId),
        eq(leaveRequests.status, 'pending')
      ))
      .orderBy(desc(leaveRequests.createdAt));
  }

  async createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest> {
    const [leaveRequest] = await db
      .insert(leaveRequests)
      .values(request)
      .returning();
    return leaveRequest;
  }

  async updateLeaveRequest(id: string, request: Partial<InsertLeaveRequest>): Promise<LeaveRequest> {
    const [leaveRequest] = await db
      .update(leaveRequests)
      .set({ ...request, updatedAt: new Date() })
      .where(eq(leaveRequests.id, id))
      .returning();
    return leaveRequest;
  }

  async getLeaveRequest(id: string): Promise<LeaveRequest | undefined> {
    const [leaveRequest] = await db
      .select()
      .from(leaveRequests)
      .where(eq(leaveRequests.id, id));
    return leaveRequest || undefined;
  }

  // Meal plan operations
  async getMealPlansByHotel(hotelId: string): Promise<MealPlan[]> {
    return await db
      .select()
      .from(mealPlans)
      .where(and(
        eq(mealPlans.hotelId, hotelId),
        eq(mealPlans.isActive, true)
      ))
      .orderBy(asc(mealPlans.planType));
  }

  async getMealPlan(id: string): Promise<MealPlan | undefined> {
    const [plan] = await db
      .select()
      .from(mealPlans)
      .where(eq(mealPlans.id, id));
    return plan || undefined;
  }

  async createMealPlan(plan: InsertMealPlan): Promise<MealPlan> {
    const [mealPlan] = await db
      .insert(mealPlans)
      .values(plan)
      .returning();
    return mealPlan;
  }

  async updateMealPlan(id: string, plan: Partial<InsertMealPlan>): Promise<MealPlan> {
    const [mealPlan] = await db
      .update(mealPlans)
      .set({ ...plan, updatedAt: new Date() })
      .where(eq(mealPlans.id, id))
      .returning();
    return mealPlan;
  }

  async deleteMealPlan(id: string, hotelId: string): Promise<boolean> {
    const result = await db
      .update(mealPlans)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(
        eq(mealPlans.id, id),
        eq(mealPlans.hotelId, hotelId)
      ))
      .returning();
    return result.length > 0;
  }

  // Guest operations
  async getGuestsByHotel(hotelId: string): Promise<Guest[]> {
    return await db
      .select()
      .from(guests)
      .where(and(
        eq(guests.hotelId, hotelId),
        isNull(guests.deletedAt)
      ))
      .orderBy(desc(guests.createdAt));
  }

  async getGuest(id: string): Promise<Guest | undefined> {
    const [guest] = await db
      .select()
      .from(guests)
      .where(and(
        eq(guests.id, id),
        isNull(guests.deletedAt)
      ));
    return guest || undefined;
  }

  async createGuest(guestData: InsertGuest): Promise<Guest> {
    const [guest] = await db
      .insert(guests)
      .values(guestData)
      .returning();
    return guest;
  }

  async updateGuest(id: string, guestData: Partial<InsertGuest>): Promise<Guest> {
    const [guest] = await db
      .update(guests)
      .set({ ...guestData, updatedAt: new Date() })
      .where(eq(guests.id, id))
      .returning();
    return guest;
  }

  async deleteGuest(id: string): Promise<void> {
    await db
      .update(guests)
      .set({ deletedAt: new Date() })
      .where(eq(guests.id, id));
  }

  async searchGuests(hotelId: string, searchTerm: string): Promise<Guest[]> {
    const search = `%${searchTerm.toLowerCase()}%`;
    return await db
      .select()
      .from(guests)
      .where(and(
        eq(guests.hotelId, hotelId),
        isNull(guests.deletedAt),
        sql`(LOWER(${guests.firstName}) LIKE ${search} OR LOWER(${guests.lastName}) LIKE ${search} OR LOWER(${guests.phone}) LIKE ${search} OR LOWER(${guests.email}) LIKE ${search})`
      ))
      .orderBy(desc(guests.createdAt));
  }
}

export const storage = new DatabaseStorage();
