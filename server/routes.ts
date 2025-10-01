import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { db } from "./db";
import { users, roles } from "@shared/schema";
import { eq, and, isNull, asc, sql } from "drizzle-orm";
import {
  insertUserSchema,
  insertHotelSchema,
  insertRoomSchema,
  insertMenuItemSchema,
  insertTaskSchema,
  insertTransactionSchema,
  insertMaintenanceRequestSchema,
  insertVoucherSchema,
  insertRoomTypeSchema,
  insertHallSchema,
  insertPoolSchema,
  insertServiceSchema,
  insertLeaveRequestSchema,
  insertWastageSchema,
  updateKotItemSchema,
  vouchers
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
      const transactions = await storage.getTransactionsByHotel(user.hotelId);
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

  app.get("/api/hotels/current/inventory", async (req, res) => {
    try {
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
      if (!name) {
        return res.status(400).json({ message: "Category name is required" });
      }
      const category = await storage.createMenuCategory({
        hotelId: user.hotelId,
        name
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
      if (!name) {
        return res.status(400).json({ message: "Category name is required" });
      }
      
      // Verify category belongs to user's hotel
      const categories = await storage.getMenuCategoriesByHotel(user.hotelId);
      const existingCategory = categories.find(cat => cat.id === id);
      if (!existingCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      const category = await storage.updateMenuCategory(id, { name });
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
      const itemData = insertMenuItemSchema.parse({
        ...req.body,
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
      const item = await storage.updateMenuItem(id, itemData);
      res.json(item);
    } catch (error) {
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
      const tableData = {
        ...req.body,
        hotelId: user.hotelId
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
      const tableData = req.body;
      // Verify the table belongs to current hotel
      const existingTable = await storage.getRestaurantTable(id);
      if (!existingTable || existingTable.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Table not found" });
      }
      const table = await storage.updateRestaurantTable(id, tableData);
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
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.put("/api/hotels/current/tasks/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const taskData = insertTaskSchema.partial().parse(req.body);
      // Verify the task belongs to current hotel
      const existingTask = await storage.getTask(id);
      if (!existingTask || existingTask.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Task not found" });
      }
      // Verify user is authorized to update this task (assigned to them or is a manager)
      const roleName = user.role?.name ?? user.role;
      const userRoles = ['restaurant_bar_manager', 'manager', 'owner'];
      const isManager = userRoles.includes(roleName);
      if (existingTask.assignedTo !== user.id && !isManager) {
        return res.status(403).json({ message: "Not authorized to update this task" });
      }
      // Non-managers can only update status
      let updateData = taskData;
      if (!isManager) {
        updateData = { status: taskData.status };
      }
      const task = await storage.updateTask(id, updateData);
      res.json(task);
    } catch (error) {
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
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete task" });
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
      const requestData = insertMaintenanceRequestSchema.parse({
        ...req.body,
        hotelId: user.hotelId,
        reportedBy: user.id
      });
      const request = await storage.createMaintenanceRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      res.status(400).json({ message: "Invalid maintenance request data" });
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

      // Role-based authorization - check what roles current user can create
      const currentUserRoleName = currentUser.role?.name || '';
      const rolePermissions = {
        restaurant_bar_manager: ['waiter', 'kitchen_staff', 'bartender', 'barista', 'cashier']
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

      // Auto-assign hotel from current user
      const finalUserData = insertUserSchema.parse({
        ...userData,
        roleId,
        hotelId: currentUser.hotelId,
        passwordHash: hashedPassword
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
      
      // Verify the user belongs to current hotel
      const existingUser = await storage.getUser(id);
      if (!existingUser || existingUser.hotelId !== currentUser.hotelId) {
        return res.status(404).json({ message: "User not found" });
      }

      const userData = req.body;
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
      // TODO: Implement reservations in storage
      res.json([]);
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
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { taxType, percent, isActive } = req.body;
      const tax = await storage.updateHotelTax(user.hotelId, taxType, isActive, percent);
      res.json(tax);
    } catch (error) {
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

  // User routes
  app.get("/api/hotels/:hotelId/users", async (req, res) => {
    try {
      const { hotelId } = req.params;
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

      // Role-based authorization - check what roles current user can create
      const currentUserRoleName = currentUser.role?.name || '';
      const rolePermissions = {
        super_admin: ['super_admin', 'owner'],
        owner: ['manager', 'housekeeping_supervisor', 'restaurant_bar_manager', 'security_head', 'finance'],
        manager: ['housekeeping_supervisor', 'restaurant_bar_manager', 'security_head', 'finance', 'front_desk'],
        housekeeping_supervisor: ['housekeeping_staff'],
        restaurant_bar_manager: ['waiter', 'kitchen_staff', 'bartender', 'barista', 'cashier'],
        security_head: ['security_guard']
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
      const { id } = req.params;
      const userData = insertUserSchema.partial().parse(req.body);
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
      const { id } = req.params;
      const { isOnline } = req.body;
      await storage.updateUserOnlineStatus(id, isOnline);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to update duty status" });
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
  app.get("/api/hotels/:hotelId/rooms", async (req, res) => {
    try {
      const { hotelId } = req.params;
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
      const { id } = req.params;
      const roomData = insertRoomSchema.partial().parse(req.body);
      const room = await storage.updateRoom(id, roomData);
      res.json(room);
    } catch (error) {
      res.status(400).json({ message: "Failed to update room" });
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

  // Menu routes
  app.get("/api/hotels/:hotelId/menu-items", async (req, res) => {
    try {
      const { hotelId } = req.params;
      const menuItems = await storage.getMenuItemsByHotel(hotelId);
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.get("/api/hotels/:hotelId/menu-categories", async (req, res) => {
    try {
      const { hotelId } = req.params;
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
  app.get("/api/hotels/:hotelId/transactions", async (req, res) => {
    try {
      const { hotelId } = req.params;
      const transactions = await storage.getTransactionsByHotel(hotelId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const currentUser = req.user as any;
      if (!currentUser?.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }

      const { hotelId: _, createdBy: __, ...sanitizedBody } = req.body;
      const transactionData = insertTransactionSchema.parse({
        ...sanitizedBody,
        hotelId: currentUser.hotelId,
        createdBy: currentUser.id
      });
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Transaction creation error:", error);
      res.status(400).json({ message: "Invalid transaction data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTransaction(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete transaction" });
    }
  });

  // Maintenance routes
  app.get("/api/hotels/:hotelId/maintenance-requests", async (req, res) => {
    try {
      const { hotelId } = req.params;
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
      const { id } = req.params;
      const requestData = insertMaintenanceRequestSchema.partial().parse(req.body);
      const request = await storage.updateMaintenanceRequest(id, requestData);
      res.json(request);
    } catch (error) {
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

  app.post("/api/kot-orders", async (req, res) => {
    try {
      const { items, ...kotData } = req.body;
      
      if (items && items.length > 0) {
        const kot = await storage.createKotOrderWithItems(kotData, items);
        res.status(201).json(kot);
      } else {
        const kot = await storage.createKotOrder(kotData);
        res.status(201).json(kot);
      }
    } catch (error) {
      console.error("KOT order creation error:", error);
      res.status(400).json({ message: "Invalid KOT data" });
    }
  });

  app.put("/api/kot-orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const kotData = req.body;
      const kot = await storage.updateKotOrder(id, kotData);
      res.json(kot);
    } catch (error) {
      res.status(400).json({ message: "Failed to update KOT order" });
    }
  });

  app.put("/api/kot-items/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }

      // Validate the request body
      const validatedData = updateKotItemSchema.parse(req.body);
      const { id } = req.params;

      // Get the KOT item with its order to verify hotel ownership
      const kotItem = await storage.getKotItemById(id);
      if (!kotItem) {
        return res.status(404).json({ message: "KOT item not found" });
      }

      // Verify the KOT item belongs to the user's hotel
      const kotOrder = await db.query.kotOrders.findFirst({
        where: (orders, { eq }) => eq(orders.id, kotItem.kotId!)
      });

      if (!kotOrder || kotOrder.hotelId !== user.hotelId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Update the KOT item
      const updatedItem = await storage.updateKotItem(id, validatedData);
      res.json(updatedItem);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid data" });
      }
      res.status(400).json({ message: "Failed to update KOT item" });
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

      // Validate and create wastage with server-side fields
      const wastageData = insertWastageSchema.parse({
        ...req.body,
        hotelId: user.hotelId,
        recordedBy: user.id
      });

      // Verify the inventory item exists and belongs to the user's hotel
      const inventoryItem = await storage.getInventoryItem(wastageData.itemId);
      if (!inventoryItem || inventoryItem.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Inventory item not found" });
      }

      const wastage = await storage.createWastage(wastageData);
      res.status(201).json(wastage);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid wastage data" });
      }
      res.status(400).json({ message: "Failed to record wastage" });
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

  // Inventory routes
  app.get("/api/hotels/:hotelId/inventory", async (req, res) => {
    try {
      const { hotelId } = req.params;
      const items = await storage.getInventoryItemsByHotel(hotelId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory items" });
    }
  });

  app.get("/api/hotels/:hotelId/inventory/low-stock", async (req, res) => {
    try {
      const { hotelId } = req.params;
      const items = await storage.getLowStockItems(hotelId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch low stock items" });
    }
  });

  // Vendor routes
  app.get("/api/hotels/:hotelId/vendors", async (req, res) => {
    try {
      const { hotelId } = req.params;
      const vendors = await storage.getVendorsByHotel(hotelId);
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  // Restaurant table routes
  app.get("/api/hotels/:hotelId/restaurant-tables", async (req, res) => {
    try {
      const { hotelId } = req.params;
      const tables = await storage.getRestaurantTablesByHotel(hotelId);
      res.json(tables);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch restaurant tables" });
    }
  });

  // Tax routes
  app.get("/api/hotels/:hotelId/taxes", async (req, res) => {
    try {
      const { hotelId } = req.params;
      const taxes = await storage.getHotelTaxes(hotelId);
      res.json(taxes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hotel taxes" });
    }
  });

  app.put("/api/hotels/:hotelId/taxes/:taxType", async (req, res) => {
    try {
      const { hotelId, taxType } = req.params;
      const { isActive, percent } = req.body;
      const tax = await storage.updateHotelTax(hotelId, taxType, isActive, percent);
      res.json(tax);
    } catch (error) {
      res.status(400).json({ message: "Failed to update tax" });
    }
  });

  // Voucher routes
  app.get("/api/hotels/:hotelId/vouchers", async (req, res) => {
    try {
      const { hotelId } = req.params;
      const vouchers = await storage.getVouchersByHotel(hotelId);
      res.json(vouchers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vouchers" });
    }
  });

  app.post("/api/vouchers", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

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

  app.post("/api/vouchers/validate", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { code } = req.body;
      const currentUser = req.user as any;
      
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
        return res.json({ valid: false, message: "Voucher not valid for this hotel" });
      }

      // Check if voucher is still valid (date range)
      const now = new Date();
      if (voucher.validFrom && new Date(voucher.validFrom) > now) {
        return res.json({ valid: false, message: "Voucher not yet valid" });
      }
      if (voucher.validUntil && new Date(voucher.validUntil) < now) {
        return res.json({ valid: false, message: "Voucher has expired" });
      }

      // Check if voucher has reached max uses
      if (voucher.maxUses && (voucher.usedCount || 0) >= voucher.maxUses) {
        return res.json({ valid: false, message: "Voucher usage limit reached" });
      }

      // Voucher is valid
      console.log("Voucher validation successful:", JSON.stringify({ valid: true, voucher }, null, 2));
      res.json({ valid: true, voucher });
    } catch (error) {
      console.error("Voucher validation error:", error);
      res.status(400).json({ message: "Failed to validate voucher" });
    }
  });

  app.post("/api/vouchers/redeem", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { voucherId } = req.body;
      const currentUser = req.user as any;
      const now = new Date().toISOString();
      
      // Atomic conditional update - increment usedCount only if all constraints are met
      const result = await db
        .update(vouchers)
        .set({ usedCount: sql`COALESCE(${vouchers.usedCount}, 0) + 1` })
        .where(and(
          eq(vouchers.id, voucherId),
          eq(vouchers.hotelId, currentUser.hotelId),
          sql`(${vouchers.validFrom} IS NULL OR ${vouchers.validFrom} <= ${now})`,
          sql`(${vouchers.validUntil} IS NULL OR ${vouchers.validUntil} >= ${now})`,
          sql`(${vouchers.maxUses} IS NULL OR COALESCE(${vouchers.usedCount}, 0) < ${vouchers.maxUses})`
        ))
        .returning();

      if (result.length === 0) {
        // Find out why it failed for better error message
        const voucherCheck = await db
          .select()
          .from(vouchers)
          .where(eq(vouchers.id, voucherId))
          .limit(1);
          
        if (!voucherCheck.length) {
          return res.status(404).json({ message: "Voucher not found" });
        }
        
        const voucher = voucherCheck[0];
        
        if (voucher.hotelId !== currentUser.hotelId) {
          return res.status(403).json({ message: "Voucher not valid for this hotel" });
        }
        
        if (voucher.validFrom && new Date(voucher.validFrom) > new Date(now)) {
          return res.status(400).json({ message: "Voucher not yet valid" });
        }
        
        if (voucher.validUntil && new Date(voucher.validUntil) < new Date(now)) {
          return res.status(400).json({ message: "Voucher has expired" });
        }
        
        if (voucher.maxUses && (voucher.usedCount || 0) >= voucher.maxUses) {
          return res.status(400).json({ message: "Voucher usage limit reached" });
        }
        
        return res.status(400).json({ message: "Voucher redemption failed" });
      }

      res.json({ success: true, voucher: result[0] });
    } catch (error) {
      console.error("Voucher redemption error:", error);
      res.status(400).json({ message: "Failed to redeem voucher" });
    }
  });

  app.put("/api/vouchers/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

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

  app.delete("/api/vouchers/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

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

  // Vehicle routes
  app.get("/api/hotels/:hotelId/vehicle-logs", async (req, res) => {
    try {
      const { hotelId } = req.params;
      const logs = await storage.getVehicleLogsByHotel(hotelId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicle logs" });
    }
  });

  // Room service routes
  app.get("/api/hotels/:hotelId/room-service-orders", async (req, res) => {
    try {
      const { hotelId } = req.params;
      const orders = await storage.getRoomServiceOrdersByHotel(hotelId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch room service orders" });
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
      
      let leaveRequests;
      if (canViewAllRequests) {
        // Managers, owners, and super_admins can see all requests for the hotel
        leaveRequests = await storage.getLeaveRequestsForManager(user.hotelId);
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
      
      // Role-based authorization - only managers, owners, and super_admins can view pending approvals
      const userRole = user.role?.name || '';
      const canViewApprovals = ['manager', 'owner', 'super_admin'].includes(userRole);
      
      if (!canViewApprovals) {
        return res.status(403).json({ message: "Only managers can view pending leave requests" });
      }
      
      const leaveRequests = await storage.getPendingLeaveRequestsForManager(user.hotelId);
      res.json(leaveRequests);
    } catch (error) {
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
      const leaveRequestData = insertLeaveRequestSchema.parse({
        ...req.body,
        hotelId: user.hotelId,
        requestedBy: user.id,
        status: 'pending'
      });
      const leaveRequest = await storage.createLeaveRequest(leaveRequestData);
      res.status(201).json(leaveRequest);
    } catch (error) {
      console.error("Leave request creation error:", error);
      res.status(400).json({ message: "Invalid leave request data" });
    }
  });

  app.put("/api/hotels/current/leave-requests/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = req.user as any;
      if (!user || !user.hotelId) {
        return res.status(400).json({ message: "User not associated with a hotel" });
      }
      const { id } = req.params;
      const { status, managerNotes } = req.body;
      
      // Verify the leave request exists and belongs to this hotel
      const existingRequest = await storage.getLeaveRequest(id);
      if (!existingRequest || existingRequest.hotelId !== user.hotelId) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      // Only managers can approve/reject leave requests
      const userRole = user.role?.name || '';
      const canApprove = ['manager', 'owner', 'super_admin'].includes(userRole);
      
      if (status && status !== 'pending' && !canApprove) {
        return res.status(403).json({ message: "Only managers can approve or reject leave requests" });
      }

      const updateData: Partial<any> = {};
      if (status) {
        updateData.status = status;
        updateData.approvedBy = user.id;
      }
      if (managerNotes !== undefined) {
        updateData.managerNotes = managerNotes;
      }

      const leaveRequest = await storage.updateLeaveRequest(id, updateData);
      res.json(leaveRequest);
    } catch (error) {
      console.error("Leave request update error:", error);
      res.status(400).json({ message: "Failed to update leave request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
