import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { UserWithRole as SelectUser } from "@shared/schema";
import { logAudit } from "./audit";

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

// Middleware to ensure user is active
export function requireActiveUser(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const user = req.user as any;
  
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
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
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

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", async (err: any, user: SelectUser | false, info: any) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        // Log failed login attempt
        await logAudit({
          userId: 'unknown',
          action: 'login_failed',
          resourceType: 'user',
          details: { username: req.body.username, reason: info?.message },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          success: false,
          errorMessage: info?.message || "Invalid username or password"
        });
        
        return res.status(401).json({ 
          message: info?.message || "Invalid username or password" 
        });
      }
      
      req.login(user, async (err) => {
        if (err) {
          return next(err);
        }
        
        // Log successful login
        await logAudit({
          userId: user.id,
          hotelId: user.hotelId || undefined,
          action: 'login',
          resourceType: 'user',
          resourceId: user.id,
          details: { username: user.username },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          success: true
        });
        
        return res.status(200).json(sanitizeUser(user));
      });
    })(req, res, next);
  });

  app.post("/api/logout", async (req, res, next) => {
    const user = req.user as SelectUser | undefined;
    
    req.logout(async (err) => {
      if (err) return next(err);
      
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
      
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    res.json(sanitizeUser(req.user as SelectUser));
  });

  // Password change endpoint
  app.post("/api/reset-password", async (req, res) => {
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
