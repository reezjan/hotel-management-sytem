# 🔐 Replit AI Security Fix Prompts
## Hotel Management System - 28 Critical Business Logic Flaws

**Instructions:** Copy each prompt individually and send to Replit AI. Complete fixes in order of priority.

---

## 🔴 CRITICAL PRIORITY FIXES (Complete First)

### **PROMPT 1: Implement Complete Attendance/Clock In-Out System**

Create a full attendance tracking system with clock in/out functionality.

**Requirements:**

1. **Add to `shared/schema.ts`:**
   - Update the `attendance` table schema if needed to ensure it has:
     - `id`, `userId`, `hotelId`, `clockInTime`, `clockOutTime`
     - `clockInLocation` (text), `clockOutLocation` (text)
     - `clockInIp`, `clockOutIp`
     - `totalHours` (numeric), `status` (active/completed)
     - `clockInSource` (web/mobile), `clockOutSource`
     - `notes`, `createdAt`, `updatedAt`

2. **Add to `server/storage.ts`:**
   - `createAttendance(userId, hotelId, clockInTime, location, ip, source)` - Creates new attendance record
   - `getActiveAttendance(userId)` - Gets user's currently active (not clocked out) attendance
   - `clockOut(attendanceId, clockOutTime, location, ip, source)` - Updates attendance with clock out
   - `getAttendanceByUser(userId, startDate, endDate)` - Gets user's attendance history
   - `getAttendanceByHotel(hotelId, date)` - Gets all attendance for a hotel on a date
   - `canClockIn(userId)` - Validates user can clock in (no active attendance, is active user)

3. **Add to `server/routes.ts`:**

```typescript
// Clock In endpoint
app.post("/api/attendance/clock-in", async (req, res) => {
  // Verify authentication
  // Get user IP address from req.ip
  // Validate user has no active attendance
  // Validate user isActive = true
  // Block if user already clocked in
  // Create attendance record with current timestamp
  // Update user.isOnline = true
  // Return attendance record
});

// Clock Out endpoint
app.post("/api/attendance/clock-out", async (req, res) => {
  // Verify authentication
  // Get user's active attendance
  // Validate active attendance exists
  // Calculate total hours
  // Update attendance with clock out time
  // Update user.isOnline = false
  // Return updated attendance record
});

// Get user's attendance history
app.get("/api/attendance/history", async (req, res) => {
  // Verify authentication
  // Get startDate, endDate from query params (default to current month)
  // Return user's attendance records
});

// Get hotel's daily attendance (managers only)
app.get("/api/attendance/daily", async (req, res) => {
  // Verify authentication
  // Verify user role is manager or above
  // Get date from query params (default to today)
  // Return all attendance for hotel on that date
});

// Get current attendance status
app.get("/api/attendance/status", async (req, res) => {
  // Verify authentication
  // Get user's active attendance if exists
  // Return { isOnDuty: boolean, attendance: object | null }
});
```

4. **Security Rules:**
   - Users can ONLY clock in/out for themselves
   - Cannot backdate clock in/out times
   - Cannot clock in if already clocked in
   - Cannot clock out if not clocked in
   - Store IP address and location for audit
   - Managers can view all attendance but cannot modify

5. **Validation:**
   - Clock in time must be current timestamp (server-side)
   - Clock out time must be after clock in time
   - Block multiple simultaneous clock-ins
   - Require minimum 1-minute gap between clock out and next clock in

---

### **PROMPT 2: Fix Role Escalation - Prevent Users from Changing Their Own Role**

Fix the user update endpoint to prevent role escalation and self-activation exploits.

**Requirements:**

1. **Modify `server/routes.ts` - Line ~1018-1046 (`PUT /api/hotels/current/users/:id`):**

```typescript
app.put("/api/hotels/current/users/:id", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const currentUser = req.user as any;
    const { id } = req.params;
    const userData = req.body;
    
    // Verify user belongs to same hotel
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
      
      // Only managers and owners can update other users
      const canUpdateUsers = ['owner', 'manager', 'security_head'].includes(currentRole);
      
      if (!canUpdateUsers) {
        return res.status(403).json({ 
          message: "You don't have permission to update other users" 
        });
      }
      
      // Prevent updating protected fields without proper authorization
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
    const { passwordHash: _, ...sanitizedUser } = user;
    res.json(sanitizedUser);
  } catch (error) {
    res.status(400).json({ message: "Failed to update user" });
  }
});
```

2. **Also fix `PUT /api/users/:id` (Line ~1803-1820):**
   - Apply the same protections
   - Prevent self-modification of roleId, isActive, hotelId

3. **Test cases to verify:**
   - Waiter cannot change their own roleId
   - Deactivated user cannot reactivate themselves
   - Manager can update waiter details but not their own role
   - Only owner can change roles and activation status

---

### **PROMPT 3: Block Self-Reactivation - Deactivated Users Cannot Activate Themselves**

Enhance the duty status endpoint to prevent deactivated users from using the system.

**Requirements:**

1. **Modify `server/routes.ts` - Line ~1859-1870 (`PUT /api/users/:id/duty-status`):**

```typescript
app.put("/api/users/:id/duty-status", async (req, res) => {
  try {
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
    res.status(200).json({ success: true, isOnline });
  } catch (error) {
    res.status(400).json({ message: "Failed to update duty status" });
  }
});
```

2. **Add middleware for all authenticated routes to check isActive:**

Create a new middleware in `server/auth.ts`:

```typescript
export function requireActiveUser(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const user = req.user as any;
  if (!user.isActive) {
    return res.status(403).json({ 
      message: "Your account has been deactivated. Please contact your manager." 
    });
  }
  
  next();
}
```

3. **Apply middleware to critical routes:**
   - All transaction creation routes
   - All bill creation routes
   - Clock in/out endpoints
   - Any financial operations

---

### **PROMPT 4: Implement Inventory Transaction Validation - Prevent Negative Stock**

Add strict validation to inventory transactions to prevent stock manipulation.

**Requirements:**

1. **Modify `server/routes.ts` - Line ~1162-1180 (`POST /api/hotels/current/inventory-transactions`):**

```typescript
app.post("/api/hotels/current/inventory-transactions", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
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
    
    // CRITICAL: For 'receive' transactions, require purchase verification
    if (transactionType === 'receive') {
      // Only storekeeper or manager can receive inventory
      const canReceive = ['storekeeper', 'manager', 'owner'].includes(user.role?.name || '');
      if (!canReceive) {
        return res.status(403).json({ 
          message: "Only storekeeper or manager can receive inventory" 
        });
      }
      
      // Require supplier reference or purchase order
      if (!transactionData.supplierName && !transactionData.referenceNumber) {
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
      if (transactionType === 'wastage' && !transactionData.notes) {
        return res.status(400).json({ 
          message: "Wastage requires detailed notes explaining the reason" 
        });
      }
    }
    
    // CRITICAL: Large quantity adjustments require manager approval
    if (transactionType === 'adjustment') {
      const item = await storage.getInventoryItem(transactionData.itemId);
      const currentStock = Number(item?.baseStockQty || item?.stockQty || 0);
      const adjustmentQty = Math.abs(Number(transactionData.qtyBase || 0));
      
      // If adjustment is more than 50% of current stock
      if (adjustmentQty > currentStock * 0.5) {
        const isManager = ['manager', 'owner'].includes(user.role?.name || '');
        if (!isManager) {
          return res.status(403).json({ 
            message: "Large inventory adjustments require manager approval" 
          });
        }
      }
      
      // Adjustments require notes
      if (!transactionData.notes) {
        return res.status(400).json({ 
          message: "Inventory adjustments require detailed notes" 
        });
      }
    }
    
    const finalTransactionData = {
      ...transactionData,
      hotelId: user.hotelId,
      createdBy: user.id
    };
    
    const transaction = await storage.createInventoryTransaction(finalTransactionData);
    res.status(201).json(transaction);
  } catch (error) {
    console.error("Inventory transaction error:", error);
    res.status(400).json({ message: "Failed to create inventory transaction" });
  }
});
```

2. **Update `server/storage.ts` `createInventoryTransaction` method:**
   - Add transaction to prevent race conditions
   - Lock inventory item row during update
   - Verify stock levels before committing

---

### **PROMPT 5: Lock Bills After Payment - Prevent Post-Payment Manipulation**

Prevent bill amendments after payment has been received.

**Requirements:**

1. **Add status validation to bill update endpoints in `server/routes.ts`:**

Find the restaurant bill update endpoint (search for `PUT` and `restaurant-bills`) and add:

```typescript
// Before any bill update
const existingBill = await storage.getRestaurantBill(billId);

// CRITICAL: Prevent modifying paid bills
if (existingBill.status === 'paid' || existingBill.status === 'finalized') {
  const isManager = ['manager', 'owner'].includes(currentUser.role?.name || '');
  
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
  
  // Create amendment record
  const amendedBillData = {
    ...req.body,
    originalBillId: existingBill.id,
    amendedBy: currentUser.id,
    amendedAt: new Date()
  };
  
  // Process amendment
}
```

2. **Add bill locking when payment is recorded:**

Find the bill payment endpoint (search for `POST` and `bill-payments` or transaction creation) and add:

```typescript
app.post("/api/restaurant-bills/:billId/payments", async (req, res) => {
  // ... existing code ...
  
  // After payment is recorded
  const payment = await storage.createBillPayment(paymentData);
  
  // Get total paid amount for this bill
  const allPayments = await storage.getBillPayments(billId);
  const totalPaid = allPayments
    .filter(p => !p.isVoided)
    .reduce((sum, p) => sum + Number(p.amount), 0);
  
  const bill = await storage.getRestaurantBill(billId);
  const grandTotal = Number(bill.grandTotal);
  
  // If fully paid, lock the bill
  if (totalPaid >= grandTotal) {
    await storage.updateRestaurantBill(billId, {
      status: 'paid',
      finalizedAt: new Date()
    });
  }
  
  res.status(201).json(payment);
});
```

3. **Create audit log for bill amendments:**

Add to `server/storage.ts`:

```typescript
async createBillAmendmentLog(billId: string, amendedBy: string, changes: any, reason: string) {
  // Log all amendments to bills for audit trail
  // Store: billId, amendedBy, changes (JSON), reason, timestamp
}
```

---

### **PROMPT 6: Fix Voucher Reuse - Implement Atomic Usage Counter**

Prevent voucher codes from being used more times than allowed.

**Requirements:**

1. **Modify `server/routes.ts` - Voucher validation endpoint (Line ~2738):**

```typescript
app.post("/api/vouchers/validate", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

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
    
    // Check if voucher is active
    if (!voucher.isActive) {
      return res.json({ valid: false, message: "Voucher is no longer active" });
    }
    
    // Check date validity
    const now = new Date();
    if (voucher.startDate && new Date(voucher.startDate) > now) {
      return res.json({ valid: false, message: "Voucher not yet valid" });
    }
    if (voucher.endDate && new Date(voucher.endDate) < now) {
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
```

2. **Create voucher redemption endpoint:**

```typescript
app.post("/api/vouchers/:voucherId/redeem", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const currentUser = req.user as any;
    const { voucherId } = req.params;
    const { billId, transactionId } = req.body;
    
    // CRITICAL: Use database transaction for atomic operation
    const result = await db.transaction(async (tx) => {
      // Lock the voucher row for update
      const [voucher] = await tx
        .select()
        .from(vouchers)
        .where(eq(vouchers.id, voucherId))
        .for('update'); // PostgreSQL row lock
      
      if (!voucher) {
        throw new Error("Voucher not found");
      }
      
      // Verify hotel ownership
      if (voucher.hotelId !== currentUser.hotelId) {
        throw new Error("Voucher not found");
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
          usedCount: sql`${vouchers.usedCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(vouchers.id, voucherId))
        .returning();
      
      // Record redemption for audit
      // (You may need to create a voucher_redemptions table for this)
      
      return updated;
    });
    
    res.json({ success: true, voucher: result });
  } catch (error: any) {
    console.error("Voucher redemption error:", error);
    res.status(400).json({ message: error.message || "Failed to redeem voucher" });
  }
});
```

3. **Update bill creation to use redemption endpoint:**
   - Remove direct voucher usage from bill creation
   - Call redemption endpoint first
   - Only create bill if redemption succeeds

---

### **PROMPT 7: Implement Payment Void Authorization - Require Manager Approval**

Add strict controls to prevent unauthorized payment voiding.

**Requirements:**

1. **Create void payment endpoint in `server/routes.ts`:**

```typescript
app.post("/api/bill-payments/:paymentId/void", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const currentUser = req.user as any;
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
    
    // Check payment age - prevent voiding old payments (e.g., >7 days)
    const paymentDate = new Date(payment.createdAt);
    const daysSince = (Date.now() - paymentDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSince > 7) {
      // Only owner can void payments older than 7 days
      if (currentUser.role?.name !== 'owner') {
        return res.status(403).json({ 
          message: "Cannot void payments older than 7 days. Contact hotel owner." 
        });
      }
    }
    
    // Void the payment
    const voidedPayment = await storage.voidBillPayment(paymentId, currentUser.id, reason);
    
    // Update bill status if needed
    const bill = await storage.getRestaurantBill(payment.billId);
    if (bill.status === 'paid') {
      // Recalculate total paid
      const allPayments = await storage.getBillPayments(payment.billId);
      const totalPaid = allPayments
        .filter(p => !p.isVoided)
        .reduce((sum, p) => sum + Number(p.amount), 0);
      
      const grandTotal = Number(bill.grandTotal);
      
      // If no longer fully paid, reopen bill
      if (totalPaid < grandTotal) {
        await storage.updateRestaurantBill(payment.billId, {
          status: 'partial'
        });
      }
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
```

2. **Add to `server/storage.ts`:**

```typescript
async voidBillPayment(paymentId: string, voidedBy: string, reason: string): Promise<any> {
  const [voided] = await db
    .update(billPayments)
    .set({
      isVoided: true,
      voidedBy,
      voidedAt: new Date(),
      voidReason: reason // Add this field to schema if needed
    })
    .where(eq(billPayments.id, paymentId))
    .returning();
  
  return voided;
}

async getBillPayment(paymentId: string): Promise<any> {
  const [payment] = await db
    .select()
    .from(billPayments)
    .where(eq(billPayments.id, paymentId));
  
  return payment;
}

async getBillPayments(billId: string): Promise<any[]> {
  return await db
    .select()
    .from(billPayments)
    .where(eq(billPayments.billId, billId))
    .orderBy(asc(billPayments.createdAt));
}
```

3. **Add `voidReason` field to `billPayments` schema if not present:**

In `shared/schema.ts`, add to billPayments table:
```typescript
voidReason: text("void_reason")
```

---

## 🟠 HIGH PRIORITY FIXES (Complete Second)

### **PROMPT 8: Validate Leave Requests - Prevent Backdating and Balance Manipulation**

Add comprehensive validation to leave request system.

**Requirements:**

1. **Modify leave request creation endpoint in `server/routes.ts`:**

Find `POST /api/leave-requests` and add validations:

```typescript
app.post("/api/leave-requests", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const currentUser = req.user as any;
    const requestData = req.body;
    
    // Parse dates
    const startDate = new Date(requestData.startDate);
    const endDate = new Date(requestData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // CRITICAL: Prevent backdating leave requests
    if (startDate < today) {
      return res.status(400).json({ 
        message: "Cannot request leave for past dates. Contact your manager for backdated leave." 
      });
    }
    
    // Validate date range
    if (endDate < startDate) {
      return res.status(400).json({ 
        message: "End date must be after start date" 
      });
    }
    
    // Calculate duration
    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // CRITICAL: Check leave balance
    const leaveBalance = await storage.getLeaveBalance(
      currentUser.id,
      currentUser.hotelId,
      requestData.leaveType,
      startDate.getFullYear()
    );
    
    if (!leaveBalance) {
      return res.status(400).json({ 
        message: "Leave balance not found for this year" 
      });
    }
    
    const remainingDays = Number(leaveBalance.remainingDays || 0);
    if (durationDays > remainingDays) {
      return res.status(400).json({ 
        message: `Insufficient leave balance. Available: ${remainingDays} days, Requested: ${durationDays} days` 
      });
    }
    
    // CRITICAL: Check for overlapping leave
    const overlapping = await storage.checkOverlappingLeave(
      currentUser.id,
      startDate,
      endDate
    );
    
    if (overlapping) {
      return res.status(400).json({ 
        message: "You have overlapping approved or pending leave for these dates" 
      });
    }
    
    // Determine approver based on role hierarchy
    let approverId = null;
    const userRole = currentUser.role?.name || '';
    
    // ... existing approver logic ...
    
    const finalRequestData = {
      ...requestData,
      userId: currentUser.id,
      hotelId: currentUser.hotelId,
      approverId,
      status: 'pending',
      durationDays
    };
    
    const leaveRequest = await storage.createLeaveRequest(finalRequestData);
    res.status(201).json(leaveRequest);
  } catch (error) {
    console.error("Leave request error:", error);
    res.status(400).json({ message: "Failed to create leave request" });
  }
});
```

2. **Add validation methods to `server/storage.ts`:**

```typescript
async checkOverlappingLeave(userId: string, startDate: Date, endDate: Date): Promise<boolean> {
  const overlapping = await db
    .select()
    .from(leaveRequests)
    .where(
      and(
        eq(leaveRequests.userId, userId),
        or(
          eq(leaveRequests.status, 'approved'),
          eq(leaveRequests.status, 'pending')
        ),
        // Check for date overlap
        or(
          // New request starts during existing leave
          and(
            lte(leaveRequests.startDate, startDate),
            gte(leaveRequests.endDate, startDate)
          ),
          // New request ends during existing leave
          and(
            lte(leaveRequests.startDate, endDate),
            gte(leaveRequests.endDate, endDate)
          ),
          // New request completely contains existing leave
          and(
            gte(leaveRequests.startDate, startDate),
            lte(leaveRequests.endDate, endDate)
          )
        )
      )
    )
    .limit(1);
  
  return overlapping.length > 0;
}
```

3. **Protect leave balance updates:**

Find any route that updates leave balances and add:

```typescript
// CRITICAL: Only system or owner can update leave balances
if (currentUser.role?.name !== 'owner') {
  return res.status(403).json({ 
    message: "Only the hotel owner can adjust leave balances" 
  });
}
```

---

### **PROMPT 9: Enforce Task Completion Verification - Require Manager Approval**

Add approval workflow for task completion.

**Requirements:**

1. **Modify `server/routes.ts` - Task update endpoint (Line ~760-789):**

```typescript
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
          completedAt: new Date(),
          completionNotes: taskData.completionNotes || taskData.notes
        };
      } else if (taskData.status === 'in_progress') {
        updateData = { status: 'in_progress' };
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
    res.json(task);
  } catch (error) {
    console.error("Task update error:", error);
    res.status(400).json({ message: "Failed to update task" });
  }
});
```

2. **Add to `shared/schema.ts` tasks table if not present:**

```typescript
approvedBy: uuid("approved_by").references(() => users.id),
approvedAt: timestamp("approved_at", { withTimezone: true }),
completionNotes: text("completion_notes")
```

3. **Update task status enum to include 'pending_review':**

Ensure task status can be: 'pending', 'in_progress', 'pending_review', 'completed', 'cancelled'

---

### **PROMPT 10: Fix Room Reservation Race Condition - Prevent Double Booking**

Implement database-level locking to prevent simultaneous bookings.

**Requirements:**

1. **Modify `server/storage.ts` - Room reservation creation:**

Find `createRoomReservation` method and wrap in transaction:

```typescript
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
```

2. **Update room availability check to use same locking:**

```typescript
async checkRoomAvailability(roomId: string, checkInDate: Date, checkOutDate: Date): Promise<boolean> {
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
```

---

### **PROMPT 11: Validate KOT Status Changes - Prevent Free Meal Fraud**

Add inventory deduction and authorization to KOT system.

**Requirements:**

1. **Modify `server/routes.ts` - KOT item update endpoint:**

Find the KOT item update route (search for `PUT` and `kot-items`) and add:

```typescript
app.put("/api/kot-items/:id", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const currentUser = req.user as any;
    const { id } = req.params;
    const updateData = req.body;
    
    const existingItem = await storage.getKotItem(id);
    if (!existingItem) {
      return res.status(404).json({ message: "KOT item not found" });
    }
    
    // CRITICAL: Declining/canceling orders requires manager approval or valid reason
    if (updateData.status === 'declined' || updateData.status === 'cancelled') {
      const canDecline = ['manager', 'owner', 'restaurant_bar_manager'].includes(currentUser.role?.name || '');
      
      if (!canDecline) {
        return res.status(403).json({ 
          message: "Only managers can decline or cancel orders. Contact your supervisor." 
        });
      }
      
      // Require detailed reason
      if (!updateData.declineReason || updateData.declineReason.trim().length < 10) {
        return res.status(400).json({ 
          message: "Decline/cancellation requires detailed reason (minimum 10 characters)" 
        });
      }
      
      // Log the decline for audit
      await storage.createKotAuditLog({
        kotItemId: id,
        action: updateData.status,
        performedBy: currentUser.id,
        reason: updateData.declineReason,
        timestamp: new Date()
      });
    }
    
    // CRITICAL: When marking as completed, verify inventory was deducted
    if (updateData.status === 'completed' && existingItem.status !== 'completed') {
      // Get menu item to check inventory items
      const menuItem = await storage.getMenuItem(existingItem.menuItemId);
      
      // If menu item has inventory items, ensure deduction happened
      if (menuItem && menuItem.inventoryItems && menuItem.inventoryItems.length > 0) {
        // Inventory should have been deducted when status changed to 'in_progress'
        // This is additional verification
        updateData.inventoryVerified = true;
      }
    }
    
    const updatedItem = await storage.updateKotItem(id, updateData);
    res.json(updatedItem);
  } catch (error) {
    console.error("KOT item update error:", error);
    res.status(400).json({ message: "Failed to update KOT item" });
  }
});
```

2. **Add KOT audit log table to `shared/schema.ts`:**

```typescript
export const kotAuditLogs = pgTable("kot_audit_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  kotItemId: uuid("kot_item_id").references(() => kotItems.id),
  action: text("action").notNull(), // declined, cancelled, status_change
  performedBy: uuid("performed_by").references(() => users.id),
  reason: text("reason"),
  previousStatus: text("previous_status"),
  newStatus: text("new_status"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});
```

---

### **PROMPT 12: Require Payment Before Checkout - Validate Balance Clearance**

Add payment validation to checkout process.

**Requirements:**

1. **Modify `server/routes.ts` - Checkout endpoint:**

Find `POST /api/reservations/:id/check-out` and add:

```typescript
app.post("/api/reservations/:id/check-out", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const currentUser = req.user as any;
    const { id } = req.params;
    const { overrideBalance } = req.body;
    
    const reservation = await storage.getRoomReservation(id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    
    if (reservation.hotelId !== currentUser.hotelId) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    
    // CRITICAL: Check for outstanding balance
    const totalAmount = Number(reservation.totalAmount || 0);
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
        balanceDue,
        overriddenBy: currentUser.id,
        reason: req.body.overrideReason || 'Manager override',
        timestamp: new Date()
      });
    }
    
    // Process checkout
    const checkedOutReservation = await storage.checkOutGuest(id);
    
    res.json(checkedOutReservation);
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ message: "Failed to check out guest" });
  }
});
```

2. **Add override log to `shared/schema.ts`:**

```typescript
export const checkoutOverrideLogs = pgTable("checkout_override_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  reservationId: uuid("reservation_id").references(() => roomReservations.id),
  balanceDue: numeric("balance_due", { precision: 14, scale: 2 }),
  overriddenBy: uuid("overridden_by").references(() => users.id),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});
```

---

### **PROMPT 13: Stock Request Approval Validation - Check Inventory Levels**

Add inventory verification before approving stock requests.

**Requirements:**

1. **Modify `server/routes.ts` - Stock request approval (Line ~3508-3569):**

Find `POST /api/stock-requests/:id/approve` and update:

```typescript
app.post("/api/stock-requests/:id/approve", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const user = req.user as any;
    const { id } = req.params;
    
    // Only storekeeper and manager can approve
    const canApprove = ['storekeeper', 'manager', 'owner'].includes(user.role?.name || '');
    if (!canApprove) {
      return res.status(403).json({ 
        message: "Only storekeeper or manager can approve stock requests" 
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
    
    res.json(approvedRequest);
  } catch (error) {
    console.error("Stock request approval error:", error);
    res.status(500).json({ message: "Failed to approve stock request" });
  }
});
```

---

## 🟡 MEDIUM PRIORITY FIXES (Complete Third)

### **PROMPT 14: Fix Hall Booking Race Condition - Prevent Double Booking**

Apply same transaction locking as room reservations.

**Requirements:**

1. **Modify `server/storage.ts` - Hall booking creation:**

Find `createHallBooking` method and wrap in transaction:

```typescript
async createHallBooking(bookingData: InsertHallBooking): Promise<HallBooking> {
  return await db.transaction(async (tx) => {
    const { hallId, eventDate } = bookingData;
    
    // Lock the hall for update
    const [hall] = await tx
      .select()
      .from(halls)
      .where(eq(halls.id, hallId))
      .for('update');
    
    if (!hall) {
      throw new Error('Hall not found');
    }
    
    // Check for existing bookings on same date
    const eventDay = new Date(eventDate);
    eventDay.setHours(0, 0, 0, 0);
    const nextDay = new Date(eventDay);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const overlapping = await tx
      .select()
      .from(hallBookings)
      .where(
        and(
          eq(hallBookings.hallId, hallId),
          or(
            eq(hallBookings.status, 'confirmed'),
            eq(hallBookings.status, 'pending')
          ),
          gte(hallBookings.eventDate, eventDay),
          lt(hallBookings.eventDate, nextDay)
        )
      )
      .limit(1);
    
    if (overlapping.length > 0) {
      throw new Error('Hall is already booked for this date');
    }
    
    // Create booking
    const [booking] = await tx
      .insert(hallBookings)
      .values(bookingData)
      .returning();
    
    return booking;
  });
}
```

---

### **PROMPT 15: Fix Meal Voucher Race Condition - Prevent Duplicate Redemption**

Use database transaction for atomic voucher redemption.

**Requirements:**

1. **Modify `server/storage.ts` - Line ~2317-2333:**

```typescript
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
```

---

### **PROMPT 16: Make Financial Transactions Immutable - Replace Delete with Void**

Remove transaction deletion and implement void-only system.

**Requirements:**

1. **Remove transaction deletion endpoint from `server/routes.ts`:**

Find and remove or modify `DELETE /api/hotels/current/transactions/:id`:

```typescript
// REMOVE THIS ENDPOINT or convert to void:
app.delete("/api/hotels/current/transactions/:id", async (req, res) => {
  // This should not exist - transactions should never be deleted
  return res.status(403).json({ 
    message: "Transactions cannot be deleted. Use void functionality instead." 
  });
});
```

2. **Create void transaction endpoint:**

```typescript
app.post("/api/transactions/:id/void", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const currentUser = req.user as any;
    const { id } = req.params;
    const { reason } = req.body;
    
    // Only managers can void transactions
    const canVoid = ['manager', 'owner'].includes(currentUser.role?.name || '');
    if (!canVoid) {
      return res.status(403).json({ 
        message: "Only managers can void transactions" 
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
```

3. **Add void fields to transactions table in `shared/schema.ts` if not present:**

```typescript
isVoided: boolean("is_voided").default(false),
voidedBy: uuid("voided_by").references(() => users.id),
voidedAt: timestamp("voided_at", { withTimezone: true }),
voidReason: text("void_reason")
```

4. **Add void method to `server/storage.ts`:**

```typescript
async voidTransaction(id: string, voidedBy: string, reason: string): Promise<any> {
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
```

---

### **PROMPT 17: Restrict Maintenance Request Reassignment - Require Supervisor Approval**

Add approval workflow for task reassignment.

**Requirements:**

1. **Modify maintenance request update endpoint in `server/routes.ts`:**

Find maintenance request update (search for `PUT` and `maintenance-requests`) and add:

```typescript
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
      const canReassign = ['manager', 'owner', 'security_head', 'housekeeping_supervisor'].includes(currentUser.role?.name || '');
      
      if (!canReassign) {
        return res.status(403).json({ 
          message: "Only supervisors can reassign maintenance requests" 
        });
      }
      
      // Log reassignment for audit
      await storage.createMaintenanceAuditLog({
        requestId: id,
        action: 'reassigned',
        previousAssignee: existingRequest.assignedTo,
        newAssignee: updateData.assignedTo,
        reassignedBy: currentUser.id,
        timestamp: new Date()
      });
    }
    
    // Verify assigned user can update their own requests
    const isAssigned = existingRequest.assignedTo === currentUser.id;
    const isSupervisor = ['manager', 'owner', 'security_head', 'housekeeping_supervisor'].includes(currentUser.role?.name || '');
    
    if (!isAssigned && !isSupervisor) {
      return res.status(403).json({ 
        message: "You can only update requests assigned to you" 
      });
    }
    
    const updatedRequest = await storage.updateMaintenanceRequest(id, updateData);
    res.json(updatedRequest);
  } catch (error) {
    console.error("Maintenance request update error:", error);
    res.status(400).json({ message: "Failed to update maintenance request" });
  }
});
```

---

### **PROMPT 18: Require Manager Approval for Wastage - Prevent Theft via Fake Wastage**

Add approval workflow for wastage reporting.

**Requirements:**

1. **Modify wastage creation endpoint in `server/routes.ts`:**

Find `POST /api/hotels/current/wastages` and update:

```typescript
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
    
    // Validate required fields
    if (!wastageData.itemId || !wastageData.qty || !wastageData.reason) {
      return res.status(400).json({ 
        message: "Item, quantity, and reason are required" 
      });
    }
    
    // Require detailed reason (minimum 15 characters)
    if (wastageData.reason.trim().length < 15) {
      return res.status(400).json({ 
        message: "Wastage reason must be detailed (minimum 15 characters)" 
      });
    }
    
    // Get inventory item to check value
    const inventoryItem = await storage.getInventoryItem(wastageData.itemId);
    if (!inventoryItem) {
      return res.status(404).json({ message: "Inventory item not found" });
    }
    
    const wastageQty = Number(wastageData.qty);
    const itemCost = Number(inventoryItem.costPerUnit || 0);
    const wastageValue = wastageQty * itemCost;
    
    // CRITICAL: High-value wastage requires immediate manager approval
    const highValueThreshold = 1000; // Adjust based on your needs
    
    if (wastageValue > highValueThreshold) {
      const isManager = ['manager', 'owner'].includes(user.role?.name || '');
      
      if (!isManager) {
        // Create wastage with 'pending_approval' status
        const finalWastageData = {
          ...wastageData,
          hotelId: user.hotelId,
          reportedBy: user.id,
          status: 'pending_approval',
          estimatedValue: wastageValue
        };
        
        const wastage = await storage.createWastage(finalWastageData);
        
        // Notify manager
        const managerRole = await storage.getRoleByName('manager');
        if (managerRole) {
          const managers = await storage.getUsersByRole(user.hotelId, managerRole.id);
          for (const manager of managers) {
            await storage.createNotification({
              userId: manager.id,
              title: 'High-Value Wastage Approval Required',
              message: `${user.username} reported wastage of ${wastageData.qty} ${inventoryItem.name} (Value: ${wastageValue}). Reason: ${wastageData.reason}`,
              type: 'wastage_approval',
              relatedId: wastage.id
            });
          }
        }
        
        return res.status(201).json({ 
          ...wastage,
          message: "High-value wastage requires manager approval" 
        });
      }
    }
    
    // Low-value wastage or manager reporting - auto-approve
    const finalWastageData = {
      ...wastageData,
      hotelId: user.hotelId,
      reportedBy: user.id,
      status: 'approved',
      approvedBy: user.id,
      approvedAt: new Date(),
      estimatedValue: wastageValue
    };
    
    const wastage = await storage.createWastage(finalWastageData);
    res.status(201).json(wastage);
  } catch (error) {
    console.error("Wastage creation error:", error);
    res.status(400).json({ message: "Failed to report wastage" });
  }
});
```

2. **Add status field to wastages table in `shared/schema.ts` if not present:**

```typescript
status: text("status").default('pending_approval'),
approvedBy: uuid("approved_by").references(() => users.id),
approvedAt: timestamp("approved_at", { withTimezone: true }),
estimatedValue: numeric("estimated_value", { precision: 12, scale: 2 })
```

3. **Create wastage approval endpoint:**

```typescript
app.post("/api/wastages/:id/approve", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const currentUser = req.user as any;
    const { id } = req.params;
    const { approved, rejectionReason } = req.body;
    
    // Only managers can approve wastage
    const canApprove = ['manager', 'owner'].includes(currentUser.role?.name || '');
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
      res.json(approvedWastage);
    } else {
      if (!rejectionReason || rejectionReason.trim().length < 10) {
        return res.status(400).json({ 
          message: "Rejection reason required (minimum 10 characters)" 
        });
      }
      
      const rejectedWastage = await storage.rejectWastage(id, currentUser.id, rejectionReason);
      res.json(rejectedWastage);
    }
  } catch (error) {
    console.error("Wastage approval error:", error);
    res.status(500).json({ message: "Failed to process wastage approval" });
  }
});
```

---

### **PROMPT 19: Validate Vendor Payments - Require Purchase Order/Invoice**

Add invoice verification to payment creation.

**Requirements:**

1. **Modify transaction creation for vendor payments:**

Find transaction creation endpoint and add for vendor payments:

```typescript
// Inside POST /api/transactions endpoint
if (transactionData.purpose && transactionData.purpose.includes('vendor') || transactionData.vendorId) {
  // CRITICAL: Vendor payments require invoice/PO reference
  if (!transactionData.referenceNumber && !transactionData.invoiceNumber) {
    return res.status(400).json({ 
      message: "Vendor payments require invoice or purchase order reference" 
    });
  }
  
  // Only manager or owner can approve vendor payments
  const canApprove = ['manager', 'owner'].includes(currentUser.role?.name || '');
  if (!canApprove) {
    return res.status(403).json({ 
      message: "Only managers can approve vendor payments" 
    });
  }
  
  // Large vendor payments require additional verification
  const amount = Number(transactionData.amount || 0);
  if (amount > 10000) { // Adjust threshold as needed
    if (!transactionData.approvalDocuments || transactionData.approvalDocuments.length === 0) {
      return res.status(400).json({ 
        message: "Large vendor payments require supporting documentation" 
      });
    }
  }
}
```

---

### **PROMPT 20: Restrict Menu Item Price Changes - Require Manager Approval**

Add authorization check for price modifications.

**Requirements:**

1. **Modify menu item update endpoint in `server/routes.ts`:**

Find `PUT /api/hotels/current/menu-items/:id` and add:

```typescript
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
    const itemData = req.body;
    
    // Verify the menu item belongs to current hotel
    const existingItem = await storage.getMenuItem(id);
    if (!existingItem || existingItem.hotelId !== user.hotelId) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    
    // CRITICAL: Price changes require manager approval
    if ('price' in itemData && itemData.price !== existingItem.price) {
      const canChangePrice = ['manager', 'owner', 'restaurant_bar_manager'].includes(user.role?.name || '');
      
      if (!canChangePrice) {
        return res.status(403).json({ 
          message: "Only managers can change menu item prices" 
        });
      }
      
      // Log price change for audit
      await storage.createPriceChangeLog({
        itemId: id,
        itemName: existingItem.name,
        previousPrice: existingItem.price,
        newPrice: itemData.price,
        changedBy: user.id,
        timestamp: new Date()
      });
    }
    
    const item = await storage.updateMenuItem(id, itemData);
    res.json(item);
  } catch (error) {
    console.error("Menu item update error:", error);
    res.status(400).json({ message: "Failed to update menu item" });
  }
});
```

2. **Add price change log table to `shared/schema.ts`:**

```typescript
export const priceChangeLogs = pgTable("price_change_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: uuid("item_id"),
  itemType: text("item_type"), // menu_item, room, hall, etc.
  itemName: text("item_name"),
  previousPrice: numeric("previous_price", { precision: 12, scale: 2 }),
  newPrice: numeric("new_price", { precision: 12, scale: 2 }),
  changedBy: uuid("changed_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});
```

---

### **PROMPT 21: Prevent Guest Data Deletion - Use Soft Delete Only**

Ensure guest records are never permanently deleted.

**Requirements:**

1. **Verify `server/storage.ts` uses soft delete for guests (Line ~2375-2380):**

The current implementation should already use soft delete. Ensure it's correct:

```typescript
async deleteGuest(id: string): Promise<void> {
  // CRITICAL: Never hard delete - use soft delete only
  await db
    .update(guests)
    .set({ deletedAt: new Date() })
    .where(eq(guests.id, id));
  
  // Do NOT use: await db.delete(guests).where(eq(guests.id, id));
}
```

2. **Add validation to prevent recovering deleted guests without manager approval:**

```typescript
app.post("/api/guests/:id/restore", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const currentUser = req.user as any;
    const { id } = req.params;
    
    // Only managers can restore deleted guests
    const canRestore = ['manager', 'owner'].includes(currentUser.role?.name || '');
    if (!canRestore) {
      return res.status(403).json({ 
        message: "Only managers can restore deleted guest records" 
      });
    }
    
    const guest = await storage.restoreGuest(id, currentUser.hotelId);
    res.json(guest);
  } catch (error) {
    console.error("Guest restore error:", error);
    res.status(500).json({ message: "Failed to restore guest" });
  }
});
```

3. **Add restore method to `server/storage.ts`:**

```typescript
async restoreGuest(id: string, hotelId: string): Promise<Guest> {
  const [guest] = await db
    .update(guests)
    .set({ deletedAt: null })
    .where(and(
      eq(guests.id, id),
      eq(guests.hotelId, hotelId)
    ))
    .returning();
  
  return guest;
}
```

---

### **PROMPT 22: Restrict Tax Toggle - Require Owner Authorization**

Prevent tax evasion by restricting tax configuration.

**Requirements:**

1. **Modify tax update endpoint in `server/routes.ts` (Line ~1596-1603):**

```typescript
app.put("/api/hotels/current/taxes/:taxType", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const user = req.user as any;
    if (!user || !user.hotelId) {
      return res.status(400).json({ message: "User not associated with a hotel" });
    }
    
    // CRITICAL: Only owner can modify tax settings
    if (user.role?.name !== 'owner') {
      return res.status(403).json({ 
        message: "Only the hotel owner can modify tax settings" 
      });
    }
    
    const { taxType } = req.params;
    const { percent, isActive } = req.body;
    
    // Log tax configuration changes for audit
    const existingTax = await storage.getHotelTax(user.hotelId, taxType);
    await storage.createTaxChangeLog({
      hotelId: user.hotelId,
      taxType,
      previousPercent: existingTax?.percent,
      newPercent: percent,
      previousActive: existingTax?.isActive,
      newActive: isActive,
      changedBy: user.id,
      timestamp: new Date()
    });
    
    const tax = await storage.updateHotelTax(user.hotelId, taxType, isActive, percent);
    res.json(tax);
  } catch (error) {
    console.error("Tax update error:", error);
    res.status(400).json({ message: "Failed to update tax" });
  }
});
```

2. **Also update the other tax endpoint (Line ~2695-2703):**

Apply the same owner-only restriction to `PUT /api/hotels/:hotelId/taxes/:taxType`.

---

### **PROMPT 23: Prevent Room Status Manipulation - Track Status Changes**

Add audit logging and restrictions for room status changes.

**Requirements:**

1. **Modify room update endpoint:**

Find room update route and add:

```typescript
app.put("/api/rooms/:id", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const currentUser = req.user as any;
    const { id } = req.params;
    const updateData = req.body;
    
    const existingRoom = await storage.getRoom(id);
    if (!existingRoom || existingRoom.hotelId !== currentUser.hotelId) {
      return res.status(404).json({ message: "Room not found" });
    }
    
    // CRITICAL: Status changes require authorization
    if ('status' in updateData && updateData.status !== existingRoom.status) {
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
      
      // Log status change
      await storage.createRoomStatusLog({
        roomId: id,
        roomNumber: existingRoom.roomNumber,
        previousStatus: existingRoom.status,
        newStatus: updateData.status,
        reason: updateData.maintenanceReason || updateData.statusChangeReason,
        changedBy: currentUser.id,
        timestamp: new Date()
      });
    }
    
    const room = await storage.updateRoom(id, updateData);
    res.json(room);
  } catch (error) {
    console.error("Room update error:", error);
    res.status(400).json({ message: "Failed to update room" });
  }
});
```

2. **Add room status log table to `shared/schema.ts`:**

```typescript
export const roomStatusLogs = pgTable("room_status_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: uuid("room_id").references(() => rooms.id),
  roomNumber: text("room_number"),
  previousStatus: text("previous_status"),
  newStatus: text("new_status"),
  reason: text("reason"),
  changedBy: uuid("changed_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});
```

---

### **PROMPT 24: Restrict Vehicle Log Manipulation - Validate Checkout Timing**

Prevent immediate checkout of vehicle logs.

**Requirements:**

1. **Modify vehicle log checkout endpoint:**

Find `PATCH /api/vehicle-logs/:id/checkout` and add:

```typescript
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
    
    if (log.checkoutTime) {
      return res.status(400).json({ message: "Vehicle already checked out" });
    }
    
    // CRITICAL: Prevent immediate checkout (suspicious pattern)
    const checkinTime = new Date(log.checkinTime);
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
        type: 'quick_vehicle_checkout',
        description: `Vehicle ${log.vehicleNumber} checked out ${minutesDiff.toFixed(1)} minutes after check-in`,
        vehicleLogId: id,
        performedBy: currentUser.id,
        overriddenBy: currentUser.id,
        timestamp: new Date()
      });
    }
    
    const updatedLog = await storage.checkoutVehicle(id, checkout);
    res.json(updatedLog);
  } catch (error) {
    console.error("Vehicle checkout error:", error);
    res.status(500).json({ message: "Failed to checkout vehicle" });
  }
});
```

---

### **PROMPT 25: Prevent Unauthorized User Creation - Restrict by Role**

Ensure users can only create users within their authorization scope.

**Requirements:**

1. **Modify user creation endpoint (Line ~955-1010):**

The endpoint around line 955-1010 already has some role-based validation. Strengthen it:

```typescript
app.post("/api/hotels/current/users", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const currentUser = req.user as any;
    
    // CRITICAL: Define role hierarchy and creation permissions
    const rolePermissions: Record<string, string[]> = {
      owner: ['manager', 'restaurant_bar_manager', 'storekeeper', 'front_office', 
              'housekeeping_supervisor', 'security_head', 'waiter', 'chef', 
              'housekeeping', 'security_guard', 'cashier', 'accountant'],
      manager: ['waiter', 'chef', 'housekeeping', 'security_guard', 'cashier', 'front_office'],
      restaurant_bar_manager: ['waiter', 'chef'],
      security_head: ['security_guard'],
      housekeeping_supervisor: ['housekeeping'],
      // Other roles cannot create users
    };
    
    const currentRole = currentUser.role?.name || '';
    const allowedRoles = rolePermissions[currentRole] || [];
    
    if (allowedRoles.length === 0) {
      return res.status(403).json({ 
        message: "You don't have permission to create users" 
      });
    }
    
    // Handle role conversion
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
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
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
```

---

### **PROMPT 26: Add Active User Check to Authentication - Block Deactivated Users System-Wide**

Ensure deactivated users cannot access any protected routes.

**Requirements:**

1. **Modify `server/auth.ts`:**

Add the `requireActiveUser` middleware we created earlier and export it:

```typescript
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
```

2. **Apply to critical routes in `server/routes.ts`:**

Apply this middleware to financial and sensitive operations:

```typescript
// Example usage:
app.post("/api/transactions", requireActiveUser, async (req, res) => {
  // Transaction creation
});

app.post("/api/restaurant-bills", requireActiveUser, async (req, res) => {
  // Bill creation
});

app.post("/api/inventory-transactions", requireActiveUser, async (req, res) => {
  // Inventory operations
});

// Apply to all sensitive routes
```

3. **Alternative: Apply globally to all authenticated routes:**

Add check at the beginning of each authenticated endpoint or create a global middleware.

---

### **PROMPT 27: Implement Password Change Verification - Require Old Password**

If password change functionality exists, ensure it requires old password verification.

**Requirements:**

1. **Create or update password change endpoint in `server/routes.ts`:**

```typescript
app.post("/api/users/change-password", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const currentUser = req.user as any;
    const { oldPassword, newPassword, confirmPassword } = req.body;
    
    // CRITICAL: Require old password for verification
    if (!oldPassword) {
      return res.status(400).json({ 
        message: "Current password is required" 
      });
    }
    
    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ 
        message: "New password must be at least 8 characters" 
      });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        message: "New passwords don't match" 
      });
    }
    
    // Verify old password
    const user = await storage.getUser(currentUser.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const oldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!oldPasswordValid) {
      return res.status(401).json({ 
        message: "Current password is incorrect" 
      });
    }
    
    // Check if new password is different from old
    const samePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (samePassword) {
      return res.status(400).json({ 
        message: "New password must be different from current password" 
      });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await storage.updateUser(currentUser.id, { passwordHash: hashedPassword });
    
    res.json({ 
      success: true, 
      message: "Password changed successfully" 
    });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
});
```

2. **If password reset exists, require email verification:**

```typescript
app.post("/api/users/reset-password", async (req, res) => {
  // CRITICAL: This endpoint should:
  // 1. Require a valid reset token sent via email
  // 2. Verify token is not expired
  // 3. Verify token belongs to this user
  // 4. Never allow direct password reset without verification
  
  return res.status(501).json({ 
    message: "Password reset requires email verification - not yet implemented" 
  });
});
```

---

### **PROMPT 28: Add Comprehensive Audit Logging - Track All Sensitive Operations**

Create a centralized audit log system for tracking all critical operations.

**Requirements:**

1. **Create audit log table in `shared/schema.ts`:**

```typescript
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").references(() => hotels.id),
  userId: uuid("user_id").references(() => users.id),
  action: text("action").notNull(), // login, logout, create, update, delete, void, approve, etc.
  resourceType: text("resource_type").notNull(), // user, transaction, bill, inventory, etc.
  resourceId: text("resource_id"),
  details: jsonb("details"), // Store any additional context
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  success: boolean("success").default(true),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
```

2. **Create audit logging utility in `server/audit.ts`:**

```typescript
import { db } from "./db";
import { auditLogs } from "@shared/schema";

export async function logAudit(params: {
  hotelId?: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  errorMessage?: string;
}) {
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
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
    // Don't throw - audit failure shouldn't break operations
  }
}
```

3. **Apply audit logging to critical operations in `server/routes.ts`:**

```typescript
import { logAudit } from './audit';

// Example: Log user login
app.post("/api/login", async (req, res) => {
  // ... authentication logic ...
  
  await logAudit({
    userId: user.id,
    hotelId: user.hotelId,
    action: 'login',
    resourceType: 'user',
    resourceId: user.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    success: true
  });
});

// Example: Log bill void
app.post("/api/bill-payments/:paymentId/void", async (req, res) => {
  // ... void logic ...
  
  await logAudit({
    userId: currentUser.id,
    hotelId: currentUser.hotelId,
    action: 'void_payment',
    resourceType: 'bill_payment',
    resourceId: paymentId,
    details: { reason, amount: payment.amount },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });
});

// Add similar logging for:
// - Transaction creation/voiding
// - User role changes
// - Inventory adjustments
// - Price changes
// - Status changes (room, task, etc.)
// - Leave approvals/rejections
// - Wastage reporting
// - Bill amendments
```

4. **Create audit log viewing endpoint for managers:**

```typescript
app.get("/api/audit-logs", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const currentUser = req.user as any;
    
    // Only managers and owners can view audit logs
    const canViewAudit = ['manager', 'owner'].includes(currentUser.role?.name || '');
    if (!canViewAudit) {
      return res.status(403).json({ 
        message: "Only managers can view audit logs" 
      });
    }
    
    const { startDate, endDate, userId, action, resourceType } = req.query;
    
    // Build query with filters
    const conditions = [eq(auditLogs.hotelId, currentUser.hotelId)];
    
    if (userId) conditions.push(eq(auditLogs.userId, userId as string));
    if (action) conditions.push(eq(auditLogs.action, action as string));
    if (resourceType) conditions.push(eq(auditLogs.resourceType, resourceType as string));
    
    const logs = await db
      .select()
      .from(auditLogs)
      .where(and(...conditions))
      .orderBy(desc(auditLogs.createdAt))
      .limit(500);
    
    res.json(logs);
  } catch (error) {
    console.error("Audit log fetch error:", error);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
});
```

---

## ✅ COMPLETION CHECKLIST

After implementing all 28 prompts, verify:

- [ ] Attendance system is fully functional with clock in/out
- [ ] Users cannot escalate their own roles
- [ ] Deactivated users cannot use the system
- [ ] Inventory transactions are validated and tracked
- [ ] Bills cannot be manipulated after payment
- [ ] Vouchers have usage limits properly enforced
- [ ] Payments can only be voided by managers with reason
- [ ] Leave requests cannot be backdated
- [ ] Tasks require manager approval for completion
- [ ] Room/hall bookings prevent double-booking
- [ ] KOT changes require authorization
- [ ] Checkout requires payment clearance
- [ ] Stock requests verify inventory levels
- [ ] Transactions cannot be deleted (void only)
- [ ] Maintenance tasks cannot be endlessly reassigned
- [ ] Wastage requires manager approval for high-value items
- [ ] Vendor payments require invoice references
- [ ] Menu prices cannot be changed by waiters
- [ ] Guest data uses soft delete only
- [ ] Tax settings restricted to owner
- [ ] Room status changes are tracked
- [ ] Vehicle logs validate checkout timing
- [ ] User creation follows role hierarchy
- [ ] Password changes require old password
- [ ] Comprehensive audit logging is active

---

## 📝 NOTES

- Test each fix thoroughly before moving to the next
- Run `npm run db:push` after schema changes to update database
- Check workflow logs after implementing backend changes
- Verify with actual user scenarios (e.g., try to escalate role, manipulate inventory)
- Consider creating automated tests for critical security checks
- Review audit logs regularly for suspicious patterns

---

**IMPLEMENTATION ORDER:**
1. Critical (1-7): Immediate financial and access control risks
2. High (8-13): Data integrity and workflow security
3. Medium (14-28): Additional protections and audit capabilities

Each prompt can be sent individually to Replit AI for implementation.
