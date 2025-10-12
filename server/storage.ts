import {
  users,
  hotels,
  roles,
  rooms,
  roomTypes,
  menuItems,
  menuCategories,
  tasks,
  roomCleaningQueue,
  transactions,
  maintenanceRequests,
  kotOrders,
  kotItems,
  kotAuditLogs,
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
  leavePolicies,
  leaveBalances,
  notifications,
  wastages,
  mealPlans,
  mealVouchers,
  guests,
  stockRequests,
  hallBookings,
  bookingPayments,
  restaurantBills,
  billPayments,
  auditLogs,
  priceChangeLogs,
  taxChangeLogs,
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
  type SelectRoomCleaningQueue,
  type InsertRoomCleaningQueue,
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
  type LeavePolicy,
  type InsertLeavePolicy,
  type Wastage,
  type InsertWastage,
  type MealPlan,
  type InsertMealPlan,
  type MealVoucher,
  type InsertMealVoucher,
  type Guest,
  type InsertGuest,
  type StockRequest,
  type InsertStockRequest,
  type SelectHallBooking,
  type InsertHallBooking,
  type SelectRestaurantBill,
  type InsertRestaurantBill,
  type SelectBillPayment,
  type InsertBillPayment,
  type RoomReservation,
  type InsertRoomReservation,
  roomReservations,
  type RoomServiceCharge,
  type InsertRoomServiceCharge,
  roomServiceCharges,
  type Attendance,
  type InsertAttendance,
  checkoutOverrideLogs,
  type CheckoutOverrideLog,
  type InsertCheckoutOverrideLog,
  roomStatusLogs,
  type RoomStatusLog,
  type InsertRoomStatusLog,
  securityAlerts,
  type SecurityAlert,
  type InsertSecurityAlert
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, not, isNull, desc, asc, sql, gte, lte, gt, lt, ne, inArray } from "drizzle-orm";
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
  updateUserSecure(id: string, user: Partial<InsertUser>, options?: { allowReactivation?: boolean }): Promise<User>;
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
  createRoomStatusLog(log: InsertRoomStatusLog): Promise<RoomStatusLog>;

  // Room reservation operations
  createRoomReservation(reservation: InsertRoomReservation): Promise<RoomReservation>;
  getRoomReservationsByHotel(hotelId: string): Promise<RoomReservation[]>;
  getRoomReservation(id: string): Promise<RoomReservation | undefined>;
  updateRoomReservation(id: string, data: Partial<InsertRoomReservation>): Promise<RoomReservation>;
  createCheckoutOverrideLog(log: InsertCheckoutOverrideLog): Promise<CheckoutOverrideLog>;

  // Room service charge operations
  createRoomServiceCharge(charge: InsertRoomServiceCharge): Promise<RoomServiceCharge>;
  getRoomServiceCharges(reservationId: string): Promise<RoomServiceCharge[]>;
  getAllRoomServiceChargesByHotel(hotelId: string): Promise<RoomServiceCharge[]>;
  deleteRoomServiceCharge(id: string): Promise<void>;

  // Room type operations
  getRoomTypesByHotel(hotelId: string): Promise<RoomType[]>;
  createRoomType(roomType: InsertRoomType): Promise<RoomType>;
  updateRoomType(id: number, hotelId: string, roomType: Partial<InsertRoomType>): Promise<RoomType | null>;
  deleteRoomType(id: number, hotelId: string): Promise<boolean>;
  
  // Amenity operations - Halls
  getHallsByHotel(hotelId: string): Promise<Hall[]>;
  getHall(id: string): Promise<Hall | undefined>;
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
  
  // Room Cleaning Queue operations
  getRoomCleaningQueueByHotel(hotelId: string): Promise<SelectRoomCleaningQueue[]>;
  createRoomCleaningQueue(queue: InsertRoomCleaningQueue): Promise<SelectRoomCleaningQueue>;
  updateRoomCleaningQueue(id: string, queue: Partial<InsertRoomCleaningQueue>): Promise<SelectRoomCleaningQueue>;
  
  // Transaction operations
  getTransactionsByHotel(hotelId: string): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction>;
  voidTransaction(id: string, voidedBy: string, reason: string): Promise<Transaction>;
  
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
  createKotAuditLog(log: { kotItemId: string; action: string; performedBy: string; reason?: string; previousStatus?: string; newStatus?: string }): Promise<any>;
  
  // Wastage operations
  createWastage(wastageData: any): Promise<any>;
  getWastagesByHotel(hotelId: string): Promise<any[]>;
  getWastage(id: string): Promise<any | undefined>;
  approveWastage(id: string, approvedBy: string): Promise<any>;
  rejectWastage(id: string, rejectedBy: string, rejectionReason: string): Promise<any>;
  
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
  getHotelTax(hotelId: string, taxType: string): Promise<HotelTax | undefined>;
  updateHotelTax(hotelId: string, taxType: string, isActive: boolean, percent?: number): Promise<HotelTax>;
  createTaxChangeLog(log: { hotelId: string; taxType: string; previousPercent?: string | number | null; newPercent?: string | number | null; previousActive?: boolean; newActive?: boolean; changedBy: string }): Promise<any>;
  
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
  
  // Security alert operations
  createSecurityAlert(alert: InsertSecurityAlert): Promise<SecurityAlert>;
  
  // Room service operations
  getRoomServiceOrdersByHotel(hotelId: string): Promise<RoomServiceOrder[]>;
  createRoomServiceOrder(order: any): Promise<RoomServiceOrder>;
  
  // Leave request operations
  getLeaveRequestsByHotel(hotelId: string): Promise<LeaveRequest[]>;
  getLeaveRequestsByUser(userId: string): Promise<LeaveRequest[]>;
  getLeaveRequestsForManager(hotelId: string): Promise<LeaveRequest[]>;
  getPendingLeaveRequestsForManager(hotelId: string): Promise<LeaveRequest[]>;
  getPendingLeaveRequestsForApprover(approverRole: string, hotelId: string): Promise<LeaveRequest[]>;
  getLeaveRequestsForApprover(approverRole: string, hotelId: string): Promise<LeaveRequest[]>;
  createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest>;
  updateLeaveRequest(id: string, request: Partial<any>): Promise<LeaveRequest>;
  getLeaveRequest(id: string): Promise<LeaveRequest | undefined>;
  getOverlappingLeaves(userId: string, startDate: Date, endDate: Date, excludeId?: string): Promise<LeaveRequest[]>;
  
  // Leave balance operations
  getLeaveBalancesByUser(userId: string, year?: number): Promise<any[]>;
  getLeaveBalance(userId: string, leaveType: string, year: number): Promise<any | undefined>;
  createLeaveBalance(balance: any): Promise<any>;
  updateLeaveBalance(id: string, balance: any): Promise<any>;
  initializeLeaveBalances(userId: string, hotelId: string, year: number): Promise<void>;
  
  // Leave policy operations
  getLeavePoliciesByHotel(hotelId: string): Promise<LeavePolicy[]>;
  getLeavePolicy(id: string): Promise<LeavePolicy | undefined>;
  createLeavePolicy(policy: InsertLeavePolicy): Promise<LeavePolicy>;
  updateLeavePolicy(id: string, policy: Partial<InsertLeavePolicy>): Promise<LeavePolicy>;
  deleteLeavePolicy(id: string): Promise<void>;
  
  // Notification operations
  getNotificationsByUser(userId: string): Promise<any[]>;
  getUnreadNotificationsByUser(userId: string): Promise<any[]>;
  createNotification(notification: any): Promise<any>;
  markNotificationAsRead(id: string): Promise<any>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  
  // Meal plan operations
  getMealPlansByHotel(hotelId: string): Promise<MealPlan[]>;
  getMealPlan(id: string): Promise<MealPlan | undefined>;
  createMealPlan(plan: InsertMealPlan): Promise<MealPlan>;
  updateMealPlan(id: string, plan: Partial<InsertMealPlan>): Promise<MealPlan>;
  deleteMealPlan(id: string, hotelId: string): Promise<boolean>;
  
  // Meal voucher operations
  createMealVoucher(voucher: InsertMealVoucher): Promise<MealVoucher>;
  getMealVouchers(hotelId: string, filters?: { status?: string; date?: Date }): Promise<MealVoucher[]>;
  getMealVouchersByRoom(roomId: string): Promise<MealVoucher[]>;
  redeemMealVoucher(id: string, redeemedBy: string, notes?: string): Promise<MealVoucher | null>;
  
  // Guest operations
  getGuestsByHotel(hotelId: string): Promise<Guest[]>;
  getGuest(id: string): Promise<Guest | undefined>;
  createGuest(guest: InsertGuest): Promise<Guest>;
  updateGuest(id: string, guest: Partial<InsertGuest>): Promise<Guest>;
  deleteGuest(id: string): Promise<void>;
  restoreGuest(id: string, hotelId: string): Promise<Guest>;
  searchGuests(hotelId: string, searchTerm: string): Promise<Guest[]>;
  
  // Stock request operations
  getStockRequestsByHotel(hotelId: string): Promise<StockRequest[]>;
  getStockRequestsByUser(userId: string): Promise<StockRequest[]>;
  getPendingStockRequestsForStorekeeper(hotelId: string): Promise<StockRequest[]>;
  getStockRequestsByDepartment(hotelId: string, department: string): Promise<StockRequest[]>;
  getStockRequest(id: string): Promise<StockRequest | undefined>;
  createStockRequest(request: InsertStockRequest): Promise<StockRequest>;
  updateStockRequest(id: string, request: Partial<StockRequest>): Promise<StockRequest>;
  approveStockRequest(id: string, approvedBy: string): Promise<StockRequest>;
  deliverStockRequest(id: string, deliveredBy: string): Promise<StockRequest>;
  
  // Hall booking operations
  getHallBookingsByHotel(hotelId: string): Promise<SelectHallBooking[]>;
  getHallBookingsByHall(hallId: string): Promise<SelectHallBooking[]>;
  getHallBooking(id: string): Promise<SelectHallBooking | undefined>;
  createHallBooking(booking: InsertHallBooking): Promise<SelectHallBooking>;
  updateHallBooking(id: string, booking: Partial<InsertHallBooking>): Promise<SelectHallBooking>;
  confirmHallBooking(id: string, confirmedBy: string): Promise<SelectHallBooking>;
  cancelHallBooking(id: string, cancelledBy: string, reason: string): Promise<SelectHallBooking>;
  checkHallAvailability(hallId: string, startTime: Date, endTime: Date, excludeBookingId?: string): Promise<boolean>;
  createBookingPayment(payment: any): Promise<any>;
  
  // Restaurant bill operations
  getRestaurantBillsByHotel(hotelId: string, filters?: { startDate?: Date; endDate?: Date; status?: string }): Promise<any[]>;
  getRestaurantBill(id: string): Promise<any | undefined>;
  createRestaurantBill(bill: any): Promise<any>;
  updateRestaurantBill(id: string, bill: Partial<any>): Promise<any>;
  getBillPayments(billId: string): Promise<any[]>;
  createBillPayment(payment: any): Promise<any>;
  getBillPayment(paymentId: string): Promise<any | undefined>;
  voidBillPayment(paymentId: string, voidedBy: string, reason: string): Promise<any>;
  
  // Attendance operations
  createAttendance(userId: string, hotelId: string, clockInTime: Date, location: string | null, ip: string | null, source: string | null): Promise<any>;
  getActiveAttendance(userId: string): Promise<any | null>;
  clockOut(attendanceId: string, clockOutTime: Date, location: string | null, ip: string | null, source: string | null): Promise<any>;
  getAttendanceByUser(userId: string, startDate?: Date, endDate?: Date): Promise<any[]>;
  getAttendanceByHotel(hotelId: string, date: Date): Promise<any[]>;
  getAllAttendanceByHotel(hotelId: string, startDate?: Date, endDate?: Date): Promise<any[]>;
  canClockIn(userId: string): Promise<{ canClockIn: boolean; reason?: string }>;
  
  // Audit log operations
  createAuditLog(log: { hotelId: string; resourceType: string; resourceId: string; action: string; userId: string; details: any }): Promise<any>;
  
  // Price change log operations
  createPriceChangeLog(log: { hotelId: string; itemId: string; itemType: string; itemName: string; previousPrice: string | number; newPrice: string | number; changedBy: string }): Promise<any>;
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
    // CRITICAL SECURITY: Check current user state BEFORE any updates
    const currentUser = await this.getUser(id);
    if (!currentUser) {
      throw new Error('User not found');
    }
    
    // Block setting isOnline=true if user is CURRENTLY deactivated
    // This check uses the CURRENT state, not the new state being applied
    if ('isOnline' in userData && userData.isOnline === true && !currentUser.isActive) {
      throw new Error('Cannot set online status for deactivated user');
    }
    
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserSecure(id: string, userData: Partial<InsertUser>, options?: { allowReactivation?: boolean }): Promise<User> {
    // This method is for use by API routes that have already checked permissions
    return this.updateUser(id, userData);
  }

  async deleteUser(id: string): Promise<void> {
    await db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, id));
  }

  async updateUserOnlineStatus(id: string, isOnline: boolean): Promise<void> {
    // CRITICAL SECURITY: Prevent deactivated users from going online
    if (isOnline) {
      const user = await this.getUser(id);
      if (!user || !user.isActive) {
        throw new Error('Cannot set online status for deactivated user');
      }
    }
    
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
        currentReservationId: rooms.currentReservationId,
        status: rooms.status,
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

  async createRoomStatusLog(logData: InsertRoomStatusLog): Promise<RoomStatusLog> {
    const [log] = await db
      .insert(roomStatusLogs)
      .values(logData)
      .returning();
    return log;
  }

  // Room reservation operations
  async createRoomReservation(reservationData: InsertRoomReservation): Promise<RoomReservation> {
    // CRITICAL: Use database transaction with row locking
    return await db.transaction(async (tx) => {
      const { roomId, checkInDate, checkOutDate } = reservationData;
      
      // Lock the room for update
      const [room] = await tx
        .select()
        .from(rooms)
        .where(eq(rooms.id, roomId))
        .for('update'); // PostgreSQL row lock
      
      if (!room) {
        throw new Error('Room not found');
      }
      
      // Check availability with locked row
      const overlapping = await tx
        .select()
        .from(roomReservations)
        .where(
          and(
            eq(roomReservations.roomId, roomId),
            or(
              eq(roomReservations.status, 'confirmed'),
              eq(roomReservations.status, 'checked_in')
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
        )
        .limit(1);
      
      if (overlapping.length > 0) {
        throw new Error('Room is already booked for selected dates');
      }
      
      // Create reservation
      const [reservation] = await tx
        .insert(roomReservations)
        .values(reservationData)
        .returning();
      
      return reservation;
    });
  }

  async getRoomReservationsByHotel(hotelId: string): Promise<RoomReservation[]> {
    const reservations = await db
      .select()
      .from(roomReservations)
      .where(eq(roomReservations.hotelId, hotelId));
    return reservations;
  }

  async getRoomReservation(id: string): Promise<RoomReservation | undefined> {
    const [reservation] = await db
      .select()
      .from(roomReservations)
      .where(eq(roomReservations.id, id));
    return reservation;
  }

  async updateRoomReservation(id: string, data: Partial<InsertRoomReservation>): Promise<RoomReservation> {
    const [updated] = await db
      .update(roomReservations)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(roomReservations.id, id))
      .returning();
    
    if (!updated) {
      throw new Error('Reservation not found');
    }
    
    return updated;
  }

  async createCheckoutOverrideLog(log: InsertCheckoutOverrideLog): Promise<CheckoutOverrideLog> {
    const [createdLog] = await db
      .insert(checkoutOverrideLogs)
      .values(log)
      .returning();
    return createdLog;
  }

  // Room service charge operations
  async createRoomServiceCharge(chargeData: InsertRoomServiceCharge): Promise<RoomServiceCharge> {
    const [charge] = await db
      .insert(roomServiceCharges)
      .values(chargeData)
      .returning();
    return charge;
  }

  async getRoomServiceCharges(reservationId: string): Promise<RoomServiceCharge[]> {
    const charges = await db
      .select()
      .from(roomServiceCharges)
      .where(eq(roomServiceCharges.reservationId, reservationId))
      .orderBy(desc(roomServiceCharges.createdAt));
    return charges;
  }

  async getAllRoomServiceChargesByHotel(hotelId: string): Promise<RoomServiceCharge[]> {
    const charges = await db
      .select()
      .from(roomServiceCharges)
      .where(eq(roomServiceCharges.hotelId, hotelId))
      .orderBy(desc(roomServiceCharges.createdAt));
    return charges;
  }

  async deleteRoomServiceCharge(id: string): Promise<void> {
    await db
      .delete(roomServiceCharges)
      .where(eq(roomServiceCharges.id, id));
  }

  async checkRoomAvailability(
    hotelId: string,
    roomId: string,
    checkInDate: Date,
    checkOutDate: Date,
    excludeReservationId?: string
  ): Promise<boolean> {
    const overlapping = await db
      .select()
      .from(roomReservations)
      .where(
        and(
          eq(roomReservations.roomId, roomId),
          or(
            eq(roomReservations.status, 'confirmed'),
            eq(roomReservations.status, 'checked_in')
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
      )
      .limit(1);
    
    return overlapping.length === 0;
  }

  async getReservationsByDateRange(
    hotelId: string,
    startDate: Date,
    endDate: Date
  ): Promise<RoomReservation[]> {
    const { and, or, lte, gte } = await import('drizzle-orm');

    const reservations = await db
      .select()
      .from(roomReservations)
      .where(
        and(
          eq(roomReservations.hotelId, hotelId),
          or(
            and(
              lte(roomReservations.checkInDate, endDate),
              gte(roomReservations.checkOutDate, startDate)
            )
          )
        )
      );
    return reservations;
  }

  async checkInGuest(reservationId: string): Promise<RoomReservation> {
    const { and } = await import('drizzle-orm');
    
    // Get the reservation
    const [reservation] = await db
      .select()
      .from(roomReservations)
      .where(eq(roomReservations.id, reservationId));

    if (!reservation) {
      throw new Error('Reservation not found');
    }

    if (reservation.status === 'checked-in') {
      throw new Error('Guest is already checked in');
    }

    if (reservation.status === 'checked-out') {
      throw new Error('This reservation is already completed');
    }

    if (reservation.status === 'cancelled') {
      throw new Error('This reservation has been cancelled');
    }

    // Update room status
    await db
      .update(rooms)
      .set({
        status: 'occupied',
        isOccupied: true,
        currentReservationId: reservationId,
        occupantDetails: {
          name: reservation.guestName,
          email: reservation.guestEmail,
          phone: reservation.guestPhone,
          checkInDate: reservation.checkInDate,
          checkOutDate: reservation.checkOutDate,
          numberOfPersons: reservation.numberOfPersons,
          reservationId: reservationId
        },
        updatedAt: new Date()
      })
      .where(eq(rooms.id, reservation.roomId));

    // Update guest if guestId exists
    if (reservation.guestId) {
      await db
        .update(guests)
        .set({
          currentReservationId: reservationId,
          updatedAt: new Date()
        })
        .where(eq(guests.id, reservation.guestId));
    }

    // Update reservation status
    const [updatedReservation] = await db
      .update(roomReservations)
      .set({
        status: 'checked_in',
        updatedAt: new Date()
      })
      .where(eq(roomReservations.id, reservationId))
      .returning();

    return updatedReservation;
  }

  async checkOutGuest(reservationId: string): Promise<RoomReservation> {
    // Get the reservation
    const [reservation] = await db
      .select()
      .from(roomReservations)
      .where(eq(roomReservations.id, reservationId));

    if (!reservation) {
      throw new Error('Reservation not found');
    }

    if (reservation.status === 'checked_out') {
      throw new Error('Guest is already checked out');
    }

    if (reservation.status !== 'checked_in') {
      throw new Error('Guest must be checked in before checkout');
    }

    // Get room details for cleaning queue
    const [room] = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, reservation.roomId));

    // Update room status
    await db
      .update(rooms)
      .set({
        status: 'available',
        isOccupied: false,
        currentReservationId: null,
        occupantDetails: null,
        updatedAt: new Date()
      })
      .where(eq(rooms.id, reservation.roomId));

    // Update guest if guestId exists
    if (reservation.guestId) {
      await db
        .update(guests)
        .set({
          currentReservationId: null,
          updatedAt: new Date()
        })
        .where(eq(guests.id, reservation.guestId));
    }

    // Add room to cleaning queue
    await db
      .insert(roomCleaningQueue)
      .values({
        hotelId: reservation.hotelId,
        roomId: reservation.roomId,
        roomNumber: room?.roomNumber || 'Unknown',
        guestName: reservation.guestName,
        guestId: reservation.guestId,
        checkoutAt: new Date(),
        status: 'pending'
      });

    // Update reservation status
    const [updatedReservation] = await db
      .update(roomReservations)
      .set({
        status: 'checked-out',
        updatedAt: new Date()
      })
      .where(eq(roomReservations.id, reservationId))
      .returning();

    return updatedReservation;
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

  // Room Cleaning Queue operations
  async getRoomCleaningQueueByHotel(hotelId: string): Promise<SelectRoomCleaningQueue[]> {
    return await db
      .select()
      .from(roomCleaningQueue)
      .where(eq(roomCleaningQueue.hotelId, hotelId))
      .orderBy(desc(roomCleaningQueue.checkoutAt));
  }

  async createRoomCleaningQueue(queueData: InsertRoomCleaningQueue): Promise<SelectRoomCleaningQueue> {
    const [queue] = await db
      .insert(roomCleaningQueue)
      .values(queueData)
      .returning();
    return queue;
  }

  async updateRoomCleaningQueue(id: string, queueData: Partial<InsertRoomCleaningQueue>): Promise<SelectRoomCleaningQueue> {
    const [queue] = await db
      .update(roomCleaningQueue)
      .set({ ...queueData, updatedAt: new Date() })
      .where(eq(roomCleaningQueue.id, id))
      .returning();
    return queue;
  }

  // Transaction operations
  async getTransactionsByHotel(hotelId: string): Promise<any[]> {
    const results = await db
      .select({
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
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.createdBy, users.id))
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(and(eq(transactions.hotelId, hotelId), isNull(transactions.deletedAt)))
      .orderBy(desc(transactions.createdAt));
    return results;
  }

  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(transactionData)
      .returning();
    return transaction;
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    return transaction;
  }

  async updateTransaction(id: string, transactionData: Partial<InsertTransaction>): Promise<Transaction> {
    const [transaction] = await db
      .update(transactions)
      .set(transactionData)
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  async voidTransaction(id: string, voidedBy: string, reason: string): Promise<Transaction> {
    const [voided] = await db
      .update(transactions)
      .set({
        isVoided: true,
        voidedBy,
        voidedAt: new Date(),
        voidReason: reason
      })
      .where(eq(transactions.id, id))
      .returning();
    
    return voided;
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
        reportedBy: maintenanceRequests.reportedBy,
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
    
    // Fetch all unique assignee IDs
    const assigneeIds = Array.from(new Set(results.map(r => r.assignedTo).filter(Boolean)));
    
    // Fetch assignee user data
    const assignees = assigneeIds.length > 0 ? await db
      .select({
        id: users.id,
        username: users.username,
        roleId: roles.id,
        roleName: roles.name
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(inArray(users.id, assigneeIds as string[]))
      : [];
    
    // Create a map for quick lookup
    const assigneeMap = new Map(
      assignees.map(a => [a.id, {
        id: a.id,
        username: a.username,
        role: a.roleId ? { id: a.roleId, name: a.roleName } : null
      }])
    );
    
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

  async getKotOrderById(id: string): Promise<KotOrder | undefined> {
    const [order] = await db
      .select()
      .from(kotOrders)
      .where(eq(kotOrders.id, id))
      .limit(1);
    return order;
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

  async createKotAuditLog(log: { kotItemId: string; action: string; performedBy: string; reason?: string; previousStatus?: string; newStatus?: string }): Promise<any> {
    const [auditLog] = await db
      .insert(kotAuditLogs)
      .values({
        kotItemId: log.kotItemId,
        action: log.action,
        performedBy: log.performedBy,
        reason: log.reason,
        previousStatus: log.previousStatus,
        newStatus: log.newStatus
      })
      .returning();
    return auditLog;
  }

  async updateKotOrderStatus(kotOrderId: string): Promise<void> {
    try {
      // Fetch all items for this order
      const items = await this.getKotItems(kotOrderId);
      
      if (items.length === 0) {
        // No items, keep order as 'open'
        return;
      }

      // Count statuses
      const statusCounts = items.reduce((acc, item) => {
        const status = item.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      let newOrderStatus = 'open';

      // Determine order status based on item statuses
      if (statusCounts['declined'] && statusCounts['declined'] > 0) {
        // If any item is declined, keep order as 'open'
        newOrderStatus = 'open';
      } else if (items.every(item => item.status === 'served')) {
        // All items served -> order completed
        newOrderStatus = 'completed';
      } else if (items.every(item => item.status === 'ready')) {
        // All items ready -> order ready
        newOrderStatus = 'ready';
      } else if (items.every(item => item.status === 'approved' || item.status === 'ready' || item.status === 'served')) {
        // All items are at least approved (could be mix of approved/ready/served) -> in_progress
        newOrderStatus = 'in_progress';
      } else {
        // Mixed statuses including pending -> keep as open
        newOrderStatus = 'open';
      }

      // Update the order status
      await db
        .update(kotOrders)
        .set({ status: newOrderStatus, updatedAt: new Date() })
        .where(eq(kotOrders.id, kotOrderId));

      console.log(`KOT Order ${kotOrderId} status updated to: ${newOrderStatus}`);
    } catch (error) {
      console.error(`Failed to update KOT order status for ${kotOrderId}:`, error);
      // Don't throw - this is a background sync operation
    }
  }

  async deductInventoryForKotItem(kotItemId: string): Promise<void> {
    // Get the KOT item
    const kotItem = await this.getKotItemById(kotItemId);
    if (!kotItem || !kotItem.menuItemId) {
      return;
    }

    // Check if inventory was already deducted
    if (kotItem.inventoryUsage) {
      console.log('Inventory already deducted for this KOT item');
      return;
    }

    // Get the menu item with its recipe
    const menuItem = await db.query.menuItems.findFirst({
      where: (menuItemsTable, { eq }) => eq(menuItemsTable.id, kotItem.menuItemId!)
    });

    const recipe = menuItem?.recipe as any;
    if (!recipe?.ingredients || !Array.isArray(recipe.ingredients)) {
      return;
    }

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
          
          const totalQuantityToDeduct = quantityInBaseUnit * (kotItem.qty || 1);
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

    // Update the KOT item with inventory usage record
    if (usageRecords.length > 0) {
      await db
        .update(kotItems)
        .set({ 
          inventoryUsage: { usedIngredients: usageRecords }
        })
        .where(eq(kotItems.id, kotItemId));
    }
  }

  // Wastage operations
  async createWastage(wastageData: any): Promise<any> {
    const inventoryItem = await this.getInventoryItem(wastageData.itemId);
    if (!inventoryItem) {
      throw new Error('Inventory item not found');
    }

    const wastageQty = Number(wastageData.qty);
    
    // CRITICAL SECURITY: Guard against invalid quantities
    if (!Number.isFinite(wastageQty) || wastageQty <= 0) {
      throw new Error('Quantity must be a positive number');
    }
    const wastageUnit = wastageData.unit || inventoryItem.baseUnit;
    const baseUnit = (inventoryItem.baseUnit || inventoryItem.unit) as any;
    const category = (inventoryItem.measurementCategory || 'weight') as any;
    const conversionProfile = inventoryItem.conversionProfile as any;

    let wastageQtyInBaseUnits = wastageQty;
    if (wastageUnit !== baseUnit) {
      const { convertToBase } = await import('@shared/measurements');
      try {
        wastageQtyInBaseUnits = convertToBase(
          wastageQty,
          wastageUnit as any,
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
    
    // Only deduct stock if status is 'approved'
    if (wastageData.status === 'approved') {
      const newQuantity = currentStock - wastageQtyInBaseUnits;

      await db
        .update(inventoryItems)
        .set({ 
          baseStockQty: String(newQuantity),
          stockQty: String(newQuantity),
          updatedAt: new Date()
        })
        .where(eq(inventoryItems.id, wastageData.itemId));

      await db
        .insert(inventoryConsumptions)
        .values({
          hotelId: wastageData.hotelId,
          itemId: wastageData.itemId,
          qty: String(wastageQtyInBaseUnits),
          unit: baseUnit,
          reason: `Wastage: ${wastageData.reason}`,
          referenceEntity: 'wastage',
          createdBy: wastageData.recordedBy
        });

      await db
        .insert(inventoryTransactions)
        .values({
          hotelId: wastageData.hotelId,
          itemId: wastageData.itemId,
          transactionType: 'wastage',
          qtyBase: String(wastageQtyInBaseUnits),
          notes: wastageData.reason,
          recordedBy: wastageData.recordedBy
        });
    }

    const [wastage] = await db
      .insert(wastages)
      .values({
        ...wastageData,
        unit: wastageUnit
      })
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

  async getWastage(id: string): Promise<any | undefined> {
    const [wastage] = await db
      .select()
      .from(wastages)
      .where(eq(wastages.id, id));
    return wastage;
  }

  async approveWastage(id: string, approvedBy: string): Promise<any> {
    const wastage = await this.getWastage(id);
    if (!wastage) {
      throw new Error('Wastage not found');
    }

    const inventoryItem = await this.getInventoryItem(wastage.itemId);
    if (!inventoryItem) {
      throw new Error('Inventory item not found');
    }

    const wastageQty = Number(wastage.qty);
    
    // CRITICAL SECURITY: Guard against invalid quantities
    if (!Number.isFinite(wastageQty) || wastageQty <= 0) {
      throw new Error('Quantity must be a positive number');
    }
    const wastageUnit = wastage.unit || inventoryItem.baseUnit;
    const baseUnit = (inventoryItem.baseUnit || inventoryItem.unit) as any;
    const category = (inventoryItem.measurementCategory || 'weight') as any;
    const conversionProfile = inventoryItem.conversionProfile as any;

    let wastageQtyInBaseUnits = wastageQty;
    if (wastageUnit !== baseUnit) {
      const { convertToBase } = await import('@shared/measurements');
      try {
        wastageQtyInBaseUnits = convertToBase(
          wastageQty,
          wastageUnit as any,
          baseUnit,
          category,
          conversionProfile
        );
      } catch (error) {
        console.error(`Unit conversion error:`, error);
        throw new Error(`Cannot convert from ${wastageUnit} to ${baseUnit}`);
      }
    }

    // Note: Wastage is recorded but NOT deducted from inventory
    // This keeps wastage as a record only for tracking purposes
    
    // Record transaction
    await db
      .insert(inventoryTransactions)
      .values({
        hotelId: wastage.hotelId,
        itemId: wastage.itemId,
        transactionType: 'wastage',
        qtyBase: String(wastageQtyInBaseUnits),
        notes: wastage.reason,
        recordedBy: wastage.recordedBy
      });

    // Update wastage status
    const [approvedWastage] = await db
      .update(wastages)
      .set({
        status: 'approved',
        approvedBy,
        approvedAt: new Date()
      })
      .where(eq(wastages.id, id))
      .returning();

    return approvedWastage;
  }

  async rejectWastage(id: string, rejectedBy: string, rejectionReason: string): Promise<any> {
    const wastage = await this.getWastage(id);
    if (!wastage) {
      throw new Error('Wastage not found');
    }

    // No need to return inventory - it was never deducted for pending approvals
    const [rejectedWastage] = await db
      .update(wastages)
      .set({
        status: 'rejected',
        approvedBy: rejectedBy,
        approvedAt: new Date(),
        rejectionReason
      })
      .where(eq(wastages.id, id))
      .returning();

    return rejectedWastage;
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
        isNull(inventoryItems.deletedAt),
        sql`CAST(${inventoryItems.baseStockQty} AS DECIMAL) < CAST(${inventoryItems.reorderLevel} AS DECIMAL)`
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

  async getHotelTax(hotelId: string, taxType: string): Promise<HotelTax | undefined> {
    const [tax] = await db
      .select()
      .from(hotelTaxes)
      .where(and(
        eq(hotelTaxes.hotelId, hotelId),
        eq(hotelTaxes.taxType, taxType)
      ));
    return tax || undefined;
  }

  async updateHotelTax(hotelId: string, taxType: string, isActive: boolean, percent?: number): Promise<HotelTax> {
    const [tax] = await db
      .insert(hotelTaxes)
      .values({
        hotelId,
        taxType,
        isActive,
        percent: percent !== undefined ? percent.toString() : null
      })
      .onConflictDoUpdate({
        target: [hotelTaxes.hotelId, hotelTaxes.taxType],
        set: {
          isActive,
          percent: percent !== undefined ? percent.toString() : null
        }
      })
      .returning();
    return tax;
  }

  async createTaxChangeLog(log: { hotelId: string; taxType: string; previousPercent?: string | number | null; newPercent?: string | number | null; previousActive?: boolean; newActive?: boolean; changedBy: string }): Promise<any> {
    const [taxChangeLog] = await db
      .insert(taxChangeLogs)
      .values({
        hotelId: log.hotelId,
        taxType: log.taxType,
        previousPercent: log.previousPercent !== undefined && log.previousPercent !== null ? String(log.previousPercent) : null,
        newPercent: log.newPercent !== undefined && log.newPercent !== null ? String(log.newPercent) : null,
        previousActive: log.previousActive,
        newActive: log.newActive,
        changedBy: log.changedBy
      })
      .returning();
    
    return taxChangeLog;
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

  // Security alert operations
  async createSecurityAlert(alertData: InsertSecurityAlert): Promise<SecurityAlert> {
    const [alert] = await db
      .insert(securityAlerts)
      .values(alertData)
      .returning();
    return alert;
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

  async getHall(id: string): Promise<Hall | undefined> {
    const [hall] = await db
      .select()
      .from(halls)
      .where(eq(halls.id, id))
      .limit(1);
    return hall;
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
    const { getCategoryForUnit } = await import('@shared/measurements');
    const category = itemData.baseUnit ? getCategoryForUnit(itemData.baseUnit) : 'count';
    
    const [item] = await db
      .insert(inventoryItems)
      .values({
        ...itemData,
        measurementCategory: category
      })
      .returning();
    return item;
  }

  async updateInventoryItem(id: string, itemData: any): Promise<InventoryItem> {
    const updateData = { ...itemData, updatedAt: new Date() };
    
    if (itemData.baseUnit) {
      const { getCategoryForUnit } = await import('@shared/measurements');
      updateData.measurementCategory = getCategoryForUnit(itemData.baseUnit);
    }
    
    const [item] = await db
      .update(inventoryItems)
      .set(updateData)
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
    // CRITICAL: Use database transaction with row-level locking to prevent race conditions
    return await db.transaction(async (tx) => {
      const transactionType = transactionData.transactionType;
      
      // For operations that reduce stock, acquire a row lock to prevent concurrent modifications
      if (['issue', 'wastage'].includes(transactionType)) {
        // SELECT FOR UPDATE locks the row until transaction completes
        const [item] = await tx
          .select()
          .from(inventoryItems)
          .where(eq(inventoryItems.id, transactionData.itemId))
          .for('update')
          .limit(1);
        
        if (!item) {
          throw new Error('Inventory item not found');
        }
        
        const currentStock = Number(item.baseStockQty || item.stockQty || 0);
        const requestedQty = Number(transactionData.qtyBase || 0);
        
        // Double-check stock sufficiency within the transaction
        if (requestedQty > currentStock) {
          throw new Error(`Insufficient stock: Available ${currentStock}, Requested ${requestedQty}`);
        }
        
        const newStock = currentStock - requestedQty;
        
        // Update inventory stock atomically within the same transaction
        await tx
          .update(inventoryItems)
          .set({
            baseStockQty: String(Math.max(0, newStock)),
            stockQty: String(Math.max(0, newStock)),
            updatedAt: new Date()
          })
          .where(eq(inventoryItems.id, transactionData.itemId));
      }
      
      // For 'receive' and 'return' operations, lock and ADD to stock
      if (['receive', 'return'].includes(transactionType)) {
        const [item] = await tx
          .select()
          .from(inventoryItems)
          .where(eq(inventoryItems.id, transactionData.itemId))
          .for('update')
          .limit(1);
        
        if (!item) {
          throw new Error('Inventory item not found');
        }
        
        const currentStock = Number(item.baseStockQty || item.stockQty || 0);
        const addedQty = Number(transactionData.qtyBase || 0);
        const newStock = currentStock + addedQty;
        
        await tx
          .update(inventoryItems)
          .set({
            baseStockQty: String(newStock),
            stockQty: String(newStock),
            updatedAt: new Date()
          })
          .where(eq(inventoryItems.id, transactionData.itemId));
      }
      
      // For 'adjustment' operations, lock and apply DELTA (positive or negative)
      if (transactionType === 'adjustment') {
        const [item] = await tx
          .select()
          .from(inventoryItems)
          .where(eq(inventoryItems.id, transactionData.itemId))
          .for('update')
          .limit(1);
        
        if (!item) {
          throw new Error('Inventory item not found');
        }
        
        const currentStock = Number(item.baseStockQty || item.stockQty || 0);
        // Adjustment is a DELTA - can be positive (add) or negative (subtract)
        const adjustmentDelta = Number(transactionData.qtyBase || 0);
        const newStock = currentStock + adjustmentDelta;
        
        // Prevent negative stock from adjustments
        if (newStock < 0) {
          throw new Error(`Adjustment would result in negative stock: Current ${currentStock}, Delta ${adjustmentDelta}`);
        }
        
        await tx
          .update(inventoryItems)
          .set({
            baseStockQty: String(newStock),
            stockQty: String(newStock),
            updatedAt: new Date()
          })
          .where(eq(inventoryItems.id, transactionData.itemId));
      }
      
      // Insert the transaction record
      const [transaction] = await tx
        .insert(inventoryTransactions)
        .values(transactionData)
        .returning();
      
      return transaction;
    });
  }

  async createKotOrderWithItems(kotData: any, items: any[]): Promise<KotOrder> {
    // Create the KOT order first
    const [kot] = await db
      .insert(kotOrders)
      .values(kotData)
      .returning();

    // Insert each KOT item without inventory deduction
    // Inventory will be deducted when kitchen staff/bartender/barista approves the item
    for (const item of items) {
      await db
        .insert(kotItems)
        .values({
          ...item,
          kotId: kot.id,
          inventoryUsage: null
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
    const allRequests = await db
      .select({
        leaveRequest: leaveRequests,
        user: users,
        role: roles
      })
      .from(leaveRequests)
      .leftJoin(users, eq(leaveRequests.requestedBy, users.id))
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(eq(leaveRequests.hotelId, hotelId))
      .orderBy(desc(leaveRequests.createdAt));

    // Return leave requests with user info attached
    return allRequests.map(r => ({
      ...r.leaveRequest,
      requestedByUser: r.user,
      requestedByRole: r.role
    })) as any;
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

  async getPendingLeaveRequestsForApprover(approverRole: string, hotelId: string): Promise<LeaveRequest[]> {
    // Define role hierarchy: which roles each approver can approve
    const approvalMapping: Record<string, string[]> = {
      'restaurant_bar_manager': ['waiter', 'cashier', 'bartender', 'kitchen_staff', 'barista'],
      'housekeeping_supervisor': ['housekeeping_staff'],
      'security_head': ['surveillance_officer', 'security_guard'],
      'manager': ['restaurant_bar_manager', 'housekeeping_supervisor', 'security_head', 'finance', 'front_desk', 'storekeeper'],
      'owner': ['manager']
    };

    const rolesCanApprove = approvalMapping[approverRole] || [];
    
    if (rolesCanApprove.length === 0) {
      return [];
    }

    // First, get all users with the subordinate roles
    const subordinateUsers = await db
      .select({ id: users.id })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(and(
        eq(users.hotelId, hotelId),
        inArray(roles.name, rolesCanApprove)
      ));

    const subordinateUserIds = subordinateUsers.map(u => u.id);

    if (subordinateUserIds.length === 0) {
      return [];
    }

    // Get all pending leave requests from those subordinate users
    const allRequests = await db
      .select({
        leaveRequest: leaveRequests,
        user: users,
        role: roles
      })
      .from(leaveRequests)
      .innerJoin(users, eq(leaveRequests.requestedBy, users.id))
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(and(
        eq(leaveRequests.hotelId, hotelId),
        eq(leaveRequests.status, 'pending'),
        inArray(leaveRequests.requestedBy, subordinateUserIds)
      ))
      .orderBy(desc(leaveRequests.createdAt));

    // Return just the leave requests with user info attached
    return allRequests.map(r => ({
      ...r.leaveRequest,
      requestedByUser: r.user,
      requestedByRole: r.role
    })) as any;
  }

  async getLeaveRequestsForApprover(approverRole: string, hotelId: string): Promise<LeaveRequest[]> {
    // Define role hierarchy: which roles each approver can approve
    const approvalMapping: Record<string, string[]> = {
      'restaurant_bar_manager': ['waiter', 'cashier', 'bartender', 'kitchen_staff', 'barista'],
      'housekeeping_supervisor': ['housekeeping_staff'],
      'security_head': ['surveillance_officer', 'security_guard'],
      'manager': ['restaurant_bar_manager', 'housekeeping_supervisor', 'security_head', 'finance', 'front_desk', 'storekeeper'],
      'owner': ['manager']
    };

    const rolesCanApprove = approvalMapping[approverRole] || [];
    
    if (rolesCanApprove.length === 0) {
      return [];
    }

    // First, get all users with the subordinate roles
    const subordinateUsers = await db
      .select({ id: users.id })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(and(
        eq(users.hotelId, hotelId),
        inArray(roles.name, rolesCanApprove)
      ));

    const subordinateUserIds = subordinateUsers.map(u => u.id);

    if (subordinateUserIds.length === 0) {
      return [];
    }

    // Get ALL leave requests from those subordinate users (all statuses)
    const allRequests = await db
      .select({
        leaveRequest: leaveRequests,
        user: users,
        role: roles
      })
      .from(leaveRequests)
      .innerJoin(users, eq(leaveRequests.requestedBy, users.id))
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(and(
        eq(leaveRequests.hotelId, hotelId),
        inArray(leaveRequests.requestedBy, subordinateUserIds)
      ))
      .orderBy(desc(leaveRequests.createdAt));

    // Return just the leave requests with user info attached
    return allRequests.map(r => ({
      ...r.leaveRequest,
      requestedByUser: r.user,
      requestedByRole: r.role
    })) as any;
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

  async getOverlappingLeaves(userId: string, startDate: Date, endDate: Date, excludeId?: string): Promise<LeaveRequest[]> {
    const conditions = [
      eq(leaveRequests.requestedBy, userId),
      or(
        eq(leaveRequests.status, 'approved'),
        eq(leaveRequests.status, 'pending')
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

    return await db
      .select()
      .from(leaveRequests)
      .where(and(...conditions));
  }

  // Leave balance operations
  async getLeaveBalancesByUser(userId: string, year?: number): Promise<any[]> {
    const currentYear = year || new Date().getFullYear();
    const balances = await db
      .select()
      .from(leaveBalances)
      .where(and(
        eq(leaveBalances.userId, userId),
        eq(leaveBalances.year, currentYear)
      ));
    
    // Enrich balances with leave policy details
    if (balances.length === 0) {
      return [];
    }
    
    const firstBalance = balances[0];
    const hotelPolicies = await db
      .select()
      .from(leavePolicies)
      .where(eq(leavePolicies.hotelId, firstBalance.hotelId as string));
    
    const enrichedBalances = balances.map((balance) => {
      const policy = hotelPolicies.find(p => p.leaveType === balance.leaveType);
      return {
        ...balance,
        leaveTypeDetails: policy || { name: balance.leaveType, leaveType: balance.leaveType }
      };
    });
    
    return enrichedBalances;
  }

  async getLeaveBalance(userId: string, leaveType: string, year: number): Promise<any | undefined> {
    const [balance] = await db
      .select()
      .from(leaveBalances)
      .where(and(
        eq(leaveBalances.userId, userId),
        eq(leaveBalances.leaveType, leaveType),
        eq(leaveBalances.year, year)
      ));
    return balance || undefined;
  }

  async createLeaveBalance(balance: any): Promise<any> {
    const [leaveBalance] = await db
      .insert(leaveBalances)
      .values(balance)
      .returning();
    return leaveBalance;
  }

  async updateLeaveBalance(id: string, balance: any): Promise<any> {
    const [leaveBalance] = await db
      .update(leaveBalances)
      .set({ ...balance, updatedAt: new Date() })
      .where(eq(leaveBalances.id, id))
      .returning();
    return leaveBalance;
  }

  async initializeLeaveBalances(userId: string, hotelId: string, year: number): Promise<void> {
    const policies = await this.getLeavePoliciesByHotel(hotelId);
    const activePolicies = policies.filter(p => p.isActive);

    for (const policy of activePolicies) {
      const existing = await this.getLeaveBalance(userId, policy.leaveType, year);
      if (!existing) {
        await this.createLeaveBalance({
          hotelId,
          userId,
          leaveType: policy.leaveType,
          totalDays: policy.defaultDays.toString(),
          usedDays: '0',
          remainingDays: policy.defaultDays.toString(),
          year
        });
      }
    }
  }

  // Leave policy operations
  async getLeavePoliciesByHotel(hotelId: string): Promise<LeavePolicy[]> {
    return await db
      .select()
      .from(leavePolicies)
      .where(eq(leavePolicies.hotelId, hotelId))
      .orderBy(asc(leavePolicies.leaveType));
  }

  async getLeavePolicy(id: string): Promise<LeavePolicy | undefined> {
    const [policy] = await db
      .select()
      .from(leavePolicies)
      .where(eq(leavePolicies.id, id));
    return policy || undefined;
  }

  async createLeavePolicy(policy: InsertLeavePolicy): Promise<LeavePolicy> {
    const [newPolicy] = await db
      .insert(leavePolicies)
      .values(policy)
      .returning();
    return newPolicy;
  }

  async updateLeavePolicy(id: string, policy: Partial<InsertLeavePolicy>): Promise<LeavePolicy> {
    const [updatedPolicy] = await db
      .update(leavePolicies)
      .set({ ...policy, updatedAt: new Date() })
      .where(eq(leavePolicies.id, id))
      .returning();
    return updatedPolicy;
  }

  async deleteLeavePolicy(id: string): Promise<void> {
    await db
      .delete(leavePolicies)
      .where(eq(leavePolicies.id, id));
  }

  // Notification operations
  async getNotificationsByUser(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async getUnreadNotificationsByUser(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: any): Promise<any> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<any> {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
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

  // Meal voucher operations
  async createMealVoucher(voucher: InsertMealVoucher): Promise<MealVoucher> {
    const [created] = await db
      .insert(mealVouchers)
      .values(voucher)
      .returning();
    return created;
  }

  async getMealVouchers(hotelId: string, filters?: { status?: string; date?: Date }): Promise<MealVoucher[]> {
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
        ) as any
      );
    }
    
    return await db
      .select()
      .from(mealVouchers)
      .where(and(...conditions))
      .orderBy(desc(mealVouchers.voucherDate));
  }

  async getMealVouchersByRoom(roomId: string): Promise<MealVoucher[]> {
    return await db
      .select()
      .from(mealVouchers)
      .where(eq(mealVouchers.roomId, roomId))
      .orderBy(desc(mealVouchers.voucherDate));
  }

  async redeemMealVoucher(id: string, redeemedBy: string, notes?: string): Promise<MealVoucher | null> {
    // CRITICAL: Use transaction for atomic operation
    try {
      return await db.transaction(async (tx) => {
        // Lock the voucher row
        const [voucher] = await tx
          .select()
          .from(mealVouchers)
          .where(eq(mealVouchers.id, id))
          .for('update'); // Row lock
        
        if (!voucher) {
          throw new Error('Meal voucher not found');
        }
        
        // Check if already used
        if (voucher.status !== 'unused') {
          throw new Error('Meal voucher has already been used');
        }
        
        // Redeem the voucher
        const [redeemed] = await tx
          .update(mealVouchers)
          .set({
            status: 'used',
            usedAt: new Date(),
            redeemedBy,
            notes
          })
          .where(and(
            eq(mealVouchers.id, id),
            eq(mealVouchers.status, 'unused') // Double-check in update
          ))
          .returning();
        
        if (!redeemed) {
          throw new Error('Failed to redeem voucher - may have been used by another request');
        }
        
        return redeemed;
      });
    } catch (error) {
      console.error('Meal voucher redemption error:', error);
      return null;
    }
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
    // CRITICAL: Never hard delete - use soft delete only
    await db
      .update(guests)
      .set({ deletedAt: new Date() })
      .where(eq(guests.id, id));
    
    // Do NOT use: await db.delete(guests).where(eq(guests.id, id));
  }

  async restoreGuest(id: string, hotelId: string): Promise<Guest> {
    const [guest] = await db
      .update(guests)
      .set({ deletedAt: null, updatedAt: new Date() })
      .where(and(
        eq(guests.id, id),
        eq(guests.hotelId, hotelId)
      ))
      .returning();
    
    if (!guest) {
      throw new Error('Guest not found or does not belong to this hotel');
    }
    
    return guest;
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

  // Stock request operations
  async getStockRequestsByHotel(hotelId: string): Promise<StockRequest[]> {
    return await db
      .select()
      .from(stockRequests)
      .where(eq(stockRequests.hotelId, hotelId))
      .orderBy(desc(stockRequests.createdAt));
  }

  async getStockRequestsByUser(userId: string): Promise<StockRequest[]> {
    return await db
      .select()
      .from(stockRequests)
      .where(eq(stockRequests.requestedBy, userId))
      .orderBy(desc(stockRequests.createdAt));
  }

  async getPendingStockRequestsForStorekeeper(hotelId: string): Promise<StockRequest[]> {
    return await db
      .select()
      .from(stockRequests)
      .where(and(
        eq(stockRequests.hotelId, hotelId),
        sql`${stockRequests.status} IN ('pending', 'approved')`
      ))
      .orderBy(asc(stockRequests.createdAt));
  }

  async getStockRequestsByDepartment(hotelId: string, department: string): Promise<StockRequest[]> {
    return await db
      .select()
      .from(stockRequests)
      .where(and(
        eq(stockRequests.hotelId, hotelId),
        eq(stockRequests.department, department)
      ))
      .orderBy(desc(stockRequests.createdAt));
  }

  async getStockRequest(id: string): Promise<StockRequest | undefined> {
    const [request] = await db
      .select()
      .from(stockRequests)
      .where(eq(stockRequests.id, id));
    return request || undefined;
  }

  async createStockRequest(requestData: InsertStockRequest): Promise<StockRequest> {
    const [request] = await db
      .insert(stockRequests)
      .values(requestData)
      .returning();
    return request;
  }

  async updateStockRequest(id: string, requestData: Partial<StockRequest>): Promise<StockRequest> {
    const [request] = await db
      .update(stockRequests)
      .set({ ...requestData, updatedAt: new Date() })
      .where(eq(stockRequests.id, id))
      .returning();
    return request;
  }

  async approveStockRequest(id: string, approvedBy: string): Promise<StockRequest> {
    const [request] = await db
      .update(stockRequests)
      .set({ 
        status: 'approved',
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(stockRequests.id, id))
      .returning();
    return request;
  }

  async deliverStockRequest(id: string, deliveredBy: string): Promise<StockRequest> {
    const request = await this.getStockRequest(id);
    if (!request) {
      throw new Error('Stock request not found');
    }

    const inventoryItem = await db.query.inventoryItems.findFirst({
      where: (inventoryItemsTable, { eq }) => eq(inventoryItemsTable.id, request.itemId)
    });

    if (!inventoryItem) {
      throw new Error('Inventory item not found');
    }

    let quantityInBaseUnit = Number(request.quantity);
    
    if (request.unit && request.unit !== inventoryItem.baseUnit) {
      const { convertToBase } = await import('@shared/measurements');
      const category = (inventoryItem.measurementCategory || 'weight') as any;
      const conversionProfile = inventoryItem.conversionProfile as any;
      
      try {
        quantityInBaseUnit = convertToBase(
          Number(request.quantity),
          request.unit as any,
          (inventoryItem.baseUnit || 'kg') as any,
          category,
          conversionProfile
        );
      } catch (error) {
        console.error(`Unit conversion error for ${inventoryItem.name}:`, error);
      }
    }

    const currentStock = Number(inventoryItem.baseStockQty || inventoryItem.stockQty || 0);
    const newQuantity = currentStock - quantityInBaseUnit;

    await db
      .update(inventoryItems)
      .set({ 
        baseStockQty: String(newQuantity),
        stockQty: String(newQuantity),
        updatedAt: new Date()
      })
      .where(eq(inventoryItems.id, request.itemId));

    await this.createInventoryTransaction({
      hotelId: request.hotelId,
      itemId: request.itemId,
      transactionType: 'issue',
      qtyBase: String(quantityInBaseUnit),
      qtyPackage: request.unit === inventoryItem.packageUnit ? request.quantity : null,
      issuedToUserId: request.requestedBy,
      department: request.department,
      notes: `Stock request delivered - ${request.notes || ''}`,
      recordedBy: deliveredBy
    });

    const [updatedRequest] = await db
      .update(stockRequests)
      .set({ 
        status: 'delivered',
        deliveredAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(stockRequests.id, id))
      .returning();

    return updatedRequest;
  }

  // Hall booking operations
  async getHallBookingsByHotel(hotelId: string): Promise<SelectHallBooking[]> {
    return await db
      .select()
      .from(hallBookings)
      .where(eq(hallBookings.hotelId, hotelId))
      .orderBy(desc(hallBookings.bookingStartTime));
  }

  async getHallBookingsByHall(hallId: string): Promise<SelectHallBooking[]> {
    return await db
      .select()
      .from(hallBookings)
      .where(eq(hallBookings.hallId, hallId))
      .orderBy(desc(hallBookings.bookingStartTime));
  }

  async getHallBooking(id: string): Promise<SelectHallBooking | undefined> {
    const [booking] = await db
      .select()
      .from(hallBookings)
      .where(eq(hallBookings.id, id));
    return booking || undefined;
  }

  async createHallBooking(bookingData: InsertHallBooking): Promise<SelectHallBooking> {
    // CRITICAL: Use database transaction with row locking to prevent double booking
    return await db.transaction(async (tx) => {
      const { hallId, bookingStartTime, bookingEndTime } = bookingData;
      
      // Lock the hall for update
      const [hall] = await tx
        .select()
        .from(halls)
        .where(eq(halls.id, hallId))
        .for('update'); // PostgreSQL row lock
      
      if (!hall) {
        throw new Error('Hall not found');
      }
      
      // Check for existing bookings with time overlap
      const overlapping = await tx
        .select()
        .from(hallBookings)
        .where(
          and(
            eq(hallBookings.hallId, hallId),
            or(
              eq(hallBookings.status, 'confirmed'),
              eq(hallBookings.status, 'pending'),
              eq(hallBookings.status, 'quotation')
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
        )
        .limit(1);
      
      if (overlapping.length > 0) {
        throw new Error('Hall is already booked for the selected time period');
      }
      
      // Create booking
      const [booking] = await tx
        .insert(hallBookings)
        .values(bookingData)
        .returning();
      
      return booking;
    });
  }

  async updateHallBooking(id: string, bookingData: Partial<InsertHallBooking>): Promise<SelectHallBooking> {
    const [booking] = await db
      .update(hallBookings)
      .set({ ...bookingData, updatedAt: new Date() })
      .where(eq(hallBookings.id, id))
      .returning();
    return booking;
  }

  async confirmHallBooking(id: string, confirmedBy: string): Promise<SelectHallBooking> {
    const [booking] = await db
      .update(hallBookings)
      .set({ 
        status: 'confirmed',
        confirmedBy,
        confirmedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(hallBookings.id, id))
      .returning();
    return booking;
  }

  async cancelHallBooking(id: string, cancelledBy: string, reason: string): Promise<SelectHallBooking> {
    const [booking] = await db
      .update(hallBookings)
      .set({ 
        status: 'cancelled',
        cancelledBy,
        cancellationReason: reason,
        cancelledAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(hallBookings.id, id))
      .returning();
    return booking;
  }

  async checkHallAvailability(
    hallId: string, 
    startTime: Date, 
    endTime: Date, 
    excludeBookingId?: string
  ): Promise<boolean> {
    const conditions = [
      eq(hallBookings.hallId, hallId),
      sql`${hallBookings.status} IN ('deposit_pending', 'confirmed', 'in_progress', 'completed')`,
      sql`${hallBookings.bookingStartTime} < ${endTime.toISOString()}`,
      sql`${hallBookings.bookingEndTime} > ${startTime.toISOString()}`
    ];

    if (excludeBookingId) {
      conditions.push(sql`${hallBookings.id} != ${excludeBookingId}`);
    }

    const conflicts = await db
      .select()
      .from(hallBookings)
      .where(and(...conditions));
    
    return conflicts.length === 0;
  }

  async createBookingPayment(paymentData: any): Promise<any> {
    const [payment] = await db
      .insert(bookingPayments)
      .values(paymentData)
      .returning();
    return payment;
  }

  async getRestaurantBillsByHotel(hotelId: string, filters?: { startDate?: Date; endDate?: Date; status?: string }): Promise<any[]> {
    const conditions = [eq(restaurantBills.hotelId, hotelId)];
    
    if (filters?.startDate) {
      conditions.push(sql`${restaurantBills.createdAt} >= ${filters.startDate.toISOString()}`);
    }
    if (filters?.endDate) {
      conditions.push(sql`${restaurantBills.createdAt} <= ${filters.endDate.toISOString()}`);
    }
    if (filters?.status) {
      conditions.push(eq(restaurantBills.status, filters.status));
    }
    
    return await db
      .select()
      .from(restaurantBills)
      .where(and(...conditions))
      .orderBy(desc(restaurantBills.createdAt));
  }

  async getRestaurantBill(id: string): Promise<any | undefined> {
    const [bill] = await db
      .select()
      .from(restaurantBills)
      .where(eq(restaurantBills.id, id));
    return bill || undefined;
  }

  async createRestaurantBill(billData: any): Promise<any> {
    const [bill] = await db
      .insert(restaurantBills)
      .values(billData)
      .returning();
    return bill;
  }

  async updateRestaurantBill(id: string, billData: Partial<any>): Promise<any> {
    const [bill] = await db
      .update(restaurantBills)
      .set(billData)
      .where(eq(restaurantBills.id, id))
      .returning();
    return bill;
  }

  async getBillPayments(billId: string): Promise<any[]> {
    return await db
      .select()
      .from(billPayments)
      .where(eq(billPayments.billId, billId))
      .orderBy(asc(billPayments.createdAt));
  }

  async createBillPayment(paymentData: any): Promise<any> {
    const [payment] = await db
      .insert(billPayments)
      .values(paymentData)
      .returning();
    return payment;
  }

  async getBillPayment(paymentId: string): Promise<any | undefined> {
    const [payment] = await db
      .select()
      .from(billPayments)
      .where(eq(billPayments.id, paymentId));
    return payment || undefined;
  }

  async voidBillPayment(paymentId: string, voidedBy: string, reason: string): Promise<any> {
    const [voided] = await db
      .update(billPayments)
      .set({
        isVoided: true,
        voidedBy,
        voidedAt: new Date(),
        voidReason: reason
      })
      .where(eq(billPayments.id, paymentId))
      .returning();
    return voided;
  }

  async createAttendance(userId: string, hotelId: string, clockInTime: Date, location: string | null, ip: string | null, source: string | null): Promise<Attendance> {
    const [record] = await db
      .insert(attendance)
      .values({
        userId,
        hotelId,
        clockInTime,
        clockInLocation: location,
        clockInIp: ip,
        clockInSource: source,
        status: 'active'
      })
      .returning();
    return record;
  }

  async getActiveAttendance(userId: string): Promise<Attendance | null> {
    const [record] = await db
      .select()
      .from(attendance)
      .where(and(
        eq(attendance.userId, userId),
        eq(attendance.status, 'active')
      ))
      .orderBy(desc(attendance.clockInTime))
      .limit(1);
    return record || null;
  }

  async clockOut(attendanceId: string, clockOutTime: Date, location: string | null, ip: string | null, source: string | null): Promise<Attendance> {
    const [record] = await db
      .select()
      .from(attendance)
      .where(eq(attendance.id, attendanceId));

    if (!record) {
      throw new Error('Attendance record not found');
    }

    const clockInTime = new Date(record.clockInTime);
    const totalHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

    const [updated] = await db
      .update(attendance)
      .set({
        clockOutTime,
        clockOutLocation: location,
        clockOutIp: ip,
        clockOutSource: source,
        totalHours: totalHours.toFixed(2),
        status: 'completed',
        updatedAt: new Date()
      })
      .where(eq(attendance.id, attendanceId))
      .returning();
    
    return updated;
  }

  async getAttendanceByUser(userId: string, startDate?: Date, endDate?: Date): Promise<Attendance[]> {
    const conditions = [eq(attendance.userId, userId)];
    
    if (startDate) {
      conditions.push(gte(attendance.clockInTime, startDate));
    }
    if (endDate) {
      conditions.push(lte(attendance.clockInTime, endDate));
    }

    return await db
      .select()
      .from(attendance)
      .where(and(...conditions))
      .orderBy(desc(attendance.clockInTime));
  }

  async getAttendanceByHotel(hotelId: string, date: Date): Promise<Attendance[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select()
      .from(attendance)
      .where(and(
        eq(attendance.hotelId, hotelId),
        or(
          and(
            gte(attendance.clockInTime, startOfDay),
            lte(attendance.clockInTime, endOfDay)
          ),
          eq(attendance.status, 'active')
        )
      ))
      .orderBy(desc(attendance.clockInTime));
  }

  async getAllAttendanceByHotel(hotelId: string, startDate?: Date, endDate?: Date): Promise<Attendance[]> {
    const conditions = [eq(attendance.hotelId, hotelId)];
    
    if (startDate) {
      conditions.push(gte(attendance.clockInTime, startDate));
    }
    if (endDate) {
      conditions.push(lte(attendance.clockInTime, endDate));
    }

    return await db
      .select()
      .from(attendance)
      .where(and(...conditions))
      .orderBy(desc(attendance.clockInTime));
  }

  async canClockIn(userId: string): Promise<{ canClockIn: boolean; reason?: string }> {
    const user = await this.getUser(userId);
    
    if (!user) {
      return { canClockIn: false, reason: 'User not found' };
    }

    if (!user.isActive) {
      return { canClockIn: false, reason: 'User is not active' };
    }

    const activeAttendance = await this.getActiveAttendance(userId);
    
    if (activeAttendance) {
      return { canClockIn: false, reason: 'Already clocked in' };
    }

    const lastAttendance = await db
      .select()
      .from(attendance)
      .where(eq(attendance.userId, userId))
      .orderBy(desc(attendance.clockInTime))
      .limit(1);

    if (lastAttendance.length > 0 && lastAttendance[0].clockOutTime) {
      const lastClockOut = new Date(lastAttendance[0].clockOutTime);
      const now = new Date();
      const minutesSinceLastClockOut = (now.getTime() - lastClockOut.getTime()) / (1000 * 60);
      
      if (minutesSinceLastClockOut < 1) {
        return { canClockIn: false, reason: 'Must wait at least 1 minute after clocking out' };
      }
    }

    return { canClockIn: true };
  }

  async createAuditLog(log: { hotelId: string; resourceType: string; resourceId: string; action: string; userId: string; details: any }): Promise<any> {
    const [auditLog] = await db
      .insert(auditLogs)
      .values({
        hotelId: log.hotelId,
        resourceType: log.resourceType,
        resourceId: log.resourceId,
        action: log.action,
        userId: log.userId,
        details: log.details,
        success: true
      })
      .returning();
    
    return auditLog;
  }

  async createPriceChangeLog(log: { hotelId: string; itemId: string; itemType: string; itemName: string; previousPrice: string | number; newPrice: string | number; changedBy: string }): Promise<any> {
    const [priceChangeLog] = await db
      .insert(priceChangeLogs)
      .values({
        hotelId: log.hotelId,
        itemId: log.itemId,
        itemType: log.itemType,
        itemName: log.itemName,
        previousPrice: String(log.previousPrice),
        newPrice: String(log.newPrice),
        changedBy: log.changedBy
      })
      .returning();
    
    return priceChangeLog;
  }
}

export const storage = new DatabaseStorage();
