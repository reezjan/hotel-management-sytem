import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireActiveUser } from "./auth";
import { logAudit } from "./audit";
import { db } from "./db";
import { wsEvents } from "./websocket";
import { users, roles, auditLogs, maintenanceStatusHistory, priceChangeLogs, taxChangeLogs, roomStatusLogs, inventoryTransactions, inventoryItems, transactions, vendors } from "@shared/schema";
import { eq, and, isNull, asc, desc, sql, ne } from "drizzle-orm";
import { sanitizeObject } from "./sanitize";
import {
  insertUserSchema,
  insertHotelSchema,
  insertRoomSchema,
  insertMenuItemSchema,
  insertTaskSchema,
  insertTransactionSchema,
  insertMaintenanceRequestSchema,
  insertVoucherSchema,
  insertVendorSchema,
  insertRoomTypeSchema,
  insertHallSchema,
  insertPoolSchema,
  insertServiceSchema,
  insertLeaveRequestSchema,
  insertLeavePolicySchema,
  insertWastageSchema,
  insertVehicleLogSchema,
  updateKotItemSchema,
  insertMealPlanSchema,
  insertGuestSchema,
  insertStockRequestSchema,
  insertHallBookingSchema,
  insertServicePackageSchema,
  insertBookingPaymentSchema,
  insertRoomReservationSchema,
  insertRoomServiceChargeSchema,
  vouchers,
  guests,
  hallBookings,
  halls,
  servicePackages,
  bookingPayments,
  roomServiceCharges
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Hotel routes
  app.get("/api/hotels", async (req, res) => {
    try {
      const hotels = await storage.getAllHotels();
      res.json(hotels);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hotels" });
    }
  });

  app.post("/api/hotels", async (req, res) => {
    try {
      const { ownerId, ...hotelFields } = req.body;
      const hotelData = insertHotelSchema.parse(hotelFields);
      const hotel = await storage.createHotel(hotelData);
      
      // If this request includes an ownerId, update that user with the hotelId
      if (ownerId) {
        await storage.updateUser(ownerId, { hotelId: hotel.id });
        
        // If the current user is the owner, refresh their session data
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

  app.put("/api/hotels/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const hotelData = insertHotelSchema.partial().parse(req.body);
      const hotel = await storage.updateHotel(id, hotelData);
      res.json(hotel);
    } catch (error) {
      res.status(400).json({ message: "Failed to update hotel" });
    }
  });

  app.patch("/api/hotels/:id/activate", async (req, res) => {
    try {
      const { id } = req.params;
      const hotel = await storage.updateHotel(id, { isActive: true });
      res.json(hotel);
    } catch (error) {
      res.status(400).json({ message: "Failed to activate hotel" });
    }
  });

  app.patch("/api/hotels/:id/deactivate", async (req, res) => {
    try {
      const { id } = req.params;
      const hotel = await storage.updateHotel(id, { isActive: false });
      res.json(hotel);
    } catch (error) {
      res.status(400).json({ message: "Failed to deactivate hotel" });
    }
  });

  app.delete("/api/hotels/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteHotel(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete hotel" });
    }
  });

  // Current hotel endpoints (uses authenticated user's hotel) - MUST be before parameterized routes
  app.get("/api/hotels/current", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const hotel = await storage.getHotel(user.hotelId);
      res.json(hotel);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch current hotel" });
    }
  });

  app.get("/api/hotels/current/users", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const users = await storage.getUsersByHotel(user.hotelId);
      const sanitizedUsers = users.map(user => {
        const { passwordHash: _, ...sanitizedUser } = user;
        return sanitizedUser;
      });
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/hotels/current/rooms", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const rooms = await storage.getRoomsByHotel(user.hotelId);
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });

  app.get("/api/hotels/current/transactions", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      const { startDate, endDate } = req.query;
      let transactions = await storage.getTransactionsByHotel(user.hotelId);
      
      // Apply date filtering if provided
      if (startDate && typeof startDate === 'string') {
        const start = new Date(startDate);
        transactions = transactions.filter((t: any) => new Date(t.createdAt) >= start);
      }
      if (endDate && typeof endDate === 'string') {
        const end = new Date(endDate);
        transactions = transactions.filter((t: any) => new Date(t.createdAt) <= end);
      }
      
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/hotels/current/vendors", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const vendors = await storage.getVendorsByHotel(user.hotelId);
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  app.post("/api/hotels/current/vendors", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      // CRITICAL VALIDATION: Validate vendor data
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

  app.put("/api/hotels/current/vendors/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
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

  app.delete("/api/hotels/current/vendors/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
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

  // Guest routes
  app.get("/api/hotels/current/guests", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const guests = await storage.getGuestsByHotel(user.hotelId);
      res.json(guests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guests" });
    }
  });

  app.get("/api/hotels/current/guests/search", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const searchTerm = req.query.q as string;
      if (!searchTerm) {
        return res.status(400).json({ message: "Search term required" });
      }
      const guests = await storage.searchGuests(user.hotelId, searchTerm);
      res.json(guests);
    } catch (error) {
      res.status(500).json({ message: "Failed to search guests" });
    }
  });

  app.get("/api/hotels/current/guests/:id", async (req, res) => {
    try {
      const user = req.user as any;
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

  app.post("/api/hotels/current/guests", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const bodyData = {
        ...req.body,
        hotelId: user.hotelId,
        createdBy: user.id
      };
      
      // Convert dateOfBirth string to Date if provided
      if (bodyData.dateOfBirth && typeof bodyData.dateOfBirth === 'string') {
        bodyData.dateOfBirth = new Date(bodyData.dateOfBirth);
      }
      
      const guestData = insertGuestSchema.parse(bodyData);
      const guest = await storage.createGuest(guestData);
      
      // Broadcast guest creation to relevant users
      wsEvents.guestCreated(user.hotelId, guest);
      
      res.status(201).json(guest);
    } catch (error) {
      console.error("Guest creation error:", error);
      res.status(400).json({ message: "Invalid guest data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.put("/api/hotels/current/guests/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const bodyData = { ...req.body };
      
      // Convert dateOfBirth string to Date if provided
      if (bodyData.dateOfBirth && typeof bodyData.dateOfBirth === 'string') {
        bodyData.dateOfBirth = new Date(bodyData.dateOfBirth);
      }
      
      const guestData = insertGuestSchema.partial().parse(bodyData);
      const guest = await storage.updateGuest(id, guestData);
      
      // Broadcast guest update to relevant users
      wsEvents.guestUpdated(user.hotelId, guest);
      
      res.json(guest);
    } catch (error) {
      console.error("Guest update error:", error);
      res.status(400).json({ message: "Failed to update guest" });
    }
  });

  app.delete("/api/hotels/current/guests/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
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

  app.post("/api/hotels/current/guests/:id/restore", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const currentUser = req.user as any;
      const { id } = req.params;
      
      if (!currentUser?.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      // CRITICAL: Only managers can restore deleted guests
      const canRestore = ['manager', 'owner', 'super_admin'].includes(currentUser.role?.name || '');
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

  app.get("/api/hotels/current/vouchers", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const vouchers = await storage.getVouchersByHotel(user.hotelId);
      res.json(vouchers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vouchers" });
    }
  });

  app.get("/api/hotels/current/inventory-items", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      let items = await storage.getInventoryItemsByHotel(user.hotelId);
      
      // Filter items by department for restaurant_bar_manager
      const userRole = user.role?.name || '';
      if (userRole === 'restaurant_bar_manager') {
        // Restaurant bar manager can see items for kitchen, bar, and barista departments
        const allowedDepartments = ['kitchen', 'bar', 'barista'];
        items = items.filter((item: any) => {
          if (!item.departments || item.departments.length === 0) return true; // Show items with no department restriction
          return item.departments.some((dept: string) => allowedDepartments.includes(dept.toLowerCase()));
        });
      }
      
      res.json(items);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      res.status(500).json({ message: "Failed to fetch inventory items" });
    }
  });

  app.get("/api/hotels/current/low-stock-items", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const items = await storage.getLowStockItems(user.hotelId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch low stock items" });
    }
  });

  app.get("/api/hotels/current/inventory/consumptions", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const consumptions = await storage.getInventoryConsumptionsByHotel(user.hotelId);
      res.json(consumptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory consumptions" });
    }
  });

  app.get("/api/hotels/current/inventory-consumptions", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const consumptions = await storage.getInventoryConsumptionsByHotel(user.hotelId);
      res.json(consumptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory consumptions" });
    }
  });

  // Restaurant functionality for current hotel
  app.get("/api/hotels/current/menu-items", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const menuItems = await storage.getMenuItemsByHotel(user.hotelId);
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.get("/api/hotels/current/restaurant-tables", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const tables = await storage.getRestaurantTablesByHotel(user.hotelId);
      res.json(tables);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch restaurant tables" });
    }
  });

  app.get("/api/hotels/current/kot-orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const kotOrders = await storage.getKotOrdersByHotel(user.hotelId);
      res.json(kotOrders);
    } catch (error) {
      console.error("Error fetching KOT orders:", error);
      res.status(500).json({ message: "Failed to fetch KOT orders" });
    }
  });

  app.get("/api/hotels/current/menu-categories", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const categories = await storage.getMenuCategoriesByHotel(user.hotelId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu categories" });
    }
  });

  app.post("/api/hotels/current/menu-categories", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { name } = req.body;
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: "Category name is required" });
      }
      
      // CRITICAL SECURITY: Prevent XSS by rejecting HTML tags
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

  app.put("/api/hotels/current/menu-categories/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const { name } = req.body;
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: "Category name is required" });
      }
      
      // CRITICAL SECURITY: Prevent XSS by rejecting HTML tags
      const htmlTagPattern = /<[^>]*>/g;
      if (htmlTagPattern.test(name)) {
        return res.status(400).json({ message: "Category name cannot contain HTML tags" });
      }
      
      // Verify category belongs to user's hotel
      const categories = await storage.getMenuCategoriesByHotel(user.hotelId);
      const existingCategory = categories.find(cat => cat.id === id);
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

  app.delete("/api/hotels/current/menu-categories/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      
      // Verify category belongs to user's hotel
      const categories = await storage.getMenuCategoriesByHotel(user.hotelId);
      const existingCategory = categories.find(cat => cat.id === id);
      if (!existingCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      await storage.deleteMenuCategory(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete menu category" });
    }
  });

  // Hotel-scoped restaurant endpoints for current user's hotel
  app.post("/api/hotels/current/menu-items", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      // Sanitize input to prevent XSS
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

  app.put("/api/hotels/current/menu-items/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const itemData = insertMenuItemSchema.partial().parse(req.body);
      
      // Verify the menu item belongs to current hotel
      const existingItem = await storage.getMenuItem(id);
      if (!existingItem || existingItem.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      // CRITICAL: Price changes require manager approval
      if ('price' in itemData && itemData.price !== undefined && String(itemData.price) !== String(existingItem.price)) {
        const canChangePrice = ['manager', 'owner', 'restaurant_bar_manager', 'super_admin'].includes(user.role?.name || '');
        
        if (!canChangePrice) {
          return res.status(403).json({ 
            message: "Only managers can change menu item prices" 
          });
        }
        
        // Log price change for audit trail
        await storage.createPriceChangeLog({
          hotelId: user.hotelId,
          itemId: id,
          itemType: 'menu_item',
          itemName: existingItem.name || 'Unknown Item',
          previousPrice: existingItem.price || '0',
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

  app.delete("/api/hotels/current/menu-items/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      // Verify the menu item belongs to current hotel
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

  app.post("/api/hotels/current/restaurant-tables", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      // CRITICAL VALIDATION: Validate table data
      const { name, capacity, status } = req.body;
      
      // Validate name is required and non-empty
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: "Table name is required" });
      }
      
      // Validate capacity is a positive integer
      const capacityNum = Number(capacity);
      if (!Number.isInteger(capacityNum) || capacityNum <= 0) {
        return res.status(400).json({ message: "Capacity must be a positive integer" });
      }
      
      // Validate status is one of the allowed values
      const validStatuses = ['available', 'occupied', 'reserved'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ 
          message: `Status must be one of: ${validStatuses.join(', ')}` 
        });
      }
      
      const tableData = {
        ...req.body,
        hotelId: user.hotelId,
        status: status || 'available' // Default to available if not provided
      };
      const table = await storage.createRestaurantTable(tableData);
      res.status(201).json(table);
    } catch (error) {
      res.status(400).json({ message: "Failed to create table" });
    }
  });

  app.put("/api/hotels/current/restaurant-tables/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const { name, capacity, status } = req.body;
      
      // Verify the table belongs to current hotel
      const existingTable = await storage.getRestaurantTable(id);
      if (!existingTable || existingTable.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Table not found" });
      }
      
      // CRITICAL VALIDATION: Validate update data
      // Validate name if provided
      if (name !== undefined && (!name || name.trim().length === 0)) {
        return res.status(400).json({ message: "Table name cannot be empty" });
      }
      
      // Validate capacity if provided
      if (capacity !== undefined) {
        const capacityNum = Number(capacity);
        if (!Number.isInteger(capacityNum) || capacityNum <= 0) {
          return res.status(400).json({ message: "Capacity must be a positive integer" });
        }
      }
      
      // Validate status if provided
      if (status !== undefined) {
        const validStatuses = ['available', 'occupied', 'reserved'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ 
            message: `Status must be one of: ${validStatuses.join(', ')}` 
          });
        }
      }
      
      const table = await storage.updateRestaurantTable(id, req.body);
      res.json(table);
    } catch (error) {
      res.status(400).json({ message: "Failed to update table" });
    }
  });

  app.delete("/api/hotels/current/restaurant-tables/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      // Verify the table belongs to current hotel
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

  app.get("/api/hotels/current/tasks", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const tasks = await storage.getTasksByHotel(user.hotelId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/hotels/current/tasks", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const taskData = insertTaskSchema.parse({
        ...req.body,
        hotelId: user.hotelId,
        createdBy: user.id,
        assignedTo: req.body.assignedTo || req.body.assignedToId // Handle both field names for compatibility
      });
      const task = await storage.createTask(taskData);
      
      // Broadcast real-time update
      wsEvents.taskCreated(user.hotelId, task);
      
      res.status(201).json(task);
    } catch (error) {
      console.error("Task creation error:", error);
      if (error && typeof error === 'object' && 'errors' in error) {
        // Zod validation errors
        res.status(400).json({ 
          message: "Invalid task data", 
          errors: (error.errors as any[]).map((e: any) => `${e.path.join('.')}: ${e.message}`)
        });
      } else {
        res.status(400).json({ message: (error as any)?.message || "Invalid task data" });
      }
    }
  });

  app.put("/api/hotels/current/tasks/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const user = req.user as any;
      const { id } = req.params;
      const taskData = req.body;
      
      const existingTask = await storage.getTask(id);
      if (!existingTask || existingTask.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      const isManager = ['manager', 'owner', 'security_head', 'housekeeping_supervisor'].includes(user.role?.name || '');
      const isAssignedUser = existingTask.assignedTo === user.id;
      
      let updateData: any = {};
      
      if (isAssignedUser && !isManager) {
        // CRITICAL: Non-managers can only update status to 'in_progress' or 'pending_review'
        if (taskData.status === 'completed') {
          // Change status to 'pending_review' instead
          updateData = { 
            status: 'pending_review',
            completionNotes: taskData.completionNotes || taskData.notes,
            updatedAt: new Date()
          };
        } else if (taskData.status === 'in_progress') {
          updateData = { status: 'in_progress', updatedAt: new Date() };
        } else {
          return res.status(403).json({ 
            message: "You can only mark tasks as in progress. Completion requires manager approval." 
          });
        }
      } else if (isManager) {
        // Managers can update anything
        updateData = taskData;
        
        // If manager is approving completion
        if (taskData.status === 'completed' && existingTask.status === 'pending_review') {
          updateData.approvedBy = user.id;
          updateData.approvedAt = new Date();
        }
      } else {
        return res.status(403).json({ 
          message: "You can only update tasks assigned to you" 
        });
      }
      
      const task = await storage.updateTask(id, updateData);
      
      // Broadcast real-time update
      wsEvents.taskUpdated(user.hotelId, task);
      
      res.json(task);
    } catch (error) {
      console.error("Task update error:", error);
      res.status(400).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/hotels/current/tasks/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      // Verify the task belongs to current hotel
      const existingTask = await storage.getTask(id);
      if (!existingTask || existingTask.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Task not found" });
      }
      await storage.deleteTask(id);
      
      // Broadcast real-time update
      wsEvents.taskDeleted(user.hotelId, id);
      
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete task" });
    }
  });

  app.get("/api/hotels/current/room-cleaning-queue", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
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

  app.patch("/api/room-cleaning-queue/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { id } = req.params;
      const { status, taskId } = req.body;
      const updateData: any = {};
      if (status) updateData.status = status;
      if (taskId !== undefined) updateData.taskId = taskId;
      
      const queue = await storage.updateRoomCleaningQueue(id, updateData);
      res.json(queue);
    } catch (error) {
      console.error("Room cleaning queue update error:", error);
      res.status(400).json({ message: "Failed to update room cleaning queue" });
    }
  });

  app.get("/api/hotels/current/maintenance-requests", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const requests = await storage.getMaintenanceRequestsByHotel(user.hotelId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch maintenance requests" });
    }
  });

  app.post("/api/hotels/current/maintenance-requests", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      // Auto-assign maintenance requests based on reporter role
      let assignedTo = req.body.assignedTo;
      const userRole = user.role?.name || '';
      const rolesAssignedToSecurityHead = ['waiter', 'kitchen_staff', 'bartender', 'barista', 'security_guard', 'surveillance_officer'];
      const rolesAssignedToManager = ['front_desk', 'storekeeper'];
      const rolesAssignedToHousekeepingSupervisor = ['housekeeping_staff'];
      
      if (rolesAssignedToSecurityHead.includes(userRole)) {
        // Find security head for this hotel
        const securityHeadRole = await storage.getRoleByName('security_head');
        if (securityHeadRole) {
          const users = await storage.getUsersByHotel(user.hotelId);
          const securityHead = users.find((u: any) => u.roleId === securityHeadRole.id && u.isActive);
          if (securityHead) {
            assignedTo = securityHead.id;
          }
        }
      } else if (rolesAssignedToManager.includes(userRole)) {
        // Find manager for this hotel
        const managerRole = await storage.getRoleByName('manager');
        if (managerRole) {
          const users = await storage.getUsersByHotel(user.hotelId);
          const manager = users.find((u: any) => u.roleId === managerRole.id && u.isActive);
          if (manager) {
            assignedTo = manager.id;
          }
        }
      } else if (rolesAssignedToHousekeepingSupervisor.includes(userRole)) {
        // Find housekeeping supervisor for this hotel
        const housekeepingSupervisorRole = await storage.getRoleByName('housekeeping_supervisor');
        if (housekeepingSupervisorRole) {
          const users = await storage.getUsersByHotel(user.hotelId);
          const housekeepingSupervisor = users.find((u: any) => u.roleId === housekeepingSupervisorRole.id && u.isActive);
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
    } catch (error: any) {
      console.error('Maintenance request creation error:', error);
      if (error.name === 'ZodError') {
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

  app.put("/api/hotels/current/maintenance-requests/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const currentUser = req.user as any;
      if (!currentUser || !currentUser.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const updateData = req.body;
      
      // Verify the maintenance request belongs to current hotel
      const existingRequest = await storage.getMaintenanceRequest(id);
      if (!existingRequest || existingRequest.hotelId !== currentUser.hotelId) {
        return res.status(404).json({ message: "Maintenance request not found" });
      }
      
      // CRITICAL: Reassignment requires supervisor approval
      if ('assignedTo' in updateData && updateData.assignedTo !== existingRequest.assignedTo) {
        const canReassign = ['manager', 'owner', 'security_head', 'housekeeping_supervisor', 'restaurant_bar_manager'].includes(currentUser.role?.name || '');
        
        if (!canReassign) {
          return res.status(403).json({ 
            message: "Only supervisors can reassign maintenance requests" 
          });
        }
        
        // Log reassignment for audit
        await storage.createAuditLog({
          hotelId: currentUser.hotelId,
          resourceType: 'maintenance_request',
          resourceId: id,
          action: 'reassigned',
          userId: currentUser.id,
          details: {
            previousAssignee: existingRequest.assignedTo,
            newAssignee: updateData.assignedTo,
            timestamp: new Date()
          }
        });
      }
      
      // Verify assigned user can update their own requests
      const isAssigned = existingRequest.assignedTo === currentUser.id;
      const isSupervisor = ['manager', 'owner', 'security_head', 'housekeeping_supervisor', 'restaurant_bar_manager'].includes(currentUser.role?.name || '');
      
      if (!isAssigned && !isSupervisor) {
        return res.status(403).json({ 
          message: "You can only update requests assigned to you" 
        });
      }
      
      // Automatically set timestamps based on status changes
      if (updateData.status === 'resolved' && !updateData.resolvedAt) {
        updateData.resolvedAt = new Date();
      }
      if (updateData.status === 'approved' && !updateData.approvedAt) {
        updateData.approvedAt = new Date();
        updateData.approvedBy = currentUser.id;
      }
      if (updateData.status === 'declined' && !updateData.declinedAt) {
        updateData.declinedAt = new Date();
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

  // Hotel-scoped user management endpoints
  app.post("/api/hotels/current/users", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const currentUser = req.user as any;
      if (!currentUser?.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      // CRITICAL: Define role hierarchy and creation permissions
      const rolePermissions: Record<string, string[]> = {
        owner: ['manager', 'restaurant_bar_manager', 'storekeeper', 'front_desk', 
                'housekeeping_supervisor', 'security_head', 'waiter', 'kitchen_staff', 
                'housekeeping_staff', 'security_guard', 'cashier', 'finance', 'bartender', 'barista'],
        manager: ['waiter', 'kitchen_staff', 'housekeeping_staff', 'security_guard', 'cashier', 'front_desk'],
        restaurant_bar_manager: ['waiter', 'kitchen_staff', 'bartender', 'barista'],
        security_head: ['security_guard', 'surveillance_officer'],
        housekeeping_supervisor: ['housekeeping_staff'],
        // Other roles cannot create users
      };
      
      const currentRole = currentUser.role?.name || '';
      const allowedRoles = rolePermissions[currentRole] || [];
      
      if (allowedRoles.length === 0) {
        return res.status(403).json({ 
          message: "You don't have permission to create users" 
        });
      }
      
      // Handle role conversion and password hashing
      const { role, password, confirmPassword, ...userData } = req.body;
      
      // Get role ID from role name
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

      // CRITICAL: Verify current user can create this role
      if (!allowedRoles.includes(targetRoleName)) {
        return res.status(403).json({ 
          message: `You don't have permission to create users with role '${targetRoleName}'` 
        });
      }
      
      // Password validation
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
      
      // Check for duplicate username
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ 
          message: "Username already exists" 
        });
      }
      
      // Hash password
      const { hashPassword } = await import("./auth.js");
      const hashedPassword = await hashPassword(password);

      // Auto-assign hotel from current user
      const finalUserData = insertUserSchema.parse({
        ...userData,
        roleId,
        hotelId: currentUser.hotelId,
        passwordHash: hashedPassword,
        createdBy: currentUser.id,
        isActive: true
      });

      const user = await storage.createUser(finalUserData);
      
      // Return sanitized user
      const { passwordHash: _, ...sanitizedUser } = user;
      res.status(201).json(sanitizedUser);
    } catch (error) {
      console.error("User creation error:", error);
      res.status(400).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/hotels/current/users/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const currentUser = req.user as any;
      if (!currentUser?.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }

      const { id } = req.params;
      const userData = req.body;
      
      // CRITICAL SECURITY: Block password changes through this endpoint
      // Passwords can ONLY be changed via /api/reset-password with old password verification
      if ('passwordHash' in userData) {
        return res.status(403).json({ 
          message: "Cannot change passwords through this endpoint. Use the password reset functionality." 
        });
      }
      
      // Verify the user belongs to current hotel
      const existingUser = await storage.getUser(id);
      if (!existingUser || existingUser.hotelId !== currentUser.hotelId) {
        return res.status(404).json({ message: "User not found" });
      }

      // CRITICAL: Prevent users from updating their own protected fields
      if (currentUser.id === id) {
        // Users CANNOT update their own:
        const protectedFields = ['roleId', 'isActive', 'hotelId', 'createdBy', 'verification'];
        const attemptedProtectedUpdate = protectedFields.some(field => field in userData);
        
        if (attemptedProtectedUpdate) {
          return res.status(403).json({ 
            message: "Cannot modify your own role, status, or hotel assignment. Contact your manager." 
          });
        }
      }

      // CRITICAL: Verify permission to update other users
      if (currentUser.id !== id) {
        const currentRole = currentUser.role?.name || '';
        
        // Only managers, owners, and security_head can update other users
        const canUpdateUsers = ['owner', 'manager', 'security_head'].includes(currentRole);
        
        if (!canUpdateUsers) {
          return res.status(403).json({ 
            message: "You don't have permission to update other users" 
          });
        }
        
        // CRITICAL: Prevent updating protected fields without proper authorization
        if ('roleId' in userData || 'isActive' in userData) {
          // Only owner can change roles or activation status
          if (currentRole !== 'owner') {
            return res.status(403).json({ 
              message: "Only the hotel owner can change user roles or activation status" 
            });
          }
        }
      }

      const user = await storage.updateUser(id, userData);
      
      // Return sanitized user
      const { passwordHash: _, ...sanitizedUser } = user;
      res.json(sanitizedUser);
    } catch (error) {
      res.status(400).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/hotels/current/users/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const currentUser = req.user as any;
      if (!currentUser?.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }

      const { id } = req.params;
      
      // Verify the user belongs to current hotel
      const existingUser = await storage.getUser(id);
      if (!existingUser || existingUser.hotelId !== currentUser.hotelId) {
        return res.status(404).json({ message: "User not found" });
      }

      // CRITICAL: Prevent users from deleting themselves
      if (currentUser.id === id) {
        return res.status(403).json({ 
          message: "Cannot delete your own account. Contact your manager." 
        });
      }

      // CRITICAL: Only managers and owners can delete users
      const currentRole = currentUser.role?.name || '';
      const canDeleteUsers = ['owner', 'manager'].includes(currentRole);
      
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

  // Hotel-scoped inventory management endpoints
  app.post("/api/hotels/current/inventory-items", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      // CRITICAL VALIDATION: Validate inventory item data
      const { name, sku, unit, baseStockQty, costPerUnit } = req.body;
      
      // Validate required fields
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: "Item name is required" });
      }
      
      if (!sku || sku.trim().length === 0) {
        return res.status(400).json({ message: "SKU is required" });
      }
      
      if (!unit || unit.trim().length === 0) {
        return res.status(400).json({ message: "Unit is required" });
      }
      
      // Validate stock quantity is non-negative
      if (baseStockQty !== undefined && baseStockQty !== null) {
        const stockNum = Number(baseStockQty);
        if (!Number.isFinite(stockNum) || stockNum < 0) {
          return res.status(400).json({ message: "Stock quantity must be a non-negative number" });
        }
      }
      
      // Validate cost per unit is non-negative
      if (costPerUnit !== undefined && costPerUnit !== null) {
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

  app.put("/api/hotels/current/inventory-items/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const itemData = req.body;
      // Verify the inventory item belongs to current hotel
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

  app.delete("/api/hotels/current/inventory-items/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      // Verify the inventory item belongs to current hotel
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

  // Inventory transactions routes
  app.get("/api/hotels/current/inventory-transactions", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const transactions = await storage.getInventoryTransactionsByHotel(user.hotelId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory transactions" });
    }
  });

  app.post("/api/hotels/current/inventory-transactions", requireActiveUser, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      const transactionData = req.body;
      const transactionType = transactionData.transactionType;
      
      // CRITICAL: Validate transaction type
      const validTypes = ['receive', 'issue', 'return', 'adjustment', 'wastage'];
      if (!validTypes.includes(transactionType)) {
        return res.status(400).json({ message: "Invalid transaction type" });
      }
      
      // CRITICAL: Validate quantity is present and numeric
      const qtyBase = Number(transactionData.qtyBase);
      if (isNaN(qtyBase) || transactionData.qtyBase === null || transactionData.qtyBase === undefined) {
        return res.status(400).json({ message: "Valid quantity (qtyBase) is required" });
      }
      
      // CRITICAL: For non-adjustment types, quantity must be POSITIVE
      // (adjustment can be negative as it's a delta)
      if (transactionType !== 'adjustment') {
        if (qtyBase <= 0) {
          return res.status(400).json({ 
            message: `Quantity must be positive for ${transactionType} transactions` 
          });
        }
      } else {
        // For adjustment, prevent zero (pointless)
        if (qtyBase === 0) {
          return res.status(400).json({ 
            message: "Adjustment quantity cannot be zero" 
          });
        }
      }
      
      // CRITICAL: For 'receive' transactions, require purchase verification
      if (transactionType === 'receive') {
        // Only storekeeper or manager can receive inventory
        const canReceive = ['storekeeper', 'manager', 'owner', 'super_admin'].includes(user.role?.name || '');
        if (!canReceive) {
          return res.status(403).json({ 
            message: "Only storekeeper or manager can receive inventory" 
          });
        }
        
        // Require supplier reference or purchase order
        const supplierName = transactionData.supplierName?.trim();
        const referenceNumber = transactionData.referenceNumber?.trim();
        if ((!supplierName || supplierName.length === 0) && (!referenceNumber || referenceNumber.length === 0)) {
          return res.status(400).json({ 
            message: "Supplier name or purchase reference required for receiving inventory" 
          });
        }
      }
      
      // CRITICAL: For 'issue' or 'wastage', verify sufficient stock
      if (transactionType === 'issue' || transactionType === 'wastage') {
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
        
        // Wastage requires notes explaining the reason
        if (transactionType === 'wastage') {
          const notes = transactionData.notes?.trim();
          if (!notes || notes.length === 0) {
            return res.status(400).json({ 
              message: "Wastage requires detailed notes explaining the reason" 
            });
          }
        }
      }
      
      // CRITICAL: Large quantity adjustments require manager approval
      if (transactionType === 'adjustment') {
        const item = await storage.getInventoryItem(transactionData.itemId);
        const currentStock = Number(item?.baseStockQty || item?.stockQty || 0);
        // Adjustment is a DELTA (can be positive or negative)
        const adjustmentDelta = Number(transactionData.qtyBase || 0);
        const adjustmentMagnitude = Math.abs(adjustmentDelta);
        
        // If adjustment magnitude is more than 50% of current stock
        if (adjustmentMagnitude > currentStock * 0.5) {
          const isManager = ['manager', 'owner', 'super_admin'].includes(user.role?.name || '');
          if (!isManager) {
            return res.status(403).json({ 
              message: "Large inventory adjustments require manager approval" 
            });
          }
        }
        
        // Adjustments require notes
        const notes = transactionData.notes?.trim();
        if (!notes || notes.length === 0) {
          return res.status(400).json({ 
            message: "Inventory adjustments require detailed notes" 
          });
        }
        
        // Prevent adjustments that would result in negative stock
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

  app.get("/api/hotels/current/room-types", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const roomTypes = await storage.getRoomTypesByHotel(user.hotelId);
      res.json(roomTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch room types" });
    }
  });

  app.post("/api/room-types", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = req.user as any;
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

  app.put("/api/room-types/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }

      const { id } = req.params;
      const roomTypeData = insertRoomTypeSchema.partial().parse(req.body);
      
      // Strip hotelId to prevent cross-tenant tampering
      delete (roomTypeData as any).hotelId;
      
      const roomType = await storage.updateRoomType(parseInt(id), user.hotelId, roomTypeData);
      
      if (!roomType) {
        return res.status(404).json({ message: "Room type not found" });
      }
      
      res.json(roomType);
    } catch (error) {
      res.status(400).json({ message: "Failed to update room type" });
    }
  });

  app.delete("/api/room-types/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = req.user as any;
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

  // Amenity routes - Halls
  app.get("/api/halls", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }

      const halls = await storage.getHallsByHotel(user.hotelId);
      res.json(halls);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch halls" });
    }
  });

  // Alias route for consistency with other endpoints
  app.get("/api/hotels/current/halls", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }

      const halls = await storage.getHallsByHotel(user.hotelId);
      res.json(halls);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch halls" });
    }
  });

  app.get("/api/halls/:id", async (req, res) => {
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

  app.post("/api/halls", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = req.user as any;
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

  app.put("/api/halls/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }

      const { id } = req.params;
      const hallData = insertHallSchema.partial().parse(req.body);
      
      // Strip hotelId to prevent cross-tenant tampering
      delete (hallData as any).hotelId;
      
      const hall = await storage.updateHall(id, user.hotelId, hallData);
      
      if (!hall) {
        return res.status(404).json({ message: "Hall not found" });
      }
      
      res.json(hall);
    } catch (error) {
      res.status(400).json({ message: "Failed to update hall" });
    }
  });

  app.delete("/api/halls/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = req.user as any;
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

  // Amenity routes - Pools
  app.get("/api/pools", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }

      const pools = await storage.getPoolsByHotel(user.hotelId);
      res.json(pools);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pools" });
    }
  });

  app.post("/api/pools", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = req.user as any;
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

  app.put("/api/pools/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }

      const { id } = req.params;
      const poolData = insertPoolSchema.partial().parse(req.body);
      
      // Strip hotelId to prevent cross-tenant tampering
      delete (poolData as any).hotelId;
      
      const pool = await storage.updatePool(id, user.hotelId, poolData);
      
      if (!pool) {
        return res.status(404).json({ message: "Pool not found" });
      }
      
      res.json(pool);
    } catch (error) {
      res.status(400).json({ message: "Failed to update pool" });
    }
  });

  app.delete("/api/pools/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = req.user as any;
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

  // Amenity routes - Services
  app.get("/api/services", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }

      const services = await storage.getServicesByHotel(user.hotelId);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }

      const serviceData = insertServiceSchema.parse(req.body);
      serviceData.hotelId = user.hotelId;
      const service = await storage.createService(serviceData);
      
      // Broadcast WebSocket event
      wsEvents.serviceCreated(user.hotelId, service);
      
      res.status(201).json(service);
    } catch (error) {
      res.status(400).json({ message: "Failed to create service" });
    }
  });

  app.put("/api/services/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }

      const { id } = req.params;
      const serviceData = insertServiceSchema.partial().parse(req.body);
      
      // Strip hotelId to prevent cross-tenant tampering
      delete (serviceData as any).hotelId;
      
      const service = await storage.updateService(id, user.hotelId, serviceData);
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(service);
    } catch (error) {
      res.status(400).json({ message: "Failed to update service" });
    }
  });

  app.delete("/api/services/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = req.user as any;
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

  app.get("/api/hotels/current/reservations", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const reservations = await storage.getRoomReservationsByHotel(user.hotelId);
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reservations" });
    }
  });

  app.get("/api/hotels/current/taxes", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const taxes = await storage.getHotelTaxes(user.hotelId);
      res.json(taxes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hotel taxes" });
    }
  });

  app.post("/api/hotels/current/taxes", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      // CRITICAL: Only owner can modify tax settings to prevent tax evasion
      if (user.role?.name !== 'owner' && user.role?.name !== 'super_admin') {
        return res.status(403).json({ 
          message: "Only the hotel owner can modify tax settings" 
        });
      }
      
      const { taxType, percent, isActive } = req.body;
      
      console.log("Tax update request:", { taxType, percent, isActive, percentType: typeof percent });
      
      // Log tax configuration changes for audit trail
      const existingTax = await storage.getHotelTax(user.hotelId, taxType);
      await storage.createTaxChangeLog({
        hotelId: user.hotelId,
        taxType,
        previousPercent: existingTax?.percent || null,
        newPercent: percent !== undefined ? percent : null,
        previousActive: existingTax?.isActive ?? undefined,
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

  app.get("/api/hotels/current/payments", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const payments = await storage.getPaymentsByHotel(user.hotelId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // Get single hotel by ID (after all /current routes to avoid conflicts)
  app.get("/api/hotels/:id", requireActiveUser, async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.user as any;
      
      // SECURITY: Verify user can access this hotel
      if (currentUser.role?.name !== 'super_admin' && currentUser.hotelId !== id) {
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

  // User routes
  app.get("/api/hotels/:hotelId/users", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user as any;
      
      // SECURITY: Verify user can access this hotel's users
      if (currentUser.role?.name !== 'super_admin' && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const users = await storage.getUsersByHotel(hotelId);
      const sanitizedUsers = users.map(user => {
        const { passwordHash: _, ...sanitizedUser } = user;
        return sanitizedUser;
      });
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const currentUser = req.user as any;
      
      // Handle role conversion and password hashing
      const { role, password, confirmPassword, firstName, lastName, ...userData } = req.body;
      
      // Get role ID from role name, or role name from role ID
      let roleId = userData.roleId;
      let targetRoleName = role;
      
      if (role && !roleId) {
        // Case 1: role name provided, get role ID
        const roleRecord = await storage.getRoleByName(role);
        if (roleRecord) {
          roleId = roleRecord.id;
          targetRoleName = roleRecord.name;
        } else {
          return res.status(400).json({ message: `Role '${role}' not found` });
        }
      } else if (roleId && !role) {
        // Case 2: role ID provided, get role name
        const roleRecord = await storage.getRole(roleId);
        if (roleRecord) {
          targetRoleName = roleRecord.name;
        } else {
          return res.status(400).json({ message: `Role with ID '${roleId}' not found` });
        }
      }

      // Role-based authorization - check what roles current user can create
      const currentUserRoleName = currentUser.role?.name || '';
      const rolePermissions = {
        super_admin: ['super_admin', 'owner'],
        owner: ['manager', 'housekeeping_supervisor', 'restaurant_bar_manager', 'security_head', 'finance'],
        manager: ['housekeeping_supervisor', 'restaurant_bar_manager', 'security_head', 'finance', 'front_desk', 'storekeeper'],
        housekeeping_supervisor: ['housekeeping_staff'],
        restaurant_bar_manager: ['waiter', 'kitchen_staff', 'bartender', 'barista', 'cashier'],
        security_head: ['security_guard', 'surveillance_officer']
      };

      const allowedRoles = rolePermissions[currentUserRoleName as keyof typeof rolePermissions] || [];
      if (!allowedRoles.includes(targetRoleName)) {
        return res.status(403).json({ 
          message: `You do not have permission to create users with role '${targetRoleName}'`,
          allowedRoles 
        });
      }
      
      // Hash password if provided
      let hashedPassword = userData.passwordHash;
      if (password) {
        const { hashPassword } = await import("./auth.js");
        hashedPassword = await hashPassword(password);
      }

      // Auto-assign hotel based on current user (except for super_admin)
      let hotelId = userData.hotelId;
      
      if (currentUserRoleName === 'super_admin') {
        // Super admin must provide hotelId explicitly
        if (!hotelId) {
          return res.status(400).json({ 
            message: "Super admin must specify a hotelId when creating users" 
          });
        }
      } else {
        // Non-super-admin users inherit hotelId from current user
        if (!hotelId && currentUser.hotelId) {
          hotelId = currentUser.hotelId;
        }
        
        // Non-super-admin users must have a hotelId to create other users
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
      if (error && typeof error === 'object' && 'errors' in error) {
        // Zod validation errors
        res.status(400).json({ 
          message: "Invalid user data", 
          errors: (error.errors as any[]).map((e: any) => `${e.path.join('.')}: ${e.message}`)
        });
      } else {
        res.status(400).json({ message: (error as any)?.message || "Invalid user data" });
      }
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const currentUser = req.user as any;
      const { id } = req.params;
      
      // Get target user to check their role
      const targetUser = await storage.getUser(id);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const currentUserRoleName = currentUser.role?.name || '';
      const targetUserRoleName = targetUser.role?.name || '';

      // Role-based authorization - check what roles current user can delete
      const roleDeletionPermissions = {
        super_admin: ['super_admin', 'owner', 'manager', 'housekeeping_supervisor', 'restaurant_bar_manager', 'security_head', 'finance', 'front_desk', 'housekeeping_staff', 'waiter', 'kitchen_staff', 'bartender', 'barista', 'cashier', 'security_guard'],
        owner: ['manager', 'housekeeping_supervisor', 'restaurant_bar_manager', 'security_head', 'finance', 'front_desk', 'housekeeping_staff', 'waiter', 'kitchen_staff', 'bartender', 'barista', 'cashier', 'security_guard'],
        manager: ['housekeeping_supervisor', 'restaurant_bar_manager', 'security_head', 'finance', 'front_desk', 'housekeeping_staff', 'waiter', 'kitchen_staff', 'bartender', 'barista', 'cashier', 'security_guard'],
        housekeeping_supervisor: ['housekeeping_staff'],
        restaurant_bar_manager: ['waiter', 'kitchen_staff', 'bartender', 'barista', 'cashier'],
        security_head: ['security_guard']
      };

      const allowedRolesToDelete = roleDeletionPermissions[currentUserRoleName as keyof typeof roleDeletionPermissions] || [];
      if (!allowedRolesToDelete.includes(targetUserRoleName)) {
        return res.status(403).json({ 
          message: `You do not have permission to delete users with role '${targetUserRoleName}'` 
        });
      }
      
      // Prevent deleting users from other hotels (except super_admin)
      if (currentUser.role?.name !== 'super_admin') {
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

  app.put("/api/users/:id", async (req, res) => {
    try {
      // CRITICAL: Require authentication
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const currentUser = req.user as any;
      const { id } = req.params;
      const userData = insertUserSchema.partial().parse(req.body);
      
      // CRITICAL SECURITY: Block password changes through this endpoint
      // Passwords can ONLY be changed via /api/reset-password with old password verification
      if ('passwordHash' in userData) {
        return res.status(403).json({ 
          message: "Cannot change passwords through this endpoint. Use the password reset functionality." 
        });
      }
      
      // Get target user to verify hotel and role
      const targetUser = await storage.getUser(id);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // CRITICAL: Hotel isolation check MUST come FIRST (before any other authorization)
      // Prevents cross-hotel privilege escalation - managers/owners can only affect their own hotel
      const currentRole = currentUser.role?.name || '';
      if (currentRole !== 'super_admin') {
        if (!targetUser.hotelId || targetUser.hotelId !== currentUser.hotelId) {
          return res.status(403).json({ message: "Cannot update users from other hotels" });
        }
      }
      
      // CRITICAL: Prevent users from updating their own protected fields
      if (currentUser.id === id) {
        const protectedFields = ['roleId', 'isActive', 'hotelId', 'createdBy', 'verification'];
        const attemptedProtectedUpdate = protectedFields.some(field => field in userData);
        
        if (attemptedProtectedUpdate) {
          return res.status(403).json({ 
            message: "Cannot modify your own role, status, or hotel assignment. Contact your manager." 
          });
        }
      }
      
      // CRITICAL: Verify permission to update other users
      if (currentUser.id !== id) {
        
        // Only managers, owners, and super_admins can update other users
        const canUpdateUsers = ['owner', 'manager', 'super_admin'].includes(currentRole);
        
        if (!canUpdateUsers) {
          return res.status(403).json({ 
            message: "You don't have permission to update other users" 
          });
        }
        
        // CRITICAL: Prevent updating protected fields without proper authorization
        if ('roleId' in userData || 'isActive' in userData) {
          // Only owner and super_admin can change roles or activation status
          if (!['owner', 'super_admin'].includes(currentRole)) {
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

  // Get all users with role information
  app.get("/api/users", async (req, res) => {
    try {
      const allUsers = await db
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
        .where(isNull(users.deletedAt))
        .orderBy(asc(users.username));
      
      res.json(allUsers.map((user: any) => {
        const { passwordHash: _, ...sanitizedUser } = user;
        return {
          ...sanitizedUser,
          role: user.role || undefined
        };
      }));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users/:id/duty", async (req, res) => {
    try {
      // CRITICAL: Require authentication
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const currentUser = req.user as any;
      const { id } = req.params;
      const { isOnline } = req.body;
      
      // Users can only update their own duty status
      if (currentUser.id !== id) {
        return res.status(403).json({ message: "Cannot update another user's duty status" });
      }
      
      // CRITICAL: Verify user is still active
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

  // Manager password reset endpoint (for when staff forget their password)
  app.post("/api/manager/reset-staff-password", async (req, res) => {
    try {
      // CRITICAL: Require authentication
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const currentUser = req.user as any;
      const { targetUserId, newPassword } = req.body;

      // Validate required fields
      if (!targetUserId || !newPassword) {
        return res.status(400).json({ 
          message: "Target user ID and new password are required" 
        });
      }

      // CRITICAL: Only managers and owners can reset staff passwords
      const currentRole = currentUser.role?.name || '';
      if (!['manager', 'owner'].includes(currentRole)) {
        return res.status(403).json({ 
          message: "Only managers and owners can reset staff passwords" 
        });
      }

      // Get target user
      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "Target user not found" });
      }

      // CRITICAL: Hotel isolation - can only reset passwords within same hotel
      if (currentRole !== 'super_admin' && targetUser.hotelId !== currentUser.hotelId) {
        return res.status(403).json({ 
          message: "Cannot reset passwords for users in other hotels" 
        });
      }

      // CRITICAL: Define which roles can be reset by managers and owners
      const targetRole = targetUser.role?.name || '';
      const managerCanReset = ['waiter', 'kitchen_staff', 'housekeeping_staff', 'security_guard', 'cashier', 'front_desk', 'storekeeper'];
      const ownerCanReset = [...managerCanReset, 'manager', 'housekeeping_supervisor', 'restaurant_bar_manager', 'security_head', 'finance'];

      let canResetThisRole = false;
      if (currentRole === 'owner') {
        canResetThisRole = ownerCanReset.includes(targetRole);
      } else if (currentRole === 'manager') {
        canResetThisRole = managerCanReset.includes(targetRole);
      }

      if (!canResetThisRole) {
        return res.status(403).json({ 
          message: `You do not have permission to reset passwords for ${targetRole} role` 
        });
      }

      // Validate new password
      if (newPassword.length < 8) {
        return res.status(400).json({ 
          message: "New password must be at least 8 characters" 
        });
      }

      // Hash the new password
      const { hashPassword } = await import("./auth.js");
      const hashedPassword = await hashPassword(newPassword);

      // Update target user's password
      await storage.updateUser(targetUserId, { passwordHash: hashedPassword });

      // Log successful password reset
      await logAudit({
        userId: currentUser.id,
        hotelId: currentUser.hotelId || undefined,
        action: 'manager_reset_staff_password',
        resourceType: 'user',
        resourceId: targetUserId,
        details: { 
          managerUsername: currentUser.username,
          targetUsername: targetUser.username,
          targetRole: targetRole
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
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

  // Role routes
  app.get("/api/roles", async (req, res) => {
    try {
      const roles = await storage.getAllRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });

  // Room routes
  app.get("/api/hotels/:hotelId/rooms", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user as any;
      
      // SECURITY: Verify user can access this hotel's rooms
      if (currentUser.role?.name !== 'super_admin' && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const rooms = await storage.getRoomsByHotel(hotelId);
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });

  app.post("/api/rooms", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const currentUser = req.user as any;
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

  app.put("/api/rooms/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const currentUser = req.user as any;
      const { id } = req.params;
      const updateData = req.body;
      
      // Get existing room to detect checkout
      const existingRoom = await storage.getRoom(id);
      if (!existingRoom || existingRoom.hotelId !== currentUser.hotelId) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      // CRITICAL: Status changes require authorization
      const isStatusChange = 'status' in updateData && updateData.status !== existingRoom.status;
      
      if (isStatusChange) {
        const canChangeStatus = ['manager', 'owner', 'housekeeping_supervisor'].includes(currentUser.role?.name || '');
        
        if (!canChangeStatus) {
          return res.status(403).json({ 
            message: "Only supervisors can change room status" 
          });
        }
        
        // 'maintenance' status requires reason
        if (updateData.status === 'maintenance' && !updateData.maintenanceReason) {
          return res.status(400).json({ 
            message: "Maintenance status requires a reason" 
          });
        }
      }
      
      // Extract occupantDetails separately since it's a jsonb field that may not validate properly
      const { occupantDetails, maintenanceReason, statusChangeReason, ...restBody } = updateData;
      const validatedData = insertRoomSchema.partial().parse(restBody);
      // Add occupantDetails back if it exists
      const roomData = occupantDetails !== undefined 
        ? { ...validatedData, occupantDetails } 
        : validatedData;
      
      // Detect checkout: room was occupied and is now being set to unoccupied
      const isCheckout = existingRoom.isOccupied && roomData.isOccupied === false;
      
      if (isCheckout && existingRoom.occupantDetails) {
        // Extract guest information before it's cleared
        const occupant = existingRoom.occupantDetails as any;
        const guestName = occupant?.guestName || occupant?.firstName 
          ? `${occupant.firstName || ''} ${occupant.lastName || ''}`.trim()
          : 'Guest';
        
        // Create room cleaning queue entry
        await storage.createRoomCleaningQueue({
          hotelId: existingRoom.hotelId,
          roomId: existingRoom.id,
          roomNumber: existingRoom.roomNumber || 'Unknown',
          guestName: guestName,
          guestId: occupant?.guestId || null,
          status: 'pending'
        });
      }
      
      // Update room first
      const room = await storage.updateRoom(id, roomData);
      
      // Log status change AFTER successful update
      if (isStatusChange) {
        await storage.createRoomStatusLog({
          roomId: id,
          roomNumber: existingRoom.roomNumber || 'Unknown',
          previousStatus: existingRoom.status || '',
          newStatus: updateData.status,
          reason: updateData.maintenanceReason || updateData.statusChangeReason || null,
          changedBy: currentUser.id
        });
      }
      
      // Broadcast room updates to front desk role in real-time
      wsEvents.roomStatusUpdated(currentUser.hotelId, room);
      
      res.json(room);
    } catch (error) {
      console.error("Room update error:", error);
      res.status(400).json({ message: "Failed to update room", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.delete("/api/rooms/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteRoom(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete room" });
    }
  });

  // Room Reservations routes
  app.post("/api/reservations", async (req, res) => {
    try {
      const reservationData = insertRoomReservationSchema.parse(req.body);
      
      // Create reservation with atomic transaction and locking
      // The storage method handles availability checking within the transaction
      const reservation = await storage.createRoomReservation(reservationData);
      
      // Update room status to reserved
      await storage.updateRoom(reservationData.roomId, {
        status: 'reserved',
        currentReservationId: reservation.id
      });

      res.status(201).json(reservation);
    } catch (error) {
      console.error("Reservation creation error:", error);
      
      // Check if it's a double booking error
      if (error instanceof Error && error.message.includes('already booked')) {
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

  app.post("/api/reservations/:id/check-in", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const currentUser = req.user as any;
      const { id } = req.params;
      const reservation = await storage.checkInGuest(id);
      
      // Broadcast check-in event to front desk role in real-time
      wsEvents.roomStatusUpdated(currentUser.hotelId, { 
        id: reservation.roomId, 
        status: 'occupied',
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

  app.patch("/api/reservations/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const currentUser = req.user as any;
      const { id } = req.params;
      const { paidAmount } = req.body;

      const reservation = await storage.getRoomReservation(id);
      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }

      if (reservation.hotelId !== currentUser.hotelId) {
        return res.status(404).json({ message: "Reservation not found" });
      }

      // Update the paid amount
      const updated = await storage.updateRoomReservation(id, { paidAmount });
      res.json(updated);
    } catch (error) {
      console.error("Update reservation error:", error);
      res.status(500).json({ message: "Failed to update reservation" });
    }
  });

  app.post("/api/reservations/:id/check-out", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const currentUser = req.user as any;
      const { id } = req.params;
      const { overrideBalance, overrideReason } = req.body;
      
      const reservation = await storage.getRoomReservation(id);
      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }
      
      if (reservation.hotelId !== currentUser.hotelId) {
        return res.status(404).json({ message: "Reservation not found" });
      }
      
      // CRITICAL: Check for outstanding balance
      const totalAmount = Number(reservation.totalPrice || 0);
      const paidAmount = Number(reservation.paidAmount || 0);
      const balanceDue = totalAmount - paidAmount;
      
      if (balanceDue > 0) {
        // Only managers can override balance requirement
        if (!overrideBalance) {
          return res.status(400).json({ 
            message: `Cannot check out with outstanding balance of ${balanceDue}. Please collect payment first.`,
            balanceDue 
          });
        }
        
        const canOverride = ['manager', 'owner'].includes(currentUser.role?.name || '');
        if (!canOverride) {
          return res.status(403).json({ 
            message: `Outstanding balance of ${balanceDue} must be cleared. Contact your manager to override.`,
            balanceDue 
          });
        }
        
        // Log manager override for audit
        await storage.createCheckoutOverrideLog({
          reservationId: id,
          balanceDue: String(balanceDue),
          overriddenBy: currentUser.id,
          reason: overrideReason || 'Manager override'
        });
      }
      
      // Process checkout
      const checkedOutReservation = await storage.checkOutGuest(id);
      
      // Broadcast checkout event to front desk role in real-time
      wsEvents.roomStatusUpdated(currentUser.hotelId, { 
        id: checkedOutReservation.roomId, 
        status: 'available',
        isOccupied: false 
      });
      
      res.json(checkedOutReservation);
    } catch (error) {
      console.error("Checkout error:", error);
      res.status(500).json({ message: "Failed to check out guest" });
    }
  });

  app.get("/api/rooms/availability", async (req, res) => {
    try {
      const { hotelId, roomId, checkIn, checkOut } = req.query;
      
      if (!hotelId || !roomId || !checkIn || !checkOut) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      const isAvailable = await storage.checkRoomAvailability(
        hotelId as string,
        roomId as string,
        new Date(checkIn as string),
        new Date(checkOut as string)
      );

      res.json({ available: isAvailable });
    } catch (error) {
      console.error("Availability check error:", error);
      res.status(500).json({ message: "Failed to check availability" });
    }
  });

  app.get("/api/reservations/date-range", async (req, res) => {
    try {
      const { hotelId, startDate, endDate } = req.query;
      
      if (!hotelId || !startDate || !endDate) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      const reservations = await storage.getReservationsByDateRange(
        hotelId as string,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json(reservations);
    } catch (error) {
      console.error("Get reservations error:", error);
      res.status(500).json({ message: "Failed to get reservations" });
    }
  });

  // Room Service Charges routes
  app.post("/api/hotels/current/room-service-charges", requireActiveUser, async (req, res) => {
    try {
      const currentUser = req.user as any;
      if (!currentUser?.hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const chargeData = insertRoomServiceChargeSchema.parse({
        ...req.body,
        hotelId: currentUser.hotelId,
        addedBy: currentUser.id
      });

      const charge = await storage.createRoomServiceCharge(chargeData);
      
      // Emit WebSocket event for real-time updates
      wsEvents.roomServiceChargeCreated(currentUser.hotelId, charge);
      
      res.json(charge);
    } catch (error) {
      console.error("Create room service charge error:", error);
      res.status(500).json({ message: "Failed to add service charge" });
    }
  });

  app.get("/api/hotels/current/room-service-charges", requireActiveUser, async (req, res) => {
    try {
      const currentUser = req.user as any;
      if (!currentUser?.hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { reservationId } = req.query;
      
      if (reservationId) {
        // SECURITY: Verify reservation belongs to user's hotel before returning charges
        const reservation = await storage.getRoomReservation(reservationId as string);
        if (!reservation || reservation.hotelId !== currentUser.hotelId) {
          return res.status(403).json({ message: "Access denied" });
        }
        const charges = await storage.getRoomServiceCharges(reservationId as string);
        res.json(charges);
      } else {
        // Get all charges for the hotel
        const charges = await storage.getAllRoomServiceChargesByHotel(currentUser.hotelId);
        res.json(charges);
      }
    } catch (error) {
      console.error("Get room service charges error:", error);
      res.status(500).json({ message: "Failed to get service charges" });
    }
  });

  app.delete("/api/hotels/current/room-service-charges/:id", requireActiveUser, async (req, res) => {
    try {
      const currentUser = req.user as any;
      if (!currentUser?.hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { id } = req.params;
      await storage.deleteRoomServiceCharge(id);
      
      // Emit WebSocket event for real-time updates
      wsEvents.roomServiceChargeDeleted(currentUser.hotelId, id);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Delete room service charge error:", error);
      res.status(500).json({ message: "Failed to delete service charge" });
    }
  });

  // Menu routes
  app.get("/api/hotels/:hotelId/menu-items", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user as any;
      
      // SECURITY: Verify user can access this hotel's menu items
      if (currentUser.role?.name !== 'super_admin' && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const menuItems = await storage.getMenuItemsByHotel(hotelId);
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.get("/api/hotels/:hotelId/menu-categories", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user as any;
      
      // SECURITY: Verify user can access this hotel's menu categories
      if (currentUser.role?.name !== 'super_admin' && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const categories = await storage.getMenuCategoriesByHotel(hotelId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu categories" });
    }
  });

  app.post("/api/menu-items", async (req, res) => {
    try {
      const itemData = insertMenuItemSchema.parse(req.body);
      const item = await storage.createMenuItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid menu item data" });
    }
  });

  app.put("/api/menu-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const itemData = insertMenuItemSchema.partial().parse(req.body);
      const item = await storage.updateMenuItem(id, itemData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Failed to update menu item" });
    }
  });

  app.delete("/api/menu-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMenuItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete menu item" });
    }
  });

  // Task routes
  app.get("/api/tasks/my-tasks", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.id) {
        return res.status(400).json({ message: "User not found" });
      }
      const tasks = await storage.getTasksByUser(user.id);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/users/:userId/tasks", async (req, res) => {
    try {
      const { userId } = req.params;
      const tasks = await storage.getTasksByUser(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/hotels/:hotelId/tasks", async (req, res) => {
    try {
      const { hotelId } = req.params;
      const tasks = await storage.getTasksByHotel(hotelId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const taskData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(id, taskData);
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTask(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete task" });
    }
  });

  // Transaction routes
  app.get("/api/hotels/:hotelId/transactions", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user as any;
      
      // SECURITY: Verify user can access this hotel's transactions
      if (currentUser.role?.name !== 'super_admin' && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const transactions = await storage.getTransactionsByHotel(hotelId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", requireActiveUser, async (req, res) => {
    try {
      const currentUser = req.user as any;
      if (!currentUser?.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }

      const { hotelId: _, createdBy: __, ...sanitizedBody } = req.body;
      
      // CRITICAL: Validate vendor payments - prevent unauthorized payments
      const isVendorPayment = sanitizedBody.vendorId || 
        (sanitizedBody.purpose && String(sanitizedBody.purpose).toLowerCase().includes('vendor'));
      
      if (isVendorPayment) {
        // Require invoice or PO reference for vendor payments
        if (!sanitizedBody.reference) {
          return res.status(400).json({ 
            message: "Vendor payments require invoice or purchase order reference" 
          });
        }
        
        // Only manager, owner, or finance can approve vendor payments
        const canApprove = ['manager', 'owner', 'super_admin', 'finance'].includes(currentUser.role?.name || '');
        if (!canApprove) {
          return res.status(403).json({ 
            message: "Only managers and finance can approve vendor payments" 
          });
        }
      }
      
      const transactionData = insertTransactionSchema.parse({
        ...sanitizedBody,
        hotelId: currentUser.hotelId,
        createdBy: currentUser.id
      });
      const transaction = await storage.createTransaction(transactionData);
      
      // Broadcast transaction creation to relevant users
      wsEvents.transactionCreated(currentUser.hotelId, transaction);
      
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Transaction creation error:", error);
      res.status(400).json({ message: "Invalid transaction data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.put("/api/transactions/:id", requireActiveUser, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedTransaction = await storage.updateTransaction(id, updateData);
      
      // Broadcast transaction update to relevant users
      if (updatedTransaction && (req.user as any)?.hotelId) {
        wsEvents.transactionUpdated((req.user as any).hotelId, updatedTransaction);
      }
      
      res.json(updatedTransaction);
    } catch (error) {
      console.error("Transaction update error:", error);
      res.status(400).json({ message: "Failed to update transaction", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.delete("/api/transactions/:id", requireActiveUser, async (req, res) => {
    return res.status(403).json({ 
      message: "Transactions cannot be deleted. Use void functionality instead." 
    });
  });

  app.post("/api/transactions/:id/void", requireActiveUser, async (req, res) => {
    try {
      const currentUser = req.user as any;
      const { id } = req.params;
      const { reason } = req.body;
      
      // Only managers and owners can void transactions
      const canVoid = ['manager', 'owner'].includes(currentUser.role?.name || '');
      if (!canVoid) {
        return res.status(403).json({ 
          message: "Only managers and owners can void transactions" 
        });
      }
      
      // Require detailed reason
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
      
      // Void the transaction
      const voidedTransaction = await storage.voidTransaction(id, currentUser.id, reason);
      
      res.json({ success: true, transaction: voidedTransaction });
    } catch (error) {
      console.error("Transaction void error:", error);
      res.status(500).json({ message: "Failed to void transaction" });
    }
  });

  // Maintenance routes
  app.get("/api/hotels/:hotelId/maintenance-requests", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user as any;
      
      // SECURITY: Verify user can access this hotel's maintenance requests
      if (currentUser.role?.name !== 'super_admin' && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const requests = await storage.getMaintenanceRequestsByHotel(hotelId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch maintenance requests" });
    }
  });

  app.post("/api/maintenance-requests", async (req, res) => {
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

  app.put("/api/maintenance-requests/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const currentUser = req.user as any;
      const { id } = req.params;
      const updateData = req.body;
      
      const existingRequest = await storage.getMaintenanceRequest(id);
      if (!existingRequest || existingRequest.hotelId !== currentUser.hotelId) {
        return res.status(404).json({ message: "Maintenance request not found" });
      }
      
      // CRITICAL: Reassignment requires supervisor approval
      if ('assignedTo' in updateData && updateData.assignedTo !== existingRequest.assignedTo) {
        const canReassign = ['manager', 'owner', 'security_head', 'housekeeping_supervisor', 'restaurant_bar_manager'].includes(currentUser.role?.name || '');
        
        if (!canReassign) {
          return res.status(403).json({ 
            message: "Only supervisors can reassign maintenance requests" 
          });
        }
        
        // Log reassignment for audit
        await storage.createAuditLog({
          hotelId: currentUser.hotelId,
          resourceType: 'maintenance_request',
          resourceId: id,
          action: 'reassigned',
          userId: currentUser.id,
          details: {
            previousAssignee: existingRequest.assignedTo,
            newAssignee: updateData.assignedTo,
            timestamp: new Date()
          }
        });
      }
      
      // Verify assigned user can update their own requests
      const isAssigned = existingRequest.assignedTo === currentUser.id;
      const isSupervisor = ['manager', 'owner', 'security_head', 'housekeeping_supervisor', 'restaurant_bar_manager'].includes(currentUser.role?.name || '');
      
      if (!isAssigned && !isSupervisor) {
        return res.status(403).json({ 
          message: "You can only update requests assigned to you" 
        });
      }
      
      // Log status changes (approve/decline) for audit
      if ('status' in updateData && updateData.status !== existingRequest.status) {
        const statusActions: { [key: string]: string } = {
          'approved': 'approved',
          'declined': 'declined',
          'resolved': 'resolved',
          'in_progress': 'started'
        };
        
        const action = statusActions[updateData.status] || 'updated';
        
        await storage.createAuditLog({
          hotelId: currentUser.hotelId,
          resourceType: 'maintenance_request',
          resourceId: id,
          action,
          userId: currentUser.id,
          details: {
            previousStatus: existingRequest.status,
            newStatus: updateData.status,
            requestTitle: existingRequest.title,
            requestLocation: existingRequest.location,
            timestamp: new Date()
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

  // KOT routes
  app.get("/api/hotels/:hotelId/kot-orders", async (req, res) => {
    try {
      const { hotelId } = req.params;
      const kotOrders = await storage.getKotOrdersByHotel(hotelId);
      res.json(kotOrders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch KOT orders" });
    }
  });

  app.get("/api/kot-orders/:kotId/items", async (req, res) => {
    try {
      const { kotId } = req.params;
      const items = await storage.getKotItems(kotId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch KOT items" });
    }
  });

  app.post("/api/kot-orders", requireActiveUser, async (req, res) => {
    try {
      const currentUser = req.user as any;
      if (!currentUser || !currentUser.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      const { items, ...kotData } = req.body;
      
      // CRITICAL: Always set hotelId and createdBy from authenticated user
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

  app.put("/api/kot-orders/:id", requireActiveUser, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user as any;
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

  app.put("/api/kot-items/:id", requireActiveUser, async (req, res) => {
    try {
      const currentUser = req.user as any;
      const { id } = req.params;
      const updateData = req.body;
      
      if (!currentUser || !currentUser.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }

      const existingItem = await storage.getKotItemById(id);
      if (!existingItem) {
        return res.status(404).json({ message: "KOT item not found" });
      }

      // Verify the KOT item belongs to the user's hotel
      const kotOrder = await db.query.kotOrders.findFirst({
        where: (orders, { eq }) => eq(orders.id, existingItem.kotId!)
      });

      if (!kotOrder || kotOrder.hotelId !== currentUser.hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // CRITICAL: Authorization check BEFORE validation - Declining/canceling requires manager role
      if (updateData.status === 'declined' || updateData.status === 'cancelled') {
        const canDecline = ['manager', 'owner', 'restaurant_bar_manager'].includes(currentUser.role?.name || '');
        
        if (!canDecline) {
          return res.status(403).json({ 
            message: "Only managers can decline or cancel orders. Contact your supervisor." 
          });
        }
      }

      // Validate the request body (includes 10-char minimum check for decline/cancel reasons)
      const validatedData = updateKotItemSchema.parse(updateData);
      
      // Log decline/cancellation for audit trail
      if (validatedData.status === 'declined' || validatedData.status === 'cancelled') {
        await storage.createKotAuditLog({
          kotItemId: id,
          action: validatedData.status,
          performedBy: currentUser.id,
          reason: validatedData.declineReason,
          previousStatus: existingItem.status || undefined,
          newStatus: validatedData.status
        });
      }
      
      // CRITICAL: When marking as completed, verify inventory was deducted
      if (validatedData.status === 'completed' && existingItem.status !== 'completed') {
        // Get menu item to check inventory items
        const menuItem = await storage.getMenuItem(existingItem.menuItemId!);
        
        // If menu item has inventory items, mark as verified
        if (menuItem && menuItem.recipe) {
          validatedData.inventoryVerified = true;
        }
      }

      // If status is being changed to "approved", deduct inventory
      if (validatedData.status === 'approved' && existingItem.status !== 'approved') {
        await storage.deductInventoryForKotItem(id);
      }

      // Update the KOT item
      const updatedItem = await storage.updateKotItem(id, validatedData);
      
      // Sync the parent order status after item update
      if (existingItem.kotId) {
        await storage.updateKotOrderStatus(existingItem.kotId);
      }
      
      // Broadcast real-time KOT update
      if (currentUser?.hotelId) {
        wsEvents.kotOrderUpdated(currentUser.hotelId, updatedItem);
      }
      
      res.json(updatedItem);
    } catch (error: any) {
      console.error("KOT item update error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid data" });
      }
      res.status(400).json({ message: "Failed to update KOT item" });
    }
  });

  app.delete("/api/kot-orders/:id", requireActiveUser, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      
      // Verify the KOT order belongs to the user's hotel
      const kotOrder = await db.query.kotOrders.findFirst({
        where: (orders, { eq }) => eq(orders.id, id)
      });

      if (!kotOrder) {
        return res.status(404).json({ message: "KOT order not found" });
      }

      if (kotOrder.hotelId !== user.hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Delete the KOT order with inventory restoration
      await storage.deleteKotOrderWithInventoryRestore(id);
      res.status(204).send();
    } catch (error) {
      console.error("KOT deletion error:", error);
      res.status(400).json({ message: "Failed to delete KOT order" });
    }
  });

  // Restaurant Bill routes
  app.get("/api/hotels/current/bills", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }

      const { startDate, endDate, status } = req.query;
      const filters: any = {};
      
      if (startDate) {
        filters.startDate = new Date(startDate as string);
      }
      if (endDate) {
        filters.endDate = new Date(endDate as string);
      }
      if (status) {
        filters.status = status as string;
      }

      const bills = await storage.getRestaurantBillsByHotel(user.hotelId, filters);
      res.json(bills);
    } catch (error) {
      console.error("Bill fetch error:", error);
      res.status(500).json({ message: "Failed to fetch bills" });
    }
  });

  app.get("/api/hotels/current/bills/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      const { id } = req.params;
      
      const bill = await storage.getRestaurantBill(id);
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }
      
      if (bill.hotelId !== user.hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const payments = await storage.getBillPayments(id);
      res.json({ ...bill, payments });
    } catch (error) {
      console.error("Bill fetch error:", error);
      res.status(500).json({ message: "Failed to fetch bill" });
    }
  });

  app.post("/api/hotels/current/bills", requireActiveUser, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }

      const { payments, ...billData } = req.body;

      // Generate bill number
      const timestamp = Date.now();
      const billNumber = `BILL-${timestamp.toString().slice(-8)}`;

      // Create bill with server-side fields
      const bill = await storage.createRestaurantBill({
        ...billData,
        billNumber,
        hotelId: user.hotelId,
        createdBy: user.id,
        finalizedAt: billData.status === 'final' ? new Date() : null
      });

      // Create payments and transactions
      const createdPayments = [];
      for (const payment of payments) {
        // Create transaction for this payment
        const transaction = await storage.createTransaction({
          hotelId: user.hotelId,
          txnType: payment.paymentMethod === 'cash' ? 'cash_in' : 
                   payment.paymentMethod === 'pos' ? 'pos_in' : 'fonepay_in',
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          purpose: 'restaurant_sale',
          reference: `Bill: ${billNumber}`,
          createdBy: user.id
        });

        // Create bill payment
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

      // Check if bill is fully paid and lock it
      if (createdPayments.length > 0) {
        const totalPaid = createdPayments
          .filter((p: any) => !p.isVoided)
          .reduce((sum: number, p: any) => sum + Number(p.amount), 0);
        
        const grandTotal = Number(bill.grandTotal);
        
        // If fully paid, lock the bill
        if (totalPaid >= grandTotal) {
          await storage.updateRestaurantBill(bill.id, {
            status: 'paid',
            finalizedAt: new Date()
          });
          
          // Update the bill object to reflect the change
          bill.status = 'paid';
          bill.finalizedAt = new Date();
        }
      }

      // Update order statuses to served if bill is finalized
      if (billData.status === 'final' && billData.orderIds) {
        for (const orderId of billData.orderIds) {
          await storage.updateKotOrder(orderId, { status: 'served' });
        }
      }

      res.status(201).json({ ...bill, payments: createdPayments });
    } catch (error) {
      console.error("Bill creation error:", error);
      res.status(400).json({ message: "Failed to create bill", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.put("/api/hotels/current/bills/:id", requireActiveUser, async (req, res) => {
    try {
      const user = req.user as any;
      const { id } = req.params;
      
      const existingBill = await storage.getRestaurantBill(id);
      if (!existingBill) {
        return res.status(404).json({ message: "Bill not found" });
      }
      
      if (existingBill.hotelId !== user.hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // CRITICAL: Prevent modifying paid bills
      if (existingBill.status === 'paid' || existingBill.status === 'finalized') {
        const isManager = ['manager', 'owner', 'super_admin'].includes(user.role?.name || '');
        
        if (!isManager) {
          return res.status(403).json({ 
            message: "Cannot modify paid bills. Contact your manager for amendments." 
          });
        }
        
        // Even managers must provide amendment reason
        if (!req.body.amendmentNote || req.body.amendmentNote.trim().length < 10) {
          return res.status(400).json({ 
            message: "Amendments to paid bills require detailed notes (minimum 10 characters)" 
          });
        }
        
        // Create audit log for amendment
        await storage.createAuditLog({
          hotelId: user.hotelId,
          resourceType: 'restaurant_bill',
          resourceId: id,
          action: 'amendment',
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

      const updateData: any = {
        ...req.body,
        amendedBy: user.id,
        amendedAt: new Date()
      };

      const updatedBill = await storage.updateRestaurantBill(id, updateData);
      res.json(updatedBill);
    } catch (error) {
      console.error("Bill update error:", error);
      res.status(400).json({ message: "Failed to update bill" });
    }
  });

  // Void payment endpoint - requires manager approval
  app.post("/api/bill-payments/:paymentId/void", requireActiveUser, async (req, res) => {
    console.log('🔥 VOID ENDPOINT HIT:', req.params.paymentId, req.isAuthenticated());
    try {
      const currentUser = req.user as any;
      console.log('🔥 USER:', currentUser.username, currentUser.role?.name);
      const { paymentId } = req.params;
      const { reason } = req.body;
      
      // CRITICAL: Only managers can void payments
      const canVoid = ['manager', 'owner'].includes(currentUser.role?.name || '');
      if (!canVoid) {
        return res.status(403).json({ 
          message: "Only managers can void payments" 
        });
      }
      
      // CRITICAL: Require detailed reason
      if (!reason || reason.trim().length < 15) {
        return res.status(400).json({ 
          message: "Void reason required (minimum 15 characters)" 
        });
      }
      
      // Get existing payment
      const payment = await storage.getBillPayment(paymentId);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      // Verify not already voided
      if (payment.isVoided) {
        return res.status(400).json({ message: "Payment already voided" });
      }
      
      // Verify belongs to user's hotel
      if (payment.hotelId !== currentUser.hotelId) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      // Check payment age - prevent voiding old payments (e.g., >=7 days)
      const paymentDate = new Date(payment.createdAt);
      const daysSince = (Date.now() - paymentDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSince >= 7) {
        // Only owner can void payments 7 days or older
        if (currentUser.role?.name !== 'owner') {
          return res.status(403).json({ 
            message: "Cannot void payments 7 days or older. Contact hotel owner." 
          });
        }
      }
      
      // Void the payment
      const voidedPayment = await storage.voidBillPayment(paymentId, currentUser.id, reason);
      
      // Log payment void
      await logAudit({
        userId: currentUser.id,
        hotelId: currentUser.hotelId,
        action: 'void_payment',
        resourceType: 'bill_payment',
        resourceId: paymentId,
        details: { 
          reason, 
          amount: payment.amount, 
          billId: payment.billId,
          paymentMethod: payment.paymentMethod
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      // Always recalculate and update bill status after voiding payment
      const bill = await storage.getRestaurantBill(payment.billId);
      const allPayments = await storage.getBillPayments(payment.billId);
      const totalPaid = allPayments
        .filter(p => !p.isVoided)
        .reduce((sum, p) => sum + Number(p.amount), 0);
      
      const grandTotal = Number(bill.grandTotal);
      
      // Update bill status based on payment total
      if (totalPaid >= grandTotal) {
        // Fully paid
        await storage.updateRestaurantBill(payment.billId, {
          status: 'paid'
        });
      } else if (totalPaid > 0) {
        // Partially paid
        await storage.updateRestaurantBill(payment.billId, {
          status: 'partial'
        });
      } else {
        // No payments or all voided
        await storage.updateRestaurantBill(payment.billId, {
          status: 'draft'
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

  // Wastage routes
  app.post("/api/hotels/current/wastages", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      const wastageData = req.body;
      
      // Validate required fields (check specifically for undefined/null, not falsy values like 0)
      if (!wastageData.itemId || wastageData.qty === undefined || wastageData.qty === null || !wastageData.reason) {
        return res.status(400).json({ 
          message: "Item, quantity, and reason are required" 
        });
      }
      
      // Validate itemId is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(wastageData.itemId)) {
        return res.status(400).json({ 
          message: "Invalid inventory item selected" 
        });
      }
      
      // CRITICAL SECURITY: Validate qty is a positive number
      const qty = Number(wastageData.qty);
      if (!Number.isFinite(qty) || qty <= 0) {
        return res.status(400).json({ 
          message: "Quantity must be a positive number" 
        });
      }
      
      // Require detailed reason (minimum 15 characters)
      if (!wastageData.reason || wastageData.reason.trim().length < 15) {
        return res.status(400).json({ 
          message: "Wastage reason must be detailed (minimum 15 characters)" 
        });
      }
      
      // Get inventory item to check value
      const inventoryItem = await storage.getInventoryItem(wastageData.itemId);
      if (!inventoryItem || inventoryItem.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      const wastageQty = Number(wastageData.qty);
      const itemCost = Number(inventoryItem.costPerUnit || 0);
      const wastageValue = wastageQty * itemCost;
      
      // Only manager, owner, restaurant_bar_manager, and storekeeper can auto-approve wastage (deduct from inventory)
      // Other staff (barista, bartender, kitchen, waiter, cashier) create pending wastage
      const canAutoApprove = ['manager', 'owner', 'restaurant_bar_manager', 'storekeeper'].includes(user.role?.name || '');
      
      if (!canAutoApprove) {
        // Create wastage with 'pending_approval' status - DO NOT deduct stock
        const finalWastageData = {
          ...wastageData,
          hotelId: user.hotelId,
          recordedBy: user.id,
          status: 'pending_approval',
          estimatedValue: wastageValue
        };
        
        const wastage = await storage.createWastage(finalWastageData);
        
        // Notify restaurant/bar manager for kitchen/bar/restaurant staff wastage
        const restaurantBarRole = await storage.getRoleByName('restaurant_bar_manager');
        if (restaurantBarRole) {
          const rbManagers = await storage.getUsersByRole(restaurantBarRole.id);
          const hotelRbManagers = rbManagers.filter(m => m.hotelId === user.hotelId);
          
          for (const manager of hotelRbManagers) {
            await storage.createNotification({
              userId: manager.id,
              title: 'Wastage Approval Required',
              message: `${user.username} reported wastage of ${wastageData.qty} ${wastageData.unit || inventoryItem.unit} ${inventoryItem.name} (Value: Rs. ${wastageValue.toFixed(2)}). Reason: ${wastageData.reason}`,
              type: 'wastage_approval',
              relatedId: wastage.id,
              hotelId: user.hotelId
            });
          }
        }
        
        return res.status(201).json({ 
          ...wastage,
          message: "Wastage requires manager approval" 
        });
      }
      
      // Manager, owner, or storekeeper - auto-approve and deduct inventory
      const finalWastageData = {
        ...wastageData,
        hotelId: user.hotelId,
        recordedBy: user.id,
        status: 'approved',
        approvedBy: user.id,
        approvedAt: new Date(),
        estimatedValue: wastageValue
      };
      
      const wastage = await storage.createWastage(finalWastageData);
      res.status(201).json(wastage);
    } catch (error: any) {
      console.error("Wastage creation error:", error);
      res.status(400).json({ message: error.message || "Failed to report wastage" });
    }
  });

  app.get("/api/hotels/current/wastages", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const wastages = await storage.getWastagesByHotel(user.hotelId);
      res.json(wastages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wastages" });
    }
  });

  app.post("/api/wastages/:id/approve", requireActiveUser, async (req, res) => {
    try {
      const currentUser = req.user as any;
      const { id } = req.params;
      const { approved, rejectionReason } = req.body;
      
      // Only managers and restaurant bar managers can approve wastage
      const canApprove = ['manager', 'owner', 'restaurant_bar_manager'].includes(currentUser.role?.name || '');
      if (!canApprove) {
        return res.status(403).json({ 
          message: "Only managers can approve wastage" 
        });
      }
      
      const wastage = await storage.getWastage(id);
      if (!wastage || wastage.hotelId !== currentUser.hotelId) {
        return res.status(404).json({ message: "Wastage report not found" });
      }
      
      if (wastage.status !== 'pending_approval') {
        return res.status(400).json({ message: "Wastage already processed" });
      }
      
      if (approved) {
        const approvedWastage = await storage.approveWastage(id, currentUser.id);
        
        // Notify the reporter
        await storage.createNotification({
          userId: wastage.recordedBy,
          title: 'Wastage Approved',
          message: `Your wastage report has been approved by ${currentUser.username}.`,
          type: 'wastage_approved',
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
        
        // Notify the reporter
        await storage.createNotification({
          userId: wastage.recordedBy,
          title: 'Wastage Rejected',
          message: `Your wastage report has been rejected by ${currentUser.username}. Reason: ${rejectionReason}`,
          type: 'wastage_rejected',
          relatedId: id,
          hotelId: currentUser.hotelId
        });
        
        res.json(rejectedWastage);
      }
    } catch (error: any) {
      console.error("Wastage approval error:", error);
      res.status(500).json({ message: error.message || "Failed to process wastage approval" });
    }
  });

  // Inventory routes
  app.get("/api/hotels/current/inventory", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const items = await storage.getInventoryItemsByHotel(user.hotelId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory items" });
    }
  });

  app.get("/api/hotels/:hotelId/inventory", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user as any;
      
      // SECURITY: Verify user can access this hotel's inventory
      if (currentUser.role?.name !== 'super_admin' && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const items = await storage.getInventoryItemsByHotel(hotelId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory items" });
    }
  });

  app.get("/api/hotels/:hotelId/inventory/low-stock", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user as any;
      
      // SECURITY: Verify user can access this hotel's inventory
      if (currentUser.role?.name !== 'super_admin' && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const items = await storage.getLowStockItems(hotelId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch low stock items" });
    }
  });

  // Vendor routes
  app.get("/api/hotels/:hotelId/vendors", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user as any;
      
      // SECURITY: Verify user can access this hotel's vendors
      if (currentUser.role?.name !== 'super_admin' && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const vendors = await storage.getVendorsByHotel(hotelId);
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  // Restaurant table routes
  app.get("/api/hotels/:hotelId/restaurant-tables", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user as any;
      
      // SECURITY: Verify user can access this hotel's restaurant tables
      if (currentUser.role?.name !== 'super_admin' && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const tables = await storage.getRestaurantTablesByHotel(hotelId);
      res.json(tables);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch restaurant tables" });
    }
  });

  // Tax routes
  app.get("/api/hotels/:hotelId/taxes", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user as any;
      
      // SECURITY: Verify user can access this hotel's taxes
      if (currentUser.role?.name !== 'super_admin' && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const taxes = await storage.getHotelTaxes(hotelId);
      res.json(taxes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hotel taxes" });
    }
  });

  app.put("/api/hotels/:hotelId/taxes/:taxType", requireActiveUser, async (req, res) => {
    try {
      const { hotelId, taxType } = req.params;
      const { isActive, percent } = req.body;
      const currentUser = req.user as any;
      
      // SECURITY: Verify user can access this hotel
      if (currentUser.role?.name !== 'super_admin' && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // CRITICAL: Only owner can modify tax settings to prevent tax evasion
      if (currentUser.role?.name !== 'owner' && currentUser.role?.name !== 'super_admin') {
        return res.status(403).json({ 
          message: "Only the hotel owner can modify tax settings" 
        });
      }
      
      // Log tax configuration changes for audit trail
      const existingTax = await storage.getHotelTax(hotelId, taxType);
      await storage.createTaxChangeLog({
        hotelId,
        taxType,
        previousPercent: existingTax?.percent || null,
        newPercent: percent !== undefined ? percent : null,
        previousActive: existingTax?.isActive ?? undefined,
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

  // Voucher routes
  app.get("/api/hotels/:hotelId/vouchers", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user as any;
      
      // SECURITY: Verify user can access this hotel's vouchers
      if (currentUser.role?.name !== 'super_admin' && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const vouchers = await storage.getVouchersByHotel(hotelId);
      res.json(vouchers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vouchers" });
    }
  });

  app.post("/api/vouchers", requireActiveUser, async (req, res) => {
    try {
      const currentUser = req.user as any;
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

  app.post("/api/vouchers/validate", requireActiveUser, async (req, res) => {
    try {
      const { code } = req.body;
      const currentUser = req.user as any;
      
      if (!code || typeof code !== 'string') {
        return res.json({ valid: false, message: "Voucher code required" });
      }
      
      // Find voucher by code
      const voucherList = await db
        .select()
        .from(vouchers)
        .where(eq(vouchers.code, code))
        .limit(1);
        
      if (!voucherList.length) {
        return res.json({ valid: false, message: "Voucher not found" });
      }

      const voucher = voucherList[0];
      
      // Verify hotel ownership
      if (voucher.hotelId !== currentUser.hotelId) {
        return res.json({ valid: false, message: "Voucher not found" });
      }

      // Check date validity
      const now = new Date();
      if (voucher.validFrom && new Date(voucher.validFrom) > now) {
        return res.json({ valid: false, message: "Voucher not yet valid" });
      }
      if (voucher.validUntil && new Date(voucher.validUntil) < now) {
        return res.json({ valid: false, message: "Voucher has expired" });
      }

      // CRITICAL: Check usage limit ATOMICALLY
      if (voucher.maxUses) {
        const currentUsage = Number(voucher.usedCount || 0);
        if (currentUsage >= Number(voucher.maxUses)) {
          return res.json({ valid: false, message: "Voucher usage limit reached" });
        }
      }

      // Return voucher details (but don't increment yet - that happens on redemption)
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

  app.post("/api/vouchers/redeem", requireActiveUser, async (req, res) => {
    try {
      const { voucherId } = req.body;
      const currentUser = req.user as any;
      
      // CRITICAL: Use database transaction for atomic operation with row locking
      const result = await db.transaction(async (tx) => {
        // Lock the voucher row for update (prevents concurrent redemption)
        const [voucher] = await tx
          .select()
          .from(vouchers)
          .where(eq(vouchers.id, voucherId))
          .for('update');
        
        if (!voucher) {
          throw new Error("Voucher not found");
        }
        
        // Verify hotel ownership
        if (voucher.hotelId !== currentUser.hotelId) {
          throw new Error("Voucher not found");
        }
        
        // Check date validity
        const now = new Date();
        if (voucher.validFrom && new Date(voucher.validFrom) > now) {
          throw new Error("Voucher not yet valid");
        }
        if (voucher.validUntil && new Date(voucher.validUntil) < now) {
          throw new Error("Voucher has expired");
        }
        
        // Check usage limit
        const currentUsage = Number(voucher.usedCount || 0);
        if (voucher.maxUses && currentUsage >= Number(voucher.maxUses)) {
          throw new Error("Voucher usage limit reached");
        }
        
        // CRITICAL: Atomically increment usage counter
        const [updated] = await tx
          .update(vouchers)
          .set({ 
            usedCount: sql`${vouchers.usedCount} + 1`
          })
          .where(eq(vouchers.id, voucherId))
          .returning();
        
        return updated;
      });

      res.json({ success: true, voucher: result });
    } catch (error: any) {
      console.error("Voucher redemption error:", error);
      res.status(400).json({ message: error.message || "Failed to redeem voucher" });
    }
  });

  app.put("/api/vouchers/:id", requireActiveUser, async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.user as any;
      
      // First, fetch the existing voucher to verify ownership
      const existingVoucher = await db
        .select()
        .from(vouchers)
        .where(eq(vouchers.id, id))
        .limit(1);
        
      if (!existingVoucher.length) {
        return res.status(404).json({ message: "Voucher not found" });
      }
      
      // Verify hotel ownership
      if (existingVoucher[0].hotelId !== currentUser.hotelId) {
        return res.status(403).json({ message: "Cannot modify vouchers from other hotels" });
      }

      // Parse and sanitize the update data - prevent changing hotelId/createdBy
      const { hotelId, createdBy, ...sanitizedData } = req.body;
      const voucherData = insertVoucherSchema.partial().parse(sanitizedData);
      
      const voucher = await storage.updateVoucher(id, voucherData);
      res.json(voucher);
    } catch (error) {
      console.error("Voucher update error:", error);
      res.status(400).json({ message: "Failed to update voucher" });
    }
  });

  app.delete("/api/vouchers/:id", requireActiveUser, async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.user as any;
      
      // First, fetch the existing voucher to verify ownership
      const existingVoucher = await db
        .select()
        .from(vouchers)
        .where(eq(vouchers.id, id))
        .limit(1);
        
      if (!existingVoucher.length) {
        return res.status(404).json({ message: "Voucher not found" });
      }
      
      // Verify hotel ownership
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

  // Vehicle routes - specific routes must come before parameterized routes
  app.get("/api/hotels/current/vehicle-logs", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.json([]);
      }
      const logs = await storage.getVehicleLogsByHotel(user.hotelId);
      res.json(logs);
    } catch (error: any) {
      console.error("Vehicle logs fetch error:", error);
      res.status(500).json({ message: "Failed to fetch vehicle logs" });
    }
  });

  app.get("/api/hotels/:hotelId/vehicle-logs", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user as any;
      
      // SECURITY: Verify user can access this hotel's vehicle logs
      if (currentUser.role?.name !== 'super_admin' && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const logs = await storage.getVehicleLogsByHotel(hotelId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicle logs" });
    }
  });

  // Room service routes
  app.get("/api/hotels/current/room-service-orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const orders = await storage.getRoomServiceOrdersByHotel(user.hotelId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch room service orders" });
    }
  });

  app.get("/api/hotels/:hotelId/room-service-orders", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user as any;
      
      // SECURITY: Verify user can access this hotel's room service orders
      if (currentUser.role?.name !== 'super_admin' && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const orders = await storage.getRoomServiceOrdersByHotel(hotelId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch room service orders" });
    }
  });

  app.post("/api/room-service-orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }

      const orderData = {
        hotelId: user.hotelId,
        roomId: req.body.roomId,
        requestedBy: user.id,
        status: req.body.status || 'pending',
        specialInstructions: req.body.specialInstructions
      };
      
      const order = await storage.createRoomServiceOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      console.error("Room service order creation error:", error);
      res.status(400).json({ message: "Failed to create room service order" });
    }
  });

  // Leave request routes
  app.get("/api/hotels/current/leave-requests", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      const userRole = user.role?.name || '';
      const canViewAllRequests = ['manager', 'owner', 'super_admin'].includes(userRole);
      const isDepartmentHead = ['restaurant_bar_manager', 'housekeeping_supervisor', 'security_head'].includes(userRole);
      
      let leaveRequests;
      if (canViewAllRequests) {
        // Managers, owners, and super_admins can see all requests for the hotel
        leaveRequests = await storage.getLeaveRequestsForManager(user.hotelId);
      } else if (isDepartmentHead) {
        // Department heads can see requests from their subordinates (all statuses, not just pending)
        leaveRequests = await storage.getLeaveRequestsForApprover(userRole, user.hotelId);
      } else {
        // Regular staff can only see their own requests
        leaveRequests = await storage.getLeaveRequestsByUser(user.id);
      }
      
      res.json(leaveRequests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leave requests" });
    }
  });

  app.get("/api/hotels/current/leave-requests/my-requests", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.id) {
        return res.status(400).json({ message: "User not authenticated" });
      }
      const leaveRequests = await storage.getLeaveRequestsByUser(user.id);
      res.json(leaveRequests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user leave requests" });
    }
  });

  app.get("/api/hotels/current/leave-requests/pending-approvals", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      // Role-based authorization - approvers include department heads, manager, and owner
      const userRole = user.role?.name || '';
      const canViewApprovals = [
        'restaurant_bar_manager', 
        'housekeeping_supervisor', 
        'security_head', 
        'manager', 
        'owner'
      ].includes(userRole);
      
      if (!canViewApprovals) {
        return res.status(403).json({ message: "You don't have permission to view leave approvals" });
      }
      
      const leaveRequests = await storage.getPendingLeaveRequestsForApprover(userRole, user.hotelId);
      res.json(leaveRequests);
    } catch (error) {
      console.error("Failed to fetch pending leave requests:", error);
      res.status(500).json({ message: "Failed to fetch pending leave requests" });
    }
  });

  app.post("/api/hotels/current/leave-requests", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      // Validate user role has a valid approver in the hierarchy
      const userRole = user.role?.name || '';
      const roleHierarchy: Record<string, string> = {
        // Restaurant & Bar staff → Restaurant and Bar Manager
        'waiter': 'restaurant_bar_manager',
        'cashier': 'restaurant_bar_manager',
        'bartender': 'restaurant_bar_manager',
        'kitchen_staff': 'restaurant_bar_manager',
        'barista': 'restaurant_bar_manager',
        // Housekeeping staff → Housekeeping Supervisor
        'housekeeping_staff': 'housekeeping_supervisor',
        // Security staff → Security Head
        'security_guard': 'security_head',
        'surveillance_officer': 'security_head',
        // Department heads → Manager
        'restaurant_bar_manager': 'manager',
        'housekeeping_supervisor': 'manager',
        'security_head': 'manager',
        // Other staff → Manager
        'finance': 'manager',
        'front_desk': 'manager',
        'storekeeper': 'manager',
        // Manager → Owner
        'manager': 'owner'
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
        status: 'pending'
      });

      const currentYear = new Date().getFullYear();
      const startDate = new Date(leaveRequestData.startDate);
      const endDate = new Date(leaveRequestData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // CRITICAL: Prevent backdating leave requests
      if (startDate < today) {
        return res.status(400).json({ 
          message: "Cannot request leave for past dates. Contact your manager for backdated leave." 
        });
      }
      
      // Prevent far future dates (max 2 years ahead)
      const maxFutureDate = new Date(today);
      maxFutureDate.setFullYear(today.getFullYear() + 2);
      if (startDate > maxFutureDate || endDate > maxFutureDate) {
        return res.status(400).json({ 
          message: "Cannot request leave more than 2 years in advance" 
        });
      }
      
      // Validate date range
      if (endDate < startDate) {
        return res.status(400).json({ 
          message: "End date must be after start date" 
        });
      }
      
      // Calculate number of leave days
      const leaveDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      // Initialize leave balances if not exist
      await storage.initializeLeaveBalances(user.id, user.hotelId, currentYear);
      
      // Check leave balance
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
      
      // CRITICAL: Check for overlapping leave
      const overlapping = await storage.getOverlappingLeaves(user.id, startDate, endDate);
      if (overlapping.length > 0) {
        return res.status(400).json({ 
          message: "You have overlapping approved or pending leave for these dates" 
        });
      }
      
      const leaveRequest = await storage.createLeaveRequest(leaveRequestData);
      
      // Broadcast WebSocket event to notify approvers
      wsEvents.leaveRequestCreated(user.hotelId, leaveRequest);
      
      res.status(201).json(leaveRequest);
    } catch (error) {
      console.error("Leave request creation error:", error);
      res.status(400).json({ message: "Invalid leave request data" });
    }
  });

  app.post("/api/leave-requests/:id/approve", requireActiveUser, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }

      // Check if user has approval authority
      const userRole = user.role?.name || '';
      const canApprove = [
        'restaurant_bar_manager', 
        'housekeeping_supervisor', 
        'security_head', 
        'manager', 
        'owner', 
        'super_admin'
      ].includes(userRole);
      
      if (!canApprove) {
        return res.status(403).json({ message: "You don't have permission to approve leave requests" });
      }

      const { id } = req.params;
      const { managerNotes } = req.body;
      
      // Verify the leave request exists and belongs to this hotel
      const existingRequest = await storage.getLeaveRequest(id);
      if (!existingRequest || existingRequest.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      if (existingRequest.status !== 'pending') {
        return res.status(400).json({ message: "Leave request has already been processed" });
      }

      // Calculate leave days
      const startDate = new Date(existingRequest.startDate);
      const endDate = new Date(existingRequest.endDate);
      const leaveDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      const currentYear = new Date().getFullYear();
      
      if (!existingRequest.requestedBy) {
        return res.status(400).json({ message: "Leave request missing user information" });
      }
      
      // Get leave balance
      const balance = await storage.getLeaveBalance(existingRequest.requestedBy, existingRequest.leaveType, currentYear);
      if (!balance) {
        return res.status(400).json({ message: "Leave balance not found" });
      }

      // Deduct from balance
      const usedDays = parseFloat(balance.usedDays) + leaveDays;
      const remainingDays = parseFloat(balance.remainingDays) - leaveDays;
      
      await storage.updateLeaveBalance(balance.id, {
        usedDays: usedDays.toString(),
        remainingDays: remainingDays.toString()
      });

      // Update leave request
      const updateData: any = {
        status: 'approved',
        approvedBy: user.id,
        approvalDate: new Date()
      };
      if (managerNotes) {
        updateData.managerNotes = managerNotes;
      }
      const leaveRequest = await storage.updateLeaveRequest(id, updateData);

      // Create notification
      await storage.createNotification({
        hotelId: user.hotelId,
        userId: existingRequest.requestedBy,
        type: 'leave_approved',
        title: 'Leave Request Approved',
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

  app.post("/api/leave-requests/:id/reject", requireActiveUser, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }

      // Check if user has rejection authority
      const userRole = user.role?.name || '';
      const canReject = [
        'restaurant_bar_manager', 
        'housekeeping_supervisor', 
        'security_head', 
        'manager', 
        'owner', 
        'super_admin'
      ].includes(userRole);
      
      if (!canReject) {
        return res.status(403).json({ message: "You don't have permission to reject leave requests" });
      }

      const { id } = req.params;
      const { managerNotes } = req.body;
      
      // Verify the leave request exists and belongs to this hotel
      const existingRequest = await storage.getLeaveRequest(id);
      if (!existingRequest || existingRequest.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      if (existingRequest.status !== 'pending') {
        return res.status(400).json({ message: "Leave request has already been processed" });
      }

      // Update leave request
      const updateData: any = {
        status: 'rejected',
        approvedBy: user.id,
        approvalDate: new Date()
      };
      if (managerNotes) {
        updateData.managerNotes = managerNotes;
      }
      const leaveRequest = await storage.updateLeaveRequest(id, updateData);

      // Create notification
      const startDate = new Date(existingRequest.startDate);
      const endDate = new Date(existingRequest.endDate);
      
      await storage.createNotification({
        hotelId: user.hotelId,
        userId: existingRequest.requestedBy,
        type: 'leave_rejected',
        title: 'Leave Request Rejected',
        message: `Your ${existingRequest.leaveType} leave request from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()} has been rejected.${managerNotes ? ' Reason: ' + managerNotes : ''}`,
        relatedId: id,
        isRead: false
      });

      res.json(leaveRequest);
    } catch (error) {
      console.error("Leave request rejection error:", error);
      res.status(500).json({ message: "Failed to reject leave request" });
    }
  });

  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      const notifications = await storage.getNotificationsByUser(user.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      const notifications = await storage.getUnreadNotificationsByUser(user.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread notifications" });
    }
  });

  app.post("/api/notifications/:id/read", async (req, res) => {
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

  app.post("/api/notifications/read-all", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      await storage.markAllNotificationsAsRead(user.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Leave balance routes
  app.get("/api/leave-balances", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      
      // Initialize balances if not exist
      await storage.initializeLeaveBalances(user.id, user.hotelId, year);
      
      const balances = await storage.getLeaveBalancesByUser(user.id, year);
      res.json(balances);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leave balances" });
    }
  });

  // Leave policy routes (Owner only)
  app.get("/api/hotels/current/leave-policies", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      const policies = await storage.getLeavePoliciesByHotel(user.hotelId);
      res.json(policies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leave policies" });
    }
  });

  app.post("/api/hotels/current/leave-policies", requireActiveUser, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }

      const userRole = user.role?.name || '';
      if (userRole !== 'owner') {
        return res.status(403).json({ message: "Only hotel owners can create leave policies" });
      }

      const policyData = insertLeavePolicySchema.parse({
        ...req.body,
        hotelId: user.hotelId
      });

      const policy = await storage.createLeavePolicy(policyData);
      res.json(policy);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid policy data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create leave policy" });
    }
  });

  app.patch("/api/leave-policies/:id", requireActiveUser, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }

      const userRole = user.role?.name || '';
      if (userRole !== 'owner') {
        return res.status(403).json({ message: "Only hotel owners can update leave policies" });
      }

      const { id } = req.params;
      const policy = await storage.updateLeavePolicy(id, req.body);
      res.json(policy);
    } catch (error) {
      res.status(500).json({ message: "Failed to update leave policy" });
    }
  });

  app.delete("/api/leave-policies/:id", requireActiveUser, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }

      const userRole = user.role?.name || '';
      if (userRole !== 'owner') {
        return res.status(403).json({ message: "Only hotel owners can delete leave policies" });
      }

      const { id } = req.params;
      await storage.deleteLeavePolicy(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete leave policy" });
    }
  });

  // Stock request routes
  app.get("/api/hotels/current/stock-requests", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      const userRole = user.role?.name || '';
      const canViewAll = ['manager', 'owner', 'storekeeper'].includes(userRole);
      
      if (!canViewAll) {
        return res.status(403).json({ message: "Only manager, owner, or storekeeper can view all stock requests" });
      }
      
      const requests = await storage.getStockRequestsByHotel(user.hotelId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock requests" });
    }
  });

  app.get("/api/hotels/current/stock-requests/my-requests", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      const requests = await storage.getStockRequestsByUser(user.id);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock requests" });
    }
  });

  app.get("/api/hotels/current/stock-requests/pending", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      const userRole = user.role?.name || '';
      if (userRole !== 'storekeeper') {
        return res.status(403).json({ message: "Only storekeeper can view pending stock requests" });
      }
      
      const requests = await storage.getPendingStockRequestsForStorekeeper(user.hotelId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending stock requests" });
    }
  });

  app.get("/api/hotels/current/stock-requests/department", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      const userRole = user.role?.name || '';
      let department = req.query.department as string;
      
      if (userRole === 'restaurant_bar_manager') {
        department = 'restaurant_bar';
      } else if (userRole === 'housekeeping_supervisor') {
        department = 'housekeeping';
      } else if (userRole === 'security_head') {
        department = 'security';
      } else if (!['manager', 'owner', 'super_admin'].includes(userRole)) {
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

  app.post("/api/hotels/current/stock-requests", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      const userRole = user.role?.name || '';
      
      // Determine department based on role
      let department = '';
      if (['bartender', 'kitchen_staff', 'barista', 'waiter', 'cashier', 'restaurant_bar_manager'].includes(userRole)) {
        department = 'restaurant_bar';
      } else if (['housekeeping_staff', 'housekeeping_supervisor'].includes(userRole)) {
        department = 'housekeeping';
      } else if (['security_guard', 'surveillance_officer', 'security_head'].includes(userRole)) {
        department = 'security';
      } else if (['storekeeper', 'finance', 'front_desk', 'manager', 'owner'].includes(userRole)) {
        department = 'general';
      } else {
        return res.status(403).json({ message: "Your role is not authorized to request stock" });
      }
      
      const requestData = insertStockRequestSchema.parse({
        ...req.body,
        hotelId: user.hotelId,
        requestedBy: user.id,
        department,
        status: 'pending'
      });
      
      const request = await storage.createStockRequest(requestData);
      
      // Broadcast WebSocket event to storekeeper and managers
      wsEvents.stockRequestCreated(user.hotelId, request);
      
      res.status(201).json(request);
    } catch (error) {
      console.error("Stock request creation error:", error);
      res.status(400).json({ message: "Invalid stock request data" });
    }
  });

  app.patch("/api/hotels/current/stock-requests/:id/approve", requireActiveUser, async (req, res) => {
    try {
      const user = req.user as any;
      const { id } = req.params;
      
      // Only storekeeper, manager, and owner can approve
      const canApprove = ['storekeeper', 'manager', 'owner'].includes(user.role?.name || '');
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
      
      if (stockRequest.status !== 'pending') {
        return res.status(400).json({ message: "Only pending requests can be approved" });
      }
      
      // CRITICAL: Verify sufficient inventory before approval
      const inventoryItem = await storage.getInventoryItem(stockRequest.itemId);
      if (!inventoryItem) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      const currentStock = Number(inventoryItem.baseStockQty || inventoryItem.stockQty || 0);
      const requestedQty = Number(stockRequest.quantity || 0);
      
      // Convert units if needed
      let requestedInBaseUnit = requestedQty;
      if (stockRequest.unit && stockRequest.unit !== inventoryItem.baseUnit) {
        const { convertToBase } = await import('@shared/measurements');
        const category = (inventoryItem.measurementCategory || 'weight') as any;
        
        try {
          requestedInBaseUnit = convertToBase(
            requestedQty,
            stockRequest.unit as any,
            (inventoryItem.baseUnit || 'kg') as any,
            category,
            inventoryItem.conversionProfile as any
          );
        } catch (error) {
          console.error('Unit conversion error:', error);
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
      
      // Approve the request
      const approvedRequest = await storage.approveStockRequest(id, user.id);
      
      // Broadcast WebSocket event
      wsEvents.stockRequestUpdated(user.hotelId, approvedRequest);
      
      res.json(approvedRequest);
    } catch (error) {
      console.error("Stock request approval error:", error);
      res.status(500).json({ message: "Failed to approve stock request" });
    }
  });

  app.patch("/api/hotels/current/stock-requests/:id/deliver", requireActiveUser, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      const userRole = user.role?.name || '';
      if (userRole !== 'storekeeper') {
        return res.status(403).json({ message: "Only storekeeper can deliver stock requests" });
      }
      
      const { id } = req.params;
      const existingRequest = await storage.getStockRequest(id);
      if (!existingRequest || existingRequest.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Stock request not found" });
      }
      
      if (existingRequest.status !== 'approved') {
        return res.status(400).json({ message: "Can only deliver approved stock requests" });
      }
      
      const request = await storage.deliverStockRequest(id, user.id);
      
      // Broadcast WebSocket event
      wsEvents.stockRequestUpdated(user.hotelId, request);
      
      res.json(request);
    } catch (error) {
      console.error("Stock request delivery error:", error);
      res.status(400).json({ message: "Failed to deliver stock request" });
    }
  });

  app.post("/api/hotels/current/vehicle-logs", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      // Validate request body first, then add server-controlled fields
      const validatedData = insertVehicleLogSchema.parse(req.body);
      const logData = {
        ...validatedData,
        hotelId: user.hotelId,
        recordedBy: user.id
      };
      const log = await storage.createVehicleLog(logData);
      res.status(201).json(log);
    } catch (error) {
      console.error("Vehicle log creation error:", error);
      res.status(400).json({ message: "Invalid vehicle log data" });
    }
  });

  app.patch("/api/vehicle-logs/:id/checkout", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const currentUser = req.user as any;
      const { id } = req.params;
      const { checkoutTime } = req.body;
      
      const log = await storage.getVehicleLog(id);
      if (!log || log.hotelId !== currentUser.hotelId) {
        return res.status(404).json({ message: "Vehicle log not found" });
      }
      
      if (log.checkOut) {
        return res.status(400).json({ message: "Vehicle already checked out" });
      }
      
      // Check authorization (only creator or Security Head can checkout)
      const userRole = currentUser.role?.name || '';
      const isAuthorized = log.recordedBy === currentUser.id || userRole === 'security_head';
      
      if (!isAuthorized) {
        return res.status(403).json({ message: "Unauthorized to checkout this vehicle" });
      }
      
      // CRITICAL: Prevent immediate checkout (suspicious pattern)
      const checkinTime = log.checkIn ? new Date(log.checkIn) : new Date();
      const checkout = checkoutTime ? new Date(checkoutTime) : new Date();
      const minutesDiff = (checkout.getTime() - checkinTime.getTime()) / (1000 * 60);
      
      // If checkout is less than 5 minutes after checkin
      if (minutesDiff < 5) {
        const canOverride = ['manager', 'owner', 'security_head'].includes(currentUser.role?.name || '');
        
        if (!canOverride) {
          return res.status(400).json({ 
            message: "Suspicious checkout timing. Vehicle was checked in less than 5 minutes ago. Contact security supervisor." 
          });
        }
        
        // Log quick checkout for review
        await storage.createSecurityAlert({
          hotelId: log.hotelId,
          type: 'quick_vehicle_checkout',
          description: `Vehicle ${log.vehicleNumber} checked out ${minutesDiff.toFixed(1)} minutes after check-in`,
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

  // Security Head routes - Create Surveillance Officer
  app.post("/api/hotels/current/security/officers", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      // Only Security Head can create Surveillance Officers
      const userRole = user.role?.name || '';
      if (userRole !== 'security_head') {
        return res.status(403).json({ message: "Only Security Head can create Surveillance Officers" });
      }
      
      // Get the Surveillance Officer role
      const officerRole = await storage.getRoleByName('surveillance_officer');
      if (!officerRole) {
        return res.status(400).json({ message: "Surveillance Officer role not found" });
      }
      
      const { username, password, email, phone } = req.body;
      
      // Validate required fields
      if (!username || !password || !email || !phone) {
        return res.status(400).json({ message: "Username, password, email, and phone are required" });
      }
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      // Hash password using standard hashPassword function
      const { hashPassword } = await import("./auth.js");
      const passwordHash = await hashPassword(password);
      
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
      
      // Sanitize response
      const { passwordHash: _, ...sanitizedOfficer } = officer;
      res.status(201).json(sanitizedOfficer);
    } catch (error) {
      console.error("Officer creation error:", error);
      res.status(400).json({ message: "Failed to create Surveillance Officer" });
    }
  });

  // Security Head routes - Get Surveillance Officers
  app.get("/api/hotels/current/security/officers", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      // Only Security Head can view officers
      const userRole = user.role?.name || '';
      if (userRole !== 'security_head') {
        return res.status(403).json({ message: "Only Security Head can view Surveillance Officers" });
      }
      
      const allUsers = await storage.getUsersByHotel(user.hotelId);
      const officers = allUsers.filter(u => u.role?.name === 'surveillance_officer');
      res.json(officers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Surveillance Officers" });
    }
  });

  // Security Head routes - Create task for officer
  app.post("/api/hotels/current/security/tasks", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      // Only Security Head can create officer tasks
      const userRole = user.role?.name || '';
      if (userRole !== 'security_head') {
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

  // Security routes - Get tasks (Head sees all officer tasks, Officer sees assigned tasks)
  app.get("/api/hotels/current/security/tasks", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      const userRole = user.role?.name || '';
      
      if (userRole === 'security_head') {
        // Security Head sees all tasks
        const allTasks = await storage.getTasksByHotel(user.hotelId);
        res.json(allTasks);
      } else if (userRole === 'surveillance_officer') {
        // Surveillance Officer sees only assigned tasks
        const myTasks = await storage.getTasksByUser(user.id);
        res.json(myTasks);
      } else {
        return res.status(403).json({ message: "Unauthorized" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Update task status (for Surveillance Officer)
  app.patch("/api/tasks/:id/status", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      const { id } = req.params;
      const { status } = req.body;
      
      // Verify the task exists
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Check if user is assigned to this task or is the creator
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

  // Forward maintenance request to finance (Security Head only)
  app.post("/api/maintenance-requests/:id/forward", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      const { id } = req.params;
      const { financeUserId } = req.body;
      
      // Only Security Head can forward requests
      const userRole = user.role?.name || '';
      if (userRole !== 'security_head') {
        return res.status(403).json({ message: "Only Security Head can forward maintenance requests" });
      }
      
      // Verify the maintenance request exists and belongs to this hotel
      const request = await storage.getMaintenanceRequest(id);
      if (!request || request.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Maintenance request not found" });
      }
      
      // Verify the finance user exists
      const financeUser = await storage.getUser(financeUserId);
      if (!financeUser || financeUser.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Finance user not found" });
      }
      
      // Update the maintenance request
      const updatedRequest = await storage.updateMaintenanceRequest(id, {
        assignedTo: financeUserId,
        status: 'forwarded'
      });
      
      res.json(updatedRequest);
    } catch (error) {
      console.error("Maintenance forward error:", error);
      res.status(400).json({ message: "Failed to forward maintenance request" });
    }
  });

  // Duty status toggle (for any user)
  app.patch("/api/users/me/duty", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      const { isOnline } = req.body;
      
      if (typeof isOnline !== 'boolean') {
        return res.status(400).json({ message: "Invalid duty status" });
      }
      
      // CRITICAL: Verify user is still active - prevent deactivated users from going online
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

  // Meal plan routes
  app.get("/api/hotels/current/meal-plans", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const plans = await storage.getMealPlansByHotel(user.hotelId);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meal plans" });
    }
  });

  app.get("/api/hotels/:hotelId/meal-plans", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user as any;
      
      // SECURITY: Verify user can access this hotel's meal plans
      if (currentUser.role?.name !== 'super_admin' && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const plans = await storage.getMealPlansByHotel(hotelId);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meal plans" });
    }
  });

  app.post("/api/hotels/:hotelId/meal-plans", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      const { hotelId } = req.params;
      
      // Only managers, owners, and super_admins can create meal plans
      const userRole = user.role?.name || '';
      const canManage = ['manager', 'owner', 'super_admin'].includes(userRole);
      
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

  app.put("/api/hotels/:hotelId/meal-plans/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      const { id, hotelId } = req.params;
      
      // Only managers, owners, and super_admins can update meal plans
      const userRole = user.role?.name || '';
      const canManage = ['manager', 'owner', 'super_admin'].includes(userRole);
      
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

  app.delete("/api/hotels/:hotelId/meal-plans/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      const { id, hotelId } = req.params;
      
      // Only managers, owners, and super_admins can delete meal plans
      const userRole = user.role?.name || '';
      const canManage = ['manager', 'owner', 'super_admin'].includes(userRole);
      
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

  // Meal voucher routes
  app.post("/api/meal-vouchers/generate", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const { roomId, guestName, mealPlanId, mealPlanType, numberOfPersons, checkInDate, checkOutDate, hotelId } = req.body;
      
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)));
      
      const vouchers = [];
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
          status: 'unused'
        });
        vouchers.push(voucher);
      }
      
      res.json({ success: true, vouchers });
    } catch (error) {
      console.error("Meal voucher generation error:", error);
      res.status(500).json({ message: "Failed to generate meal vouchers" });
    }
  });

  app.get("/api/hotels/current/meal-vouchers", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      const { status, date } = req.query;
      
      const vouchers = await storage.getMealVouchers(user.hotelId, {
        status: status as string,
        date: date ? new Date(date as string) : undefined
      });
      
      res.json(vouchers);
    } catch (error) {
      console.error("Get meal vouchers error:", error);
      res.status(500).json({ message: "Failed to get meal vouchers" });
    }
  });

  app.get("/api/hotels/:hotelId/meal-vouchers", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const { hotelId } = req.params;
      const { status, date } = req.query;
      
      const vouchers = await storage.getMealVouchers(hotelId, {
        status: status as string,
        date: date ? new Date(date as string) : undefined
      });
      
      res.json(vouchers);
    } catch (error) {
      console.error("Get meal vouchers error:", error);
      res.status(500).json({ message: "Failed to get meal vouchers" });
    }
  });

  app.get("/api/meal-vouchers/room/:roomId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const { roomId } = req.params;
      const vouchers = await storage.getMealVouchersByRoom(roomId);
      
      res.json(vouchers);
    } catch (error) {
      console.error("Get room meal vouchers error:", error);
      res.status(500).json({ message: "Failed to get room meal vouchers" });
    }
  });

  app.post("/api/meal-vouchers/:id/redeem", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const user = req.user as any;
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

  // Hall booking routes
  app.get("/api/hotels/current/hall-bookings", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
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

  app.get("/api/hotels/:hotelId/hall-bookings", requireActiveUser, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const currentUser = req.user as any;
      
      // SECURITY: Verify user can access this hotel's hall bookings
      if (currentUser.role?.name !== 'super_admin' && currentUser.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const bookings = await storage.getHallBookingsByHotel(hotelId);
      res.json(bookings);
    } catch (error) {
      console.error("Get hall bookings error:", error);
      res.status(500).json({ message: "Failed to get hall bookings" });
    }
  });

  app.get("/api/halls/:hallId/bookings", requireActiveUser, async (req, res) => {
    try {
      const { hallId } = req.params;
      const currentUser = req.user as any;
      
      // SECURITY: Verify hall belongs to user's hotel
      const hall = await storage.getHall(hallId);
      if (!hall) {
        return res.status(404).json({ message: "Hall not found" });
      }
      
      if (currentUser.role?.name !== 'super_admin' && currentUser.hotelId !== hall.hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const bookings = await storage.getHallBookingsByHall(hallId);
      res.json(bookings);
    } catch (error) {
      console.error("Get hall bookings by hall error:", error);
      res.status(500).json({ message: "Failed to get hall bookings" });
    }
  });

  app.get("/api/hall-bookings/:id", async (req, res) => {
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

  app.post("/api/halls/:hallId/check-availability", async (req, res) => {
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

  app.post("/api/hotels/:hotelId/hall-bookings", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      const { hotelId } = req.params;
      
      const userRole = user.role?.name || '';
      const canManage = ['manager', 'owner', 'super_admin'].includes(userRole);
      
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

  app.put("/api/hall-bookings/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      const { id } = req.params;
      
      const userRole = user.role?.name || '';
      const canManage = ['manager', 'owner', 'super_admin'].includes(userRole);
      const isFinance = userRole === 'finance';
      const isCashier = userRole === 'cashier';
      const isFrontDesk = userRole === 'front_desk';
      
      // Cashier and front desk have no update permissions
      if (isCashier || isFrontDesk) {
        return res.status(403).json({ message: "Only managers and owners can update bookings" });
      }
      
      const booking = await storage.getHallBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const bookingData = insertHallBookingSchema.partial().parse(req.body);
      
      // Finance can only update payment-related fields
      if (isFinance) {
        const paymentFields = ['totalAmount', 'advancePaid', 'balanceDue', 'paymentMethod'];
        const requestedFields = Object.keys(bookingData);
        const hasNonPaymentFields = requestedFields.some(field => !paymentFields.includes(field));
        
        if (hasNonPaymentFields) {
          return res.status(403).json({ message: "Finance can only update payment-related fields" });
        }
      }
      
      // Check availability only for managers/front desk when changing dates
      if (canManage && (bookingData.bookingStartTime || bookingData.bookingEndTime)) {
        const startTime = bookingData.bookingStartTime || booking.bookingStartTime!;
        const endTime = bookingData.bookingEndTime || booking.bookingEndTime!;
        
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
      
      // Managers and front desk can update all fields
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

  app.post("/api/hall-bookings/:id/confirm", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      const { id } = req.params;
      
      const userRole = user.role?.name || '';
      const canConfirm = ['manager', 'owner', 'super_admin'].includes(userRole);
      
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

  app.post("/api/hall-bookings/:id/cancel", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      const { id } = req.params;
      const { reason } = req.body;
      
      const userRole = user.role?.name || '';
      const canCancel = ['manager', 'owner', 'super_admin'].includes(userRole);
      
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

  // PATCH endpoint for final billing updates
  app.patch("/api/hotels/:hotelId/hall-bookings/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      const { hotelId, id } = req.params;
      
      if (user.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const userRole = user.role?.name || '';
      const canManage = ['manager', 'owner', 'super_admin', 'front_desk', 'finance', 'cashier'].includes(userRole);
      
      if (!canManage) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const booking = await storage.getHallBooking(id);
      if (!booking || booking.hotelId !== hotelId) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const updateData: any = {};
      if (req.body.actualNumberOfPeople !== undefined) updateData.actualNumberOfPeople = req.body.actualNumberOfPeople;
      if (req.body.customServices !== undefined) updateData.customServices = req.body.customServices;
      if (req.body.totalAmount !== undefined) updateData.totalAmount = req.body.totalAmount;
      if (req.body.balanceDue !== undefined) updateData.balanceDue = req.body.balanceDue;
      if (req.body.paymentMethod !== undefined) updateData.paymentMethod = req.body.paymentMethod;
      if (req.body.status !== undefined) updateData.status = req.body.status;
      if (req.body.status === 'completed') updateData.finalizedBy = user.id;
      if (req.body.status === 'completed') updateData.finalizedAt = new Date();
      
      const updatedBooking = await storage.updateHallBooking(id, updateData);
      res.json(updatedBooking);
    } catch (error) {
      console.error("Update hall booking error:", error);
      res.status(400).json({ message: "Failed to update hall booking" });
    }
  });

  // POST endpoint for recording booking payments
  app.post("/api/hotels/:hotelId/booking-payments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      const { hotelId } = req.params;
      
      if (user.hotelId !== hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const userRole = user.role?.name || '';
      const canRecord = ['manager', 'owner', 'super_admin', 'front_desk', 'finance', 'cashier'].includes(userRole);
      
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

  // Hall availability calendar endpoint
  app.get("/api/halls/:hallId/calendar", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      const { hallId } = req.params;
      const { date } = req.query;
      
      // Verify hall belongs to user's hotel
      const hall = await db.query.halls.findFirst({
        where: and(
          eq(halls.id, hallId),
          eq(halls.hotelId, user.hotelId)
        )
      });
      
      if (!hall) {
        return res.status(404).json({ message: "Hall not found" });
      }
      
      const targetDate = date ? new Date(date as string) : new Date();
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const bookings = await db.query.hallBookings.findMany({
        where: and(
          eq(hallBookings.hallId, hallId),
          eq(hallBookings.hotelId, user.hotelId),
          sql`${hallBookings.bookingStartTime} < ${endOfDay.toISOString()}`,
          sql`${hallBookings.bookingEndTime} > ${startOfDay.toISOString()}`
        ),
        with: {
          guest: true
        }
      });
      
      const slots = bookings.map(booking => ({
        id: booking.id,
        startTime: booking.bookingStartTime,
        endTime: booking.bookingEndTime,
        status: booking.status,
        customerName: booking.customerName,
        color: booking.status === 'confirmed' ? 'red' : 
               booking.status === 'in_progress' ? 'yellow' : 'gray'
      }));
      
      res.json({ date: targetDate, slots });
    } catch (error) {
      console.error("Get hall calendar error:", error);
      res.status(500).json({ message: "Failed to get hall calendar" });
    }
  });

  // Quick availability check with suggestions
  app.post("/api/halls/check-availability-quick", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      const { hallId, date, startTime, endTime } = req.body;
      
      // Verify hall belongs to user's hotel
      const hall = await db.query.halls.findFirst({
        where: and(
          eq(halls.id, hallId),
          eq(halls.hotelId, user.hotelId)
        )
      });
      
      if (!hall) {
        return res.status(404).json({ message: "Hall not found" });
      }
      
      const start = new Date(`${date}T${startTime}:00`);
      const end = new Date(`${date}T${endTime}:00`);
      
      const isAvailable = await storage.checkHallAvailability(hallId, start, end);
      
      let suggestions: Array<{ startTime: string; endTime: string }> = [];
      if (!isAvailable) {
        // Find alternative slots on the same day
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        
        const bookings = await db.query.hallBookings.findMany({
          where: and(
            eq(hallBookings.hallId, hallId),
            eq(hallBookings.hotelId, user.hotelId),
            ne(hallBookings.status, 'cancelled'),
            sql`${hallBookings.bookingStartTime} < ${dayEnd.toISOString()}`,
            sql`${hallBookings.bookingEndTime} > ${dayStart.toISOString()}`
          ),
          orderBy: [asc(hallBookings.bookingStartTime)]
        });
        
        // Suggest slots between bookings
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
        const slots = [];
        
        let currentTime = new Date(dayStart);
        currentTime.setHours(6, 0, 0, 0); // Start from 6 AM
        
        for (const booking of bookings) {
          const bookingStart = new Date(booking.bookingStartTime!);
          const gap = (bookingStart.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
          
          if (gap >= duration) {
            slots.push({
              startTime: currentTime.toISOString(),
              endTime: new Date(currentTime.getTime() + duration * 60 * 60 * 1000).toISOString()
            });
          }
          currentTime = new Date(booking.bookingEndTime!);
        }
        
        // Check if there's time left at the end of the day
        const endOfOperations = new Date(dayStart);
        endOfOperations.setHours(22, 0, 0, 0); // Until 10 PM
        const finalGap = (endOfOperations.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
        
        if (finalGap >= duration) {
          slots.push({
            startTime: currentTime.toISOString(),
            endTime: new Date(currentTime.getTime() + duration * 60 * 60 * 1000).toISOString()
          });
        }
        
        suggestions = slots.slice(0, 3); // Return top 3 suggestions
      }
      
      res.json({ available: isAvailable, suggestions });
    } catch (error) {
      console.error("Quick availability check error:", error);
      res.status(500).json({ message: "Failed to check availability" });
    }
  });

  // Guest lookup/search endpoint
  app.get("/api/guests/search", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      const { phone, email } = req.query;
      
      if (!phone && !email) {
        return res.status(400).json({ message: "Phone or email is required" });
      }
      
      let guest = null;
      
      if (phone) {
        guest = await db.query.guests.findFirst({
          where: and(
            eq(guests.hotelId, user.hotelId),
            eq(guests.phone, phone as string)
          )
        });
      } else if (email) {
        guest = await db.query.guests.findFirst({
          where: and(
            eq(guests.hotelId, user.hotelId),
            eq(guests.email, email as string)
          )
        });
      }
      
      res.json(guest || null);
    } catch (error) {
      console.error("Guest search error:", error);
      res.status(500).json({ message: "Failed to search guest" });
    }
  });

  // Service Package endpoints
  app.get("/api/service-packages", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      
      const packages = await db.query.servicePackages.findMany({
        where: eq(servicePackages.hotelId, user.hotelId)
      });
      
      res.json(packages);
    } catch (error) {
      console.error("Get service packages error:", error);
      res.status(500).json({ message: "Failed to get service packages" });
    }
  });

  app.post("/api/service-packages", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      
      const userRole = user.role?.name || '';
      const canManage = ['manager', 'owner', 'super_admin'].includes(userRole);
      
      if (!canManage) {
        return res.status(403).json({ message: "Only managers can create service packages" });
      }
      
      const packageData = insertServicePackageSchema.parse({
        ...req.body,
        hotelId: user.hotelId
      });
      
      const [newPackage] = await db.insert(servicePackages)
        .values(packageData)
        .returning();
      
      res.status(201).json(newPackage);
    } catch (error) {
      console.error("Create service package error:", error);
      res.status(400).json({ message: "Failed to create service package" });
    }
  });

  app.put("/api/service-packages/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      const { id } = req.params;
      
      const userRole = user.role?.name || '';
      const canManage = ['manager', 'owner', 'super_admin'].includes(userRole);
      
      if (!canManage) {
        return res.status(403).json({ message: "Only managers can update service packages" });
      }
      
      const packageData = insertServicePackageSchema.partial().parse(req.body);
      
      const [updated] = await db.update(servicePackages)
        .set({ ...packageData, updatedAt: new Date() })
        .where(and(
          eq(servicePackages.id, id),
          eq(servicePackages.hotelId, user.hotelId)
        ))
        .returning();
      
      if (!updated) {
        return res.status(404).json({ message: "Service package not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Update service package error:", error);
      res.status(400).json({ message: "Failed to update service package" });
    }
  });

  app.delete("/api/service-packages/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      const { id } = req.params;
      
      const userRole = user.role?.name || '';
      const canManage = ['manager', 'owner', 'super_admin'].includes(userRole);
      
      if (!canManage) {
        return res.status(403).json({ message: "Only managers can delete service packages" });
      }
      
      await db.delete(servicePackages)
        .where(and(
          eq(servicePackages.id, id),
          eq(servicePackages.hotelId, user.hotelId)
        ));
      
      res.status(204).send();
    } catch (error) {
      console.error("Delete service package error:", error);
      res.status(400).json({ message: "Failed to delete service package" });
    }
  });

  // Payment recording endpoints
  app.get("/api/bookings/:bookingId/payments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { bookingId } = req.params;
      
      const payments = await db.query.bookingPayments.findMany({
        where: eq(bookingPayments.bookingId, bookingId),
        with: {
          recordedBy: {
            columns: {
              id: true,
              username: true
            }
          }
        },
        orderBy: [asc(bookingPayments.createdAt)]
      });
      
      res.json(payments);
    } catch (error) {
      console.error("Get booking payments error:", error);
      res.status(500).json({ message: "Failed to get booking payments" });
    }
  });

  app.post("/api/bookings/:bookingId/payments", requireActiveUser, async (req, res) => {
    try {
      const user = req.user as any;
      const { bookingId } = req.params;
      
      const userRole = user.role?.name || '';
      const canRecord = ['manager', 'owner', 'super_admin', 'front_desk', 'cashier', 'finance'].includes(userRole);
      
      if (!canRecord) {
        return res.status(403).json({ message: "Insufficient permissions to record payments" });
      }
      
      // Get the booking to update balance
      const booking = await db.query.hallBookings.findFirst({
        where: eq(hallBookings.id, bookingId)
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
      
      const [payment] = await db.insert(bookingPayments)
        .values(paymentData)
        .returning();
      
      // Update booking's advance paid and balance due
      const newAdvancePaid = Number(booking.advancePaid || 0) + Number(paymentData.amount);
      const newBalanceDue = Number(booking.totalAmount) - newAdvancePaid;
      
      await db.update(hallBookings)
        .set({
          advancePaid: newAdvancePaid.toString(),
          balanceDue: newBalanceDue.toString(),
          updatedAt: new Date()
        })
        .where(eq(hallBookings.id, bookingId));
      
      res.status(201).json(payment);
    } catch (error) {
      console.error("Record payment error:", error);
      res.status(400).json({ message: "Failed to record payment" });
    }
  });

  // Attendance routes
  app.post("/api/attendance/clock-in", requireActiveUser, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }

      const canClockInResult = await storage.canClockIn(user.id);
      if (!canClockInResult.canClockIn) {
        return res.status(400).json({ message: canClockInResult.reason || "Cannot clock in" });
      }

      const { location } = req.body;
      const ip = req.ip || req.socket.remoteAddress || null;
      const source = req.body.source || 'web';
      const clockInTime = new Date();

      const attendanceRecord = await storage.createAttendance(
        user.id,
        user.hotelId,
        clockInTime,
        location || null,
        ip,
        source
      );

      await storage.updateUserOnlineStatus(user.id, true);

      // Broadcast real-time attendance update
      wsEvents.attendanceUpdated(user.hotelId, attendanceRecord);

      res.status(201).json(attendanceRecord);
    } catch (error) {
      console.error("Clock-in error:", error);
      res.status(500).json({ message: "Failed to clock in" });
    }
  });

  app.post("/api/attendance/clock-out", requireActiveUser, async (req, res) => {
    try {
      const user = req.user as any;
      
      const activeAttendance = await storage.getActiveAttendance(user.id);
      if (!activeAttendance) {
        return res.status(400).json({ message: "No active clock-in found" });
      }

      const { location } = req.body;
      const ip = req.ip || req.socket.remoteAddress || null;
      const source = req.body.source || 'web';
      const clockOutTime = new Date();

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

      // Broadcast real-time attendance update
      wsEvents.attendanceUpdated(user.hotelId, updatedRecord);

      res.json(updatedRecord);
    } catch (error) {
      console.error("Clock-out error:", error);
      res.status(500).json({ message: "Failed to clock out" });
    }
  });

  app.get("/api/attendance/history", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const user = req.user as any;
      
      const { startDate, endDate } = req.query;
      
      let start: Date | undefined;
      let end: Date | undefined;
      
      if (startDate && typeof startDate === 'string') {
        start = new Date(startDate);
      }
      if (endDate && typeof endDate === 'string') {
        end = new Date(endDate);
      }
      
      if (!start) {
        const now = new Date();
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      
      const records = await storage.getAttendanceByUser(user.id, start, end);
      res.json(records);
    } catch (error) {
      console.error("Get attendance history error:", error);
      res.status(500).json({ message: "Failed to fetch attendance history" });
    }
  });

  app.get("/api/attendance/daily", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }

      const userRole = user.role?.name || '';
      const managerRoles = ['super_admin', 'owner', 'manager', 'housekeeping_supervisor', 'restaurant_bar_manager', 'security_head', 'finance'];
      
      if (!managerRoles.includes(userRole)) {
        return res.status(403).json({ message: "Only managers can view hotel attendance" });
      }

      const { date } = req.query;
      const queryDate = date && typeof date === 'string' ? new Date(date) : new Date();
      
      const records = await storage.getAttendanceByHotel(user.hotelId, queryDate);
      res.json(records);
    } catch (error) {
      console.error("Get daily attendance error:", error);
      res.status(500).json({ message: "Failed to fetch daily attendance" });
    }
  });

  app.get("/api/attendance/status", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const user = req.user as any;
      
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

  app.get("/api/hotels/current/attendance", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }

      const userRole = user.role?.name || '';
      const managerRoles = ['super_admin', 'owner', 'manager', 'housekeeping_supervisor', 'restaurant_bar_manager', 'security_head', 'finance'];
      
      if (!managerRoles.includes(userRole)) {
        return res.status(403).json({ message: "Only managers can view hotel attendance records" });
      }

      const { startDate, endDate } = req.query;
      const start = startDate && typeof startDate === 'string' ? new Date(startDate) : undefined;
      const end = endDate && typeof endDate === 'string' ? new Date(endDate) : undefined;
      
      const records = await storage.getAllAttendanceByHotel(user.hotelId, start, end);
      res.json(records);
    } catch (error) {
      console.error("Get all attendance error:", error);
      res.status(500).json({ message: "Failed to fetch attendance records" });
    }
  });

  // Audit Log Viewing Endpoint
  app.get("/api/audit-logs", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const currentUser = req.user as any;
      if (!currentUser || !currentUser.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      
      // Only managers and owners can view audit logs
      const canViewAudit = ['manager', 'owner', 'finance'].includes(currentUser.role?.name || '');
      if (!canViewAudit) {
        return res.status(403).json({ 
          message: "Only managers can view audit logs" 
        });
      }
      
      const { startDate, endDate, userId, action, resourceType, limit } = req.query;
      
      // Build query with filters
      const conditions: any[] = [eq(auditLogs.hotelId, currentUser.hotelId)];
      
      if (userId && typeof userId === 'string') {
        conditions.push(eq(auditLogs.userId, userId));
      }
      if (action && typeof action === 'string') {
        conditions.push(eq(auditLogs.action, action));
      }
      if (resourceType && typeof resourceType === 'string') {
        conditions.push(eq(auditLogs.resourceType, resourceType));
      }
      
      // Add date filters if provided
      if (startDate && typeof startDate === 'string') {
        conditions.push(sql`${auditLogs.createdAt} >= ${new Date(startDate).toISOString()}`);
      }
      if (endDate && typeof endDate === 'string') {
        conditions.push(sql`${auditLogs.createdAt} <= ${new Date(endDate).toISOString()}`);
      }
      
      const maxLimit = limit && typeof limit === 'string' ? Math.min(parseInt(limit), 1000) : 500;
      
      const logs = await db
        .select({
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
          user: sql`json_build_object(
            'id', ${users.id},
            'username', ${users.username},
            'role', json_build_object(
              'id', ${roles.id},
              'name', ${roles.name}
            )
          )`
        })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.userId, users.id))
        .leftJoin(roles, eq(users.roleId, roles.id))
        .where(and(...conditions))
        .orderBy(sql`${auditLogs.createdAt} DESC`)
        .limit(maxLimit);
      
      res.json(logs);
    } catch (error) {
      console.error("Audit log fetch error:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // Maintenance Request Status History
  app.get("/api/maintenance-requests/:id/history", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const currentUser = req.user as any;
      const canView = ['manager', 'owner', 'super_admin'].includes(currentUser.role?.name || '');
      if (!canView) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const history = await db
        .select({
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
        })
        .from(maintenanceStatusHistory)
        .leftJoin(users, eq(maintenanceStatusHistory.changedBy, users.id))
        .leftJoin(roles, eq(users.roleId, roles.id))
        .where(eq(maintenanceStatusHistory.requestId, req.params.id))
        .orderBy(desc(maintenanceStatusHistory.createdAt));
      
      res.json(history);
    } catch (error) {
      console.error("Fetch maintenance history error:", error);
      res.status(500).json({ message: "Failed to fetch maintenance history" });
    }
  });

  // Price Change History
  app.get("/api/price-change-logs", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const currentUser = req.user as any;
      const canView = ['manager', 'owner', 'super_admin', 'finance'].includes(currentUser.role?.name || '');
      if (!canView) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const { itemType, startDate, endDate, limit } = req.query;
      const conditions: any[] = [eq(priceChangeLogs.hotelId, currentUser.hotelId)];
      
      if (itemType && typeof itemType === 'string') {
        conditions.push(eq(priceChangeLogs.itemType, itemType));
      }
      if (startDate && typeof startDate === 'string') {
        conditions.push(sql`${priceChangeLogs.createdAt} >= ${new Date(startDate).toISOString()}`);
      }
      if (endDate && typeof endDate === 'string') {
        conditions.push(sql`${priceChangeLogs.createdAt} <= ${new Date(endDate).toISOString()}`);
      }
      
      const maxLimit = limit && typeof limit === 'string' ? Math.min(parseInt(limit), 500) : 100;
      
      const logs = await db
        .select({
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
        })
        .from(priceChangeLogs)
        .leftJoin(users, eq(priceChangeLogs.changedBy, users.id))
        .leftJoin(roles, eq(users.roleId, roles.id))
        .where(and(...conditions))
        .orderBy(desc(priceChangeLogs.createdAt))
        .limit(maxLimit);
      
      res.json(logs);
    } catch (error) {
      console.error("Fetch price change logs error:", error);
      res.status(500).json({ message: "Failed to fetch price change logs" });
    }
  });

  // Tax Change History
  app.get("/api/tax-change-logs", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const currentUser = req.user as any;
      const canView = ['manager', 'owner', 'super_admin', 'finance'].includes(currentUser.role?.name || '');
      if (!canView) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const logs = await db
        .select({
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
        })
        .from(taxChangeLogs)
        .leftJoin(users, eq(taxChangeLogs.changedBy, users.id))
        .leftJoin(roles, eq(users.roleId, roles.id))
        .where(eq(taxChangeLogs.hotelId, currentUser.hotelId))
        .orderBy(desc(taxChangeLogs.createdAt))
        .limit(100);
      
      res.json(logs);
    } catch (error) {
      console.error("Fetch tax change logs error:", error);
      res.status(500).json({ message: "Failed to fetch tax change logs" });
    }
  });

  // Inventory Movement Tracking
  app.get("/api/inventory-movement-logs", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const currentUser = req.user as any;
      const canView = ['manager', 'owner', 'super_admin', 'storekeeper', 'finance'].includes(currentUser.role?.name || '');
      if (!canView) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const { itemId, startDate, endDate, transactionType, limit } = req.query;
      const conditions: any[] = [eq(inventoryTransactions.hotelId, currentUser.hotelId)];
      
      if (itemId && typeof itemId === 'string') {
        conditions.push(eq(inventoryTransactions.itemId, itemId));
      }
      if (transactionType && typeof transactionType === 'string') {
        conditions.push(eq(inventoryTransactions.transactionType, transactionType));
      }
      if (startDate && typeof startDate === 'string') {
        conditions.push(sql`${inventoryTransactions.createdAt} >= ${new Date(startDate).toISOString()}`);
      }
      if (endDate && typeof endDate === 'string') {
        conditions.push(sql`${inventoryTransactions.createdAt} <= ${new Date(endDate).toISOString()}`);
      }
      
      const maxLimit = limit && typeof limit === 'string' ? Math.min(parseInt(limit), 500) : 100;
      
      const logs = await db
        .select({
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
            id: sql<string>`issued_user.id`,
            username: sql<string>`issued_user.username`,
            role: sql<string>`issued_role.name`
          }
        })
        .from(inventoryTransactions)
        .leftJoin(inventoryItems, eq(inventoryTransactions.itemId, inventoryItems.id))
        .leftJoin(users, eq(inventoryTransactions.recordedBy, users.id))
        .leftJoin(roles, eq(users.roleId, roles.id))
        .leftJoin(sql`users AS issued_user`, sql`${inventoryTransactions.issuedToUserId} = issued_user.id`)
        .leftJoin(sql`roles AS issued_role`, sql`issued_user.role_id = issued_role.id`)
        .where(and(...conditions))
        .orderBy(desc(inventoryTransactions.createdAt))
        .limit(maxLimit);
      
      res.json(logs);
    } catch (error) {
      console.error("Fetch inventory movement logs error:", error);
      res.status(500).json({ message: "Failed to fetch inventory movement logs" });
    }
  });

  // Staff Activity Summary
  app.get("/api/staff-activity-summary", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const currentUser = req.user as any;
      const canView = ['manager', 'owner', 'super_admin'].includes(currentUser.role?.name || '');
      if (!canView) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const { userId, startDate, endDate } = req.query;
      const conditions: any[] = [eq(auditLogs.hotelId, currentUser.hotelId)];
      
      if (userId && typeof userId === 'string') {
        conditions.push(eq(auditLogs.userId, userId));
      }
      if (startDate && typeof startDate === 'string') {
        conditions.push(sql`${auditLogs.createdAt} >= ${new Date(startDate).toISOString()}`);
      }
      if (endDate && typeof endDate === 'string') {
        conditions.push(sql`${auditLogs.createdAt} <= ${new Date(endDate).toISOString()}`);
      }
      
      const activityLogs = await db
        .select({
          userId: auditLogs.userId,
          username: users.username,
          role: roles.name,
          action: auditLogs.action,
          resourceType: auditLogs.resourceType,
          count: sql<number>`COUNT(*)::int`,
          lastActivity: sql<Date>`MAX(${auditLogs.createdAt})`
        })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.userId, users.id))
        .leftJoin(roles, eq(users.roleId, roles.id))
        .where(and(...conditions))
        .groupBy(auditLogs.userId, users.username, roles.name, auditLogs.action, auditLogs.resourceType)
        .orderBy(desc(sql`MAX(${auditLogs.createdAt})`))
        .limit(200);
      
      res.json(activityLogs);
    } catch (error) {
      console.error("Fetch staff activity summary error:", error);
      res.status(500).json({ message: "Failed to fetch staff activity summary" });
    }
  });

  // Financial Transaction Details with Creator Info
  app.get("/api/transactions/:id/details", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const currentUser = req.user as any;
      const canView = ['manager', 'owner', 'super_admin', 'finance'].includes(currentUser.role?.name || '');
      if (!canView) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const transaction = await db
        .select({
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
            id: sql<string>`creator.id`,
            username: sql<string>`creator.username`,
            email: sql<string>`creator.email`,
            role: sql<string>`creator_role.name`
          },
          voidedBy: {
            id: sql<string>`voider.id`,
            username: sql<string>`voider.username`,
            role: sql<string>`voider_role.name`
          }
        })
        .from(transactions)
        .leftJoin(vendors, eq(transactions.vendorId, vendors.id))
        .leftJoin(sql`users AS creator`, sql`${transactions.createdBy} = creator.id`)
        .leftJoin(sql`roles AS creator_role`, sql`creator.role_id = creator_role.id`)
        .leftJoin(sql`users AS voider`, sql`${transactions.voidedBy} = voider.id`)
        .leftJoin(sql`roles AS voider_role`, sql`voider.role_id = voider_role.id`)
        .where(eq(transactions.id, req.params.id))
        .limit(1);
      
      if (!transaction || transaction.length === 0) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      res.json(transaction[0]);
    } catch (error) {
      console.error("Fetch transaction details error:", error);
      res.status(500).json({ message: "Failed to fetch transaction details" });
    }
  });

  // Room Status Change History
  app.get("/api/rooms/:roomId/status-history", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const currentUser = req.user as any;
      const canView = ['manager', 'owner', 'super_admin', 'front_desk', 'housekeeping_supervisor'].includes(currentUser.role?.name || '');
      if (!canView) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const history = await db
        .select({
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
        })
        .from(roomStatusLogs)
        .leftJoin(users, eq(roomStatusLogs.changedBy, users.id))
        .leftJoin(roles, eq(users.roleId, roles.id))
        .where(eq(roomStatusLogs.roomId, req.params.roomId))
        .orderBy(desc(roomStatusLogs.createdAt))
        .limit(100);
      
      res.json(history);
    } catch (error) {
      console.error("Fetch room status history error:", error);
      res.status(500).json({ message: "Failed to fetch room status history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
