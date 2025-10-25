import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupWebSocket } from "./websocket";
import cron from "node-cron";
import { storage } from "./storage";
import { db } from "./db";
import { kotOrders, type KotOrder, users, hotels } from "@shared/schema";
import { and, eq, isNull } from "drizzle-orm";
import { patternDetector } from "./pattern-detector";
import { alertService } from "./alert-service";

// Set timezone to Nepal
process.env.TZ = 'Asia/Kathmandu';

const app = express();
app.set('etag', false);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

(async () => {
  const server = await registerRoutes(app);

  // Setup WebSocket for real-time updates
  setupWebSocket(server);
  log('WebSocket server initialized');

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Set up KOT order status sync cron job - runs every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      log('Running periodic KOT order status sync...');
      
      // Get all active KOT orders (not completed or cancelled)
      const activeOrders = await db
        .select()
        .from(kotOrders);
      
      // Filter to active orders
      const ordersToSync = activeOrders.filter(
        (order: KotOrder) => order.status !== 'completed' && order.status !== 'cancelled'
      );
      
      // Sync each order
      for (const order of ordersToSync) {
        await storage.updateKotOrderStatus(order.id);
      }
      
      log(`KOT sync completed for ${ordersToSync.length} orders`);
    } catch (error) {
      console.error('Error in KOT sync cron job:', error);
    }
  });
  
  log('KOT order status sync cron job scheduled (every 5 minutes)');

  // Set up annual leave balance reset cron job - runs on January 1st at midnight
  cron.schedule('0 0 1 1 *', async () => {
    try {
      log('Running annual leave balance reset...');
      
      const newYear = new Date().getFullYear();
      
      // Get all active users
      const activeUsers = await db
        .select()
        .from(users)
        .where(and(
          eq(users.isActive, true),
          isNull(users.deletedAt)
        ));
      
      let resetCount = 0;
      
      // Initialize leave balances for each user for the new year
      for (const user of activeUsers) {
        if (user.hotelId) {
          await storage.initializeLeaveBalances(user.id, user.hotelId, newYear);
          resetCount++;
        }
      }
      
      log(`Leave balances reset completed for ${resetCount} users for year ${newYear}`);
    } catch (error) {
      console.error('Error in annual leave balance reset cron job:', error);
    }
  });
  
  log('Annual leave balance reset cron job scheduled (every January 1st)');

  // Set up daily pattern detection audit - runs every day at 6 AM
  cron.schedule('0 6 * * *', async () => {
    try {
      log('Running daily pattern detection audit...');
      
      // Get all active hotels
      const activeHotels = await db
        .select()
        .from(hotels)
        .where(eq(hotels.isActive, true));
      
      // Run audit for each hotel
      for (const hotel of activeHotels) {
        await patternDetector.runDailyAudit(hotel.id);
      }
      
      log(`Daily audit completed for ${activeHotels.length} hotels`);
    } catch (error) {
      console.error('Error in daily pattern detection audit:', error);
    }
  });
  
  log('Daily pattern detection audit scheduled (every day at 6 AM)');

  // Set up daily owner summary email - runs every day at 7 AM
  cron.schedule('0 7 * * *', async () => {
    try {
      log('Sending daily owner summary emails...');
      
      // Get all active hotels
      const activeHotels = await db
        .select()
        .from(hotels)
        .where(eq(hotels.isActive, true));
      
      // Send summary email for each hotel
      for (const hotel of activeHotels) {
        const result = await alertService.sendDailySummaryEmail(hotel.id);
        if (result.success) {
          log(`Daily summary sent for hotel: ${hotel.name}`);
        } else {
          log(`Failed to send summary for hotel ${hotel.name}: ${result.error}`);
        }
      }
      
      log(`Daily summary emails sent for ${activeHotels.length} hotels`);
    } catch (error) {
      console.error('Error in daily summary email cron job:', error);
    }
  });
  
  log('Daily owner summary email scheduled (every day at 7 AM)');

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
