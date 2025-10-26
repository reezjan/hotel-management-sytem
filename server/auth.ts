import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { UserWithRole as SelectUser } from "@shared/schema";
import { logAudit } from "./audit";
import { getLocationFromIP } from "@shared/device-utils";
import { alertService } from "./alert-service";
import rateLimit from 'express-rate-limit';

// Sanitize user object for API responses - remove sensitive fields
function sanitizeUser(user: SelectUser): Omit<SelectUser, 'passwordHash'> {
  const { passwordHash, ...sanitizedUser } = user;
  return sanitizedUser;
}

// Sanitize input to prevent null byte attacks and other injection attempts
function sanitizeInput(input: any): string {
  // CRITICAL: Handle type coercion attacks - reject non-string inputs
  if (typeof input !== 'string') {
    return '';
  }
  
  if (!input) return '';
  
  // Remove null bytes (\x00) that crash PostgreSQL
  let sanitized = input.replace(/\x00/g, '');
  
  // Limit length to prevent DoS
  sanitized = sanitized.substring(0, 1000);
  
  return sanitized.trim();
}

// Get real client IP address (works behind proxies like Render, Heroku, etc.)
function getRealClientIP(req: any): string {
  // Try X-Forwarded-For header first (most common for proxies/load balancers)
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    // X-Forwarded-For can be a comma-separated list: "client, proxy1, proxy2"
    // The first IP is the original client
    const ips = xForwardedFor.split(',').map((ip: string) => ip.trim());
    if (ips[0]) {
      console.log(`[getRealClientIP] Using X-Forwarded-For: ${ips[0]} (full header: ${xForwardedFor})`);
      return ips[0];
    }
  }
  
  // Try other common proxy headers
  const xRealIp = req.headers['x-real-ip'];
  if (xRealIp) {
    console.log(`[getRealClientIP] Using X-Real-IP: ${xRealIp}`);
    return xRealIp as string;
  }
  
  const cfConnectingIp = req.headers['cf-connecting-ip']; // Cloudflare
  if (cfConnectingIp) {
    console.log(`[getRealClientIP] Using CF-Connecting-IP: ${cfConnectingIp}`);
    return cfConnectingIp as string;
  }
  
  // Fallback to req.ip (might be internal proxy IP)
  const fallbackIp = req.ip || 'unknown';
  console.log(`[getRealClientIP] Using fallback req.ip: ${fallbackIp}`);
  return fallbackIp;
}

// Middleware to ensure user is active and device is not blocked
export async function requireActiveUser(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const user = req.user as any;
  
  // CRITICAL: Check if device is blocked on every request
  const deviceFingerprint = (req.session as any).deviceFingerprint;
  if (deviceFingerprint && user?.id) {
    const isBlocked = await storage.isDeviceBlocked(user.id, deviceFingerprint);
    if (isBlocked) {
      // Log out the user and destroy session
      req.logout((err: any) => {
        if (err) console.error('Logout error:', err);
      });
      req.session.destroy((err: any) => {
        if (err) console.error('Session destroy error:', err);
      });
      return res.status(403).json({ 
        message: "This device has been blocked. Please contact your administrator." 
      });
    }
  }
  
  // CRITICAL: Block deactivated users
  if (!user.isActive) {
    // Log them out
    req.logout((err: any) => {
      if (err) console.error('Logout error:', err);
    });
    
    return res.status(403).json({ 
      message: "Your account has been deactivated. Please contact your hotel manager." 
    });
  }
  
  next();
}

// Middleware to require specific roles
export function requireRole(...allowedRoles: string[]) {
  return async (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const user = req.user as any;
    const userRole = user.role?.name || '';
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
      });
    }
    
    next();
  };
}

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // CRITICAL: Validate SESSION_SECRET exists and is secure
  if (!process.env.SESSION_SECRET) {
    throw new Error(
      "SESSION_SECRET is required for secure sessions. Add it to .env file."
    );
  }
  
  if (process.env.SESSION_SECRET.length < 32) {
    throw new Error(
      "SESSION_SECRET must be at least 32 characters for security."
    );
  }

  // Rate limiter for authentication endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: { message: "Too many attempts. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      httpOnly: true, // Prevents client-side JS from accessing the cookie
      secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
      sameSite: 'lax', // CSRF protection - prevents cookie from being sent with cross-site requests
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      // SECURITY: Sanitize input to prevent null byte attacks and injection
      const sanitizedUsername = sanitizeInput(username);
      const sanitizedPassword = sanitizeInput(password);
      
      // Validate credentials
      if (!sanitizedUsername || !sanitizedPassword) {
        return done(null, false, { message: "Missing credentials" });
      }
      
      const user = await storage.getUserByUsername(sanitizedUsername);
      if (!user || !(await comparePasswords(sanitizedPassword, user.passwordHash))) {
        return done(null, false, { message: "Invalid username or password" });
      }
      
      // CRITICAL: Block deactivated users from logging in
      if (!user.isActive) {
        return done(null, false, { message: "Your account has been deactivated. Please contact your manager." });
      }
      
      // Check if hotel is deactivated (except for super_admin)
      if (user.hotelId && user.role?.name !== 'super_admin') {
        const hotel = await storage.getHotel(user.hotelId);
        if (hotel && !hotel.isActive) {
          return done(null, false, { message: "This hotel has been deactivated. Please contact support." });
        }
      }
      
      return done(null, user);
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    const user = await storage.getUser(id);
    // CRITICAL: Block deactivated users from using existing sessions
    if (user && !user.isActive) {
      return done(null, false);
    }
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const user = await storage.createUser({
      ...req.body,
      passwordHash: await hashPassword(req.body.password),
    });

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(sanitizeUser(user));
    });
  });

  app.post("/api/login", authLimiter, (req, res, next) => {
    passport.authenticate("local", async (err: any, user: SelectUser | false, info: any) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        // Log failed login attempt
        await logAudit({
          userId: null,
          action: 'login_failed',
          resourceType: 'user',
          details: { username: req.body.username, reason: info?.message },
          ipAddress: getRealClientIP(req),
          userAgent: req.headers['user-agent'],
          success: false,
          errorMessage: info?.message || "Invalid username or password"
        });
        
        return res.status(401).json({ 
          message: info?.message || "Invalid username or password" 
        });
      }
      
      // Extract device info from request body
      const deviceFingerprint = req.body.deviceFingerprint || 'unknown';
      const browser = req.body.browser || 'unknown';
      const os = req.body.os || 'unknown';
      const ipAddress = getRealClientIP(req);
      
      // CRITICAL: Check if device is blocked BEFORE creating session
      const isBlocked = await storage.isDeviceBlocked(user.id, deviceFingerprint);
      if (isBlocked) {
        // Log blocked device login attempt
        await logAudit({
          userId: user.id,
          hotelId: user.hotelId || undefined,
          action: 'login_blocked_device',
          resourceType: 'device',
          resourceId: deviceFingerprint,
          details: { 
            username: user.username,
            deviceFingerprint,
            browser,
            os,
            reason: 'Device is blocked'
          },
          ipAddress: getRealClientIP(req),
          userAgent: req.headers['user-agent'],
          success: false,
          errorMessage: 'Login denied: Device is blocked'
        });
        
        return res.status(403).json({ 
          message: "This device has been blocked. Please contact your administrator." 
        });
      }
      
      req.login(user, async (err) => {
        if (err) {
          return next(err);
        }
        
        // Store device fingerprint in session for blocking checks
        (req.session as any).deviceFingerprint = deviceFingerprint;
        
        // Get location from IP address
        const locationData = await getLocationFromIP(ipAddress);
        const location = `${locationData.city}, ${locationData.country}`;
        
        // Register or update device in knownDevices table
        await storage.upsertKnownDevice(user.id, deviceFingerprint, {
          browser,
          os,
          hotelId: user.hotelId || undefined
        });
        
        // Check if device has been used before by this user
        const isNewDevice = !(await storage.checkDeviceExists(user.id, deviceFingerprint));
        
        // Check if location has been used before by this user
        const isNewLocation = !(await storage.checkLocationExists(user.id, location));
        
        // Create login history record
        await storage.createLoginHistory({
          userId: user.id,
          hotelId: user.hotelId || null,
          deviceFingerprint,
          browser,
          os,
          ip: ipAddress,
          location,
          isNewDevice,
          isNewLocation
        });
        
        // Log successful login
        await logAudit({
          userId: user.id,
          hotelId: user.hotelId || undefined,
          action: 'login',
          resourceType: 'user',
          resourceId: user.id,
          details: { 
            username: user.username,
            deviceFingerprint,
            browser,
            os,
            location,
            isNewDevice,
            isNewLocation
          },
          ipAddress: getRealClientIP(req),
          userAgent: req.headers['user-agent'],
          success: true
        });
        
        // Trigger security alerts for new device or new location
        if (user.hotelId) {
          const securitySettings = await storage.getSecuritySettings(user.hotelId);
          
          // Send new device alert if enabled
          if (isNewDevice && securitySettings?.alertOnNewDevice) {
            alertService.sendSecurityAlert({
              hotelId: user.hotelId,
              userId: user.id,
              alertType: 'new_device',
              alertData: {
                browser,
                os,
                deviceFingerprint,
                location,
                ip: ipAddress,
                loginTime: new Date().toLocaleString()
              }
            }).catch(err => console.error('Failed to send new device alert:', err));
          }
          
          // Send new location alert if enabled
          if (isNewLocation && securitySettings?.alertOnNewLocation) {
            const locationParts = location.split(', ');
            alertService.sendSecurityAlert({
              hotelId: user.hotelId,
              userId: user.id,
              alertType: 'new_location',
              alertData: {
                location,
                city: locationParts[0] || 'Unknown',
                country: locationParts[1] || 'Unknown',
                ip: ipAddress,
                browser,
                os,
                loginTime: new Date().toLocaleString()
              }
            }).catch(err => console.error('Failed to send new location alert:', err));
          }
        }
        
        // Auto clock-in on login
        if (user.hotelId) {
          try {
            await storage.createAttendance(
              user.id,
              user.hotelId,
              new Date(),
              location,
              ipAddress,
              'auto_login'
            );
          } catch (error) {
            console.error('Auto clock-in failed:', error);
          }
        }
        
        return res.status(200).json({
          ...sanitizeUser(user),
          isNewDevice,
          isNewLocation
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", async (req, res, next) => {
    const user = req.user as SelectUser | undefined;
    
    req.logout(async (err) => {
      if (err) return next(err);
      
      // Auto clock-out on logout
      if (user && user.hotelId) {
        try {
          const ipAddress = req.ip || 'unknown';
          const locationData = await getLocationFromIP(ipAddress);
          const location = `${locationData.city}, ${locationData.country}`;
          
          const activeAttendance = await storage.getActiveAttendance(user.id);
          
          if (activeAttendance) {
            await storage.clockOut(
              activeAttendance.id,
              new Date(),
              location,
              ipAddress,
              'auto_logout'
            );
          }
        } catch (error) {
          console.error('Auto clock-out failed:', error);
        }
      }
      
      // Log logout
      if (user) {
        await logAudit({
          userId: user.id,
          hotelId: user.hotelId || undefined,
          action: 'logout',
          resourceType: 'user',
          resourceId: user.id,
          details: { username: user.username },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          success: true
        });
      }
      
      // CRITICAL: Destroy session completely
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({ message: "Logout failed" });
        }
        
        // Clear the session cookie
        res.clearCookie('connect.sid', {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        
        res.sendStatus(200);
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    res.json(sanitizeUser(req.user as SelectUser));
  });

  // Password change endpoint
  app.post("/api/reset-password", authLimiter, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const { oldPassword, newPassword } = req.body;
      const user = req.user as SelectUser;
      
      // Verify old password
      const isOldPasswordValid = await comparePasswords(oldPassword, user.passwordHash);
      if (!isOldPasswordValid) {
        // Log failed password change attempt
        await logAudit({
          userId: user.id,
          hotelId: user.hotelId || undefined,
          action: 'password_change_failed',
          resourceType: 'user',
          resourceId: user.id,
          details: { reason: 'incorrect_old_password' },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          success: false,
          errorMessage: 'Current password is incorrect'
        });
        
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update user's password in database
      await storage.updateUser(user.id, { passwordHash: hashedPassword });
      
      // Log successful password change
      await logAudit({
        userId: user.id,
        hotelId: user.hotelId || undefined,
        action: 'password_change',
        resourceType: 'user',
        resourceId: user.id,
        details: { username: user.username },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        success: true
      });
      
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(400).json({ message: "Failed to change password" });
    }
  });
}
