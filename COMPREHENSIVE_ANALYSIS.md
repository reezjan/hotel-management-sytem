# Hotel Management System - Comprehensive Analysis & Fix Guide

**Generated:** October 24, 2025  
**Status:** Critical Issues Identified

---

## 🚨 CRITICAL BUGS

### 1. **KOT Order Category Filtering Missing** ⚠️ CRITICAL

**Location:** 
- `client/src/pages/dashboard/barista.tsx` (Lines 69-73)
- `client/src/pages/dashboard/bartender.tsx` (Lines 69-73)
- `client/src/pages/dashboard/kitchen-staff.tsx` (Lines 67-71)

**Problem:**
All three departments (Barista, Bartender, Kitchen Staff) fetch ALL KOT orders from the hotel without filtering by menu item category. This means:
- ❌ Barista sees bartender's drink orders (whiskey, beer, wine)
- ❌ Bartender sees kitchen's food orders (biryani, curry, grilled salmon)
- ❌ Kitchen staff sees barista's coffee orders (espresso, cappuccino)

**Current Code:**
```typescript
// ALL THREE DASHBOARDS USE THIS - NO FILTERING!
const { data: kotOrders = [] } = useQuery({
  queryKey: ["/api/hotels/current/kot-orders"],
  refetchInterval: 3000,
  refetchIntervalInBackground: true
});
```

**Security Impact:**
- Staff can see orders they shouldn't handle
- Risk of order manipulation across departments
- No audit trail for who viewed which orders
- Potential for staff collusion to manipulate orders

**Business Impact:**
- Orders sent to wrong department
- Delayed preparation and angry customers
- Staff confusion and inefficiency
- Revenue loss from wrong/delayed orders

---

### FIX PROMPT #1: Add Category-Based KOT Filtering

#### Step 1: Update Backend API to Support Category Filtering

**File:** `server/routes.ts` (around line 1296)

**Current:**
```typescript
app.get("/api/hotels/current/kot-orders", async (req, res) => {
  // ... auth code ...
  const kotOrders = await storage.getKotOrdersByHotel(user.hotelId);
  res.json(kotOrders);
});
```

**Fix:**
```typescript
app.get("/api/hotels/current/kot-orders", async (req, res) => {
  const user = req.user as any;
  if (!user || !user.hotelId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Get category filter from query parameter
  const categoryFilter = req.query.category as string | undefined;
  
  const kotOrders = await storage.getKotOrdersByHotel(user.hotelId, categoryFilter);
  res.json(kotOrders);
});
```

#### Step 2: Update Storage Layer to Filter by Category

**File:** `server/storage.ts` (around line 1427)

**Update Method Signature:**
```typescript
async getKotOrdersByHotel(hotelId: string, categoryFilter?: string): Promise<any[]> {
  const orders = await db
    .select()
    .from(kotOrders)
    .where(eq(kotOrders.hotelId, hotelId))
    .orderBy(desc(kotOrders.createdAt));
  
  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      let itemsQuery = db
        .select({
          itemId: kotItems.id,
          itemKotId: kotItems.kotId,
          itemMenuItemId: kotItems.menuItemId,
          itemQty: kotItems.qty,
          itemNotes: kotItems.description,
          itemStatus: kotItems.status,
          itemDeclineReason: kotItems.declineReason,
          menuItemId: menuItems.id,
          menuItemName: menuItems.name,
          menuItemPrice: menuItems.price,
          menuItemCategoryId: menuItems.categoryId,
          categoryId: menuCategories.id,
          categoryName: menuCategories.name
        })
        .from(kotItems)
        .leftJoin(menuItems, eq(kotItems.menuItemId, menuItems.id))
        .leftJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
        .where(eq(kotItems.kotId, order.id));
      
      const itemResults = await itemsQuery;
      
      // Filter items by category if specified
      let filteredItems = itemResults;
      if (categoryFilter) {
        filteredItems = itemResults.filter(row => 
          row.categoryName?.toLowerCase() === categoryFilter.toLowerCase()
        );
      }
      
      const items = filteredItems.map(row => ({
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
          categoryId: row.menuItemCategoryId,
          categoryName: row.categoryName
        } : null
      }));
      
      return {
        ...order,
        items
      };
    })
  );
  
  // Only return orders that have items after filtering
  return ordersWithItems.filter(order => order.items.length > 0);
}
```

#### Step 3: Update Interface Definition

**File:** `server/storage.ts` (around line 256)

**Update:**
```typescript
getKotOrdersByHotel(hotelId: string, categoryFilter?: string): Promise<KotOrder[]>;
```

#### Step 4: Update Barista Dashboard to Filter for Beverages

**File:** `client/src/pages/dashboard/barista.tsx` (Line 69)

**Fix:**
```typescript
const { data: kotOrders = [] } = useQuery({
  queryKey: ["/api/hotels/current/kot-orders", { category: "Beverages" }],
  queryFn: async () => {
    const response = await fetch("/api/hotels/current/kot-orders?category=Beverages", {
      credentials: "include"
    });
    if (!response.ok) throw new Error("Failed to fetch KOT orders");
    return response.json();
  },
  refetchInterval: 3000,
  refetchIntervalInBackground: true
});
```

#### Step 5: Update Bartender Dashboard to Filter for Drinks/Alcohol

**File:** `client/src/pages/dashboard/bartender.tsx` (Line 69)

**Note:** Assuming "Drinks" or "Alcoholic Beverages" category exists. Adjust based on actual category names.

**Fix:**
```typescript
const { data: kotOrders = [] } = useQuery({
  queryKey: ["/api/hotels/current/kot-orders", { category: "Drinks" }],
  queryFn: async () => {
    const response = await fetch("/api/hotels/current/kot-orders?category=Drinks", {
      credentials: "include"
    });
    if (!response.ok) throw new Error("Failed to fetch KOT orders");
    return response.json();
  },
  refetchInterval: 3000,
  refetchIntervalInBackground: true
});
```

#### Step 6: Update Kitchen Staff Dashboard to Filter for Food Items

**File:** `client/src/pages/dashboard/kitchen-staff.tsx` (Line 67)

**Fix Option A - Multiple Categories:**
```typescript
const { data: kotOrders = [] } = useQuery({
  queryKey: ["/api/hotels/current/kot-orders", { category: "food" }],
  queryFn: async () => {
    // Fetch multiple categories for kitchen (Main Course, Appetizers, Breakfast, Desserts)
    const categories = ["Main Course", "Appetizers", "Breakfast", "Desserts"];
    const allOrders = await Promise.all(
      categories.map(async (cat) => {
        const response = await fetch(`/api/hotels/current/kot-orders?category=${encodeURIComponent(cat)}`, {
          credentials: "include"
        });
        if (!response.ok) return [];
        return response.json();
      })
    );
    
    // Merge and deduplicate orders by ID
    const ordersMap = new Map();
    allOrders.flat().forEach(order => {
      if (!ordersMap.has(order.id)) {
        ordersMap.set(order.id, order);
      } else {
        // Merge items from same order
        const existing = ordersMap.get(order.id);
        existing.items = [...existing.items, ...order.items];
      }
    });
    
    return Array.from(ordersMap.values());
  },
  refetchInterval: 3000,
  refetchIntervalInBackground: true
});
```

**Fix Option B - Backend Support for Multiple Categories (Better):**

Update backend to accept multiple categories:
```typescript
// In routes.ts
const categories = req.query.categories as string | string[] | undefined;
const categoryFilters = Array.isArray(categories) ? categories : categories ? [categories] : undefined;
const kotOrders = await storage.getKotOrdersByHotel(user.hotelId, categoryFilters);
```

Then frontend:
```typescript
const { data: kotOrders = [] } = useQuery({
  queryKey: ["/api/hotels/current/kot-orders", { categories: ["Main Course", "Appetizers", "Breakfast", "Desserts"] }],
  queryFn: async () => {
    const categories = ["Main Course", "Appetizers", "Breakfast", "Desserts"];
    const params = new URLSearchParams();
    categories.forEach(cat => params.append("categories", cat));
    
    const response = await fetch(`/api/hotels/current/kot-orders?${params}`, {
      credentials: "include"
    });
    if (!response.ok) throw new Error("Failed to fetch KOT orders");
    return response.json();
  },
  refetchInterval: 3000,
  refetchIntervalInBackground: true
});
```

---

### TEST CASES FOR FIX #1

#### Test Case 1: Barista Only Sees Beverage Orders
**Steps:**
1. Login as Admin
2. Navigate to Restaurant → Menu Management
3. Ensure "Beverages" category exists with items (Espresso, Cappuccino, etc.)
4. Create a new KOT order with:
   - 2x Espresso (Beverages)
   - 1x Grilled Salmon (Main Course)
   - 1x Spring Rolls (Appetizers)
5. Login as Barista role
6. Navigate to Barista Dashboard

**Expected Result:**
- ✅ Only Espresso order (2x) should appear
- ❌ Grilled Salmon should NOT appear
- ❌ Spring Rolls should NOT appear
- Counter should show: Pending Orders = 1 (only the Espresso order)

**Actual Result (Before Fix):**
- Shows ALL 3 items from the order

---

#### Test Case 2: Bartender Only Sees Drink Orders
**Steps:**
1. Login as Admin
2. Create KOT order with:
   - 1x Beer (Drinks)
   - 1x Cappuccino (Beverages)
   - 1x Biryani (Main Course)
3. Login as Bartender role
4. Navigate to Bartender Dashboard

**Expected Result:**
- ✅ Only Beer order should appear
- ❌ Cappuccino should NOT appear (that's for barista)
- ❌ Biryani should NOT appear
- Counter should show: Pending Orders = 1

---

#### Test Case 3: Kitchen Staff Only Sees Food Orders
**Steps:**
1. Login as Admin
2. Create KOT order with:
   - 1x Espresso (Beverages)
   - 1x Beer (Drinks)
   - 1x Grilled Salmon (Main Course)
   - 1x Spring Rolls (Appetizers)
   - 1x Chocolate Cake (Desserts)
3. Login as Kitchen Staff role
4. Navigate to Kitchen Staff Dashboard

**Expected Result:**
- ✅ Grilled Salmon should appear
- ✅ Spring Rolls should appear
- ✅ Chocolate Cake should appear
- ❌ Espresso should NOT appear
- ❌ Beer should NOT appear
- Counter should show: Pending Orders = 1 (with 3 food items)

---

#### Test Case 4: Cross-Department Order Isolation
**Steps:**
1. Login as Admin
2. Create two separate KOT orders:
   - Order #1 (Table 1): 2x Espresso (Beverages)
   - Order #2 (Table 2): 1x Grilled Salmon (Main Course)
3. Login as Barista → should see only Order #1
4. Barista approves Espresso
5. Login as Kitchen Staff → should see only Order #2
6. Kitchen Staff approves Salmon
7. Login as Bartender → should see NO orders

**Expected Result:**
- Each department sees only their relevant orders
- Approving in one department doesn't affect other departments
- Empty departments show "No pending orders"

---

#### Test Case 5: Mixed Order Handling
**Steps:**
1. Create KOT order from Room Service (Room 101) with:
   - 1x Cappuccino (Beverages)
   - 1x Grilled Salmon (Main Course)
2. Login as Barista
3. Verify only Cappuccino appears
4. Barista sets Cappuccino to "Ready"
5. Login as Kitchen Staff
6. Verify only Salmon appears
7. Kitchen Staff sets Salmon to "Ready"
8. Login as Front Desk
9. Verify entire order shows as ready for delivery

**Expected Result:**
- Each department processes only their part of the order
- Front desk can see full order status
- Order marked complete only when ALL items ready

---

## 🔒 SECURITY VULNERABILITIES

### 2. **No Role-Based Access Control on KOT Item Updates** ⚠️ HIGH SEVERITY

**Location:** `server/routes.ts` (KOT item update endpoint)

**Problem:**
Any authenticated user can update ANY KOT item status, regardless of role or department assignment.

**Attack Scenario:**
1. Barista could approve kitchen's food orders
2. Kitchen staff could decline barista's coffee orders
3. Staff from different departments can manipulate each other's workflows

**Current Code:**
```typescript
app.put("/api/kot-items/:id", requireActiveUser, async (req, res) => {
  // No check if user's role should handle this item's category
  const updatedItem = await storage.updateKotItem(id, validatedData);
});
```

**Fix Prompt #2: Add Role-Based KOT Item Access Control**

**File:** `server/routes.ts`

**Add before update:**
```typescript
app.put("/api/kot-items/:id", requireActiveUser, async (req, res) => {
  const user = req.user as any;
  const { id } = req.params;
  
  // Fetch the KOT item with menu category
  const kotItem = await storage.getKotItemById(id);
  if (!kotItem) {
    return res.status(404).json({ message: "KOT item not found" });
  }
  
  // Fetch menu item with category
  const menuItem = await storage.getMenuItemById(kotItem.menuItemId);
  if (!menuItem || !menuItem.category) {
    return res.status(400).json({ message: "Menu item category not found" });
  }
  
  // Get user's role name
  const userRole = await storage.getRoleById(user.roleId);
  if (!userRole) {
    return res.status(403).json({ message: "Invalid user role" });
  }
  
  // Define role-category permissions
  const rolePermissions: Record<string, string[]> = {
    'barista': ['Beverages'],
    'bartender': ['Drinks', 'Alcoholic Beverages'],
    'kitchen_staff': ['Main Course', 'Appetizers', 'Breakfast', 'Desserts', 'Sides']
  };
  
  // Check if user's role can modify this category
  const allowedCategories = rolePermissions[userRole.name.toLowerCase()] || [];
  if (!allowedCategories.includes(menuItem.category.name)) {
    // Log unauthorized access attempt
    await storage.createAuditLog({
      hotelId: user.hotelId,
      userId: user.id,
      action: 'unauthorized_kot_update',
      resourceType: 'kot_item',
      resourceId: id,
      details: {
        attemptedCategory: menuItem.category.name,
        userRole: userRole.name,
        allowedCategories
      },
      success: false,
      errorMessage: 'User role not authorized for this item category'
    });
    
    return res.status(403).json({ 
      message: `${userRole.name} cannot modify ${menuItem.category.name} items` 
    });
  }
  
  // Proceed with update
  const validatedData = kotItemUpdateSchema.parse(req.body);
  const updatedItem = await storage.updateKotItem(id, validatedData);
  
  // Log successful update
  await storage.createAuditLog({
    hotelId: user.hotelId,
    userId: user.id,
    action: 'kot_item_updated',
    resourceType: 'kot_item',
    resourceId: id,
    details: {
      category: menuItem.category.name,
      statusChange: validatedData.status,
      role: userRole.name
    },
    success: true
  });
  
  res.json(updatedItem);
});
```

**Test Case for Fix #2:**

**Test: Cross-Department KOT Manipulation Prevention**
1. Login as Admin
2. Create KOT order with Espresso (Beverages)
3. Note the KOT item ID from network tab
4. Login as Kitchen Staff
5. Open browser console
6. Try to update the Espresso item:
```javascript
fetch('/api/kot-items/[ESPRESSO_ITEM_ID]', {
  method: 'PUT',
  headers: {'Content-Type': 'application/json'},
  credentials: 'include',
  body: JSON.stringify({status: 'declined', declineReason: 'Testing cross-dept access'})
})
```

**Expected Result:**
- ❌ Request should return 403 Forbidden
- ✅ Error message: "kitchen_staff cannot modify Beverages items"
- ✅ Audit log should record unauthorized attempt
- ✅ Item status should remain unchanged

---

### 3. **Wastage Photo Timestamp Can Be Manipulated** ⚠️ MEDIUM SEVERITY

**Location:** `client/src/pages/dashboard/barista.tsx` (Lines 159-180)

**Problem:**
Photo timestamp is added client-side using JavaScript canvas. Staff can manipulate device time before capturing photo.

**Attack Scenario:**
1. Staff wastes inventory on Day 1
2. Changes device date to Day 30
3. Captures wastage photo with fake timestamp
4. Submits wastage record with wrong date

**Current Code:**
```typescript
const capturePhoto = () => {
  const timestamp = new Date().toLocaleString(); // Client-side timestamp!
  // ... adds timestamp to image ...
};
```

**Fix Prompt #3: Server-Side Timestamp Verification**

**Backend Fix - File:** `server/routes.ts` (wastage creation endpoint)

**Add server timestamp validation:**
```typescript
app.post("/api/hotels/current/wastages", requireActiveUser, upload.single('photo'), async (req, res) => {
  // ... existing code ...
  
  // SERVER-SIDE timestamp - ignore client timestamp
  const serverTimestamp = new Date();
  
  // Re-watermark the image with server timestamp
  const photoBuffer = req.file.buffer;
  const watermarkedPhoto = await addServerTimestamp(photoBuffer, serverTimestamp);
  
  // Store with server timestamp
  const wastageData = {
    hotelId: user.hotelId,
    itemId: req.body.itemId,
    qty: req.body.qty,
    unit: req.body.unit,
    reason: req.body.reason,
    recordedBy: user.id,
    photoUrl: watermarkedPhotoUrl,
    photoTimestamp: serverTimestamp, // Use server time, not client
    photoCapturedByDevice: req.headers['user-agent'],
    createdAt: serverTimestamp
  };
  
  // ... create wastage record ...
});
```

**Helper function:**
```typescript
async function addServerTimestamp(imageBuffer: Buffer, timestamp: Date): Promise<Buffer> {
  const sharp = require('sharp');
  const timestampText = timestamp.toISOString();
  
  const svg = `
    <svg width="400" height="50">
      <rect width="400" height="50" fill="black" opacity="0.7"/>
      <text x="10" y="30" font-family="Arial" font-size="16" fill="white" font-weight="bold">
        Server Time: ${timestampText}
      </text>
    </svg>
  `;
  
  return sharp(imageBuffer)
    .composite([{
      input: Buffer.from(svg),
      gravity: 'southeast'
    }])
    .toBuffer();
}
```

---

### 4. **No Transaction Amount Limits Enforcement** ⚠️ HIGH SEVERITY

**Location:** Multiple transaction creation endpoints

**Problem:**
`roleLimits` table defines `maxTransactionAmount`, `maxDailyAmount`, but these are not enforced anywhere in the code.

**Attack Scenario:**
1. Front desk staff has limit of 10,000 NPR per transaction
2. Staff creates 50,000 NPR cash withdrawal transaction
3. System accepts it without checking limits
4. Embezzlement occurs

**Fix Prompt #4: Enforce Role Transaction Limits**

**File:** `server/routes.ts` (transaction creation endpoint)

**Add before creating transaction:**
```typescript
app.post("/api/hotels/current/transactions", requireActiveUser, async (req, res) => {
  const user = req.user as any;
  const amount = Number(req.body.amount);
  
  // Fetch role limits
  const roleLimits = await storage.getRoleLimitsByHotelAndRole(user.hotelId, user.roleId);
  
  if (roleLimits) {
    // Check single transaction limit
    if (roleLimits.maxTransactionAmount && amount > Number(roleLimits.maxTransactionAmount)) {
      return res.status(403).json({
        message: `Transaction amount (${amount}) exceeds your limit of ${roleLimits.maxTransactionAmount}`,
        requiresApproval: true,
        limit: roleLimits.maxTransactionAmount
      });
    }
    
    // Check daily limit
    if (roleLimits.maxDailyAmount) {
      const todayTotal = await storage.getUserDailyTransactionTotal(user.id);
      if (todayTotal + amount > Number(roleLimits.maxDailyAmount)) {
        return res.status(403).json({
          message: `This transaction would exceed your daily limit of ${roleLimits.maxDailyAmount}. Today's total: ${todayTotal}`,
          requiresApproval: true,
          dailyLimit: roleLimits.maxDailyAmount,
          todayTotal
        });
      }
    }
    
    // Check if requires approval
    if (roleLimits.requiresApprovalAbove && amount > Number(roleLimits.requiresApprovalAbove)) {
      req.body.requiresApproval = true;
    }
  }
  
  // ... continue with transaction creation ...
});
```

**Add to storage.ts:**
```typescript
async getUserDailyTransactionTotal(userId: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const result = await db
    .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(transactions)
    .where(
      and(
        eq(transactions.createdBy, userId),
        gte(transactions.createdAt, today),
        eq(transactions.isVoided, false)
      )
    );
  
  return Number(result[0]?.total || 0);
}
```

**Test Case:**
1. Login as Owner
2. Set Front Desk role limit: maxTransactionAmount = 5000
3. Login as Front Desk
4. Try to create expense transaction of 10,000 NPR
5. **Expected:** Error message about exceeding limit
6. **Actual (before fix):** Transaction created successfully

---

## 📊 BUSINESS LOGIC FLAWS

### 5. **No Inventory Validation Before KOT Approval** ⚠️ MEDIUM SEVERITY

**Problem:**
Kitchen/Barista/Bartender can approve KOT items without checking if ingredients are in stock.

**Impact:**
- Orders approved but cannot be fulfilled
- Customer complaints
- Staff has to decline after approval, looks unprofessional

**Fix Prompt #5: Add Inventory Check Before KOT Approval**

**File:** `server/routes.ts` (KOT item update endpoint)

**Add before approving:**
```typescript
app.put("/api/kot-items/:id", requireActiveUser, async (req, res) => {
  const { status } = req.body;
  
  if (status === 'approved') {
    // Check if menu item has recipe defined
    const menuItem = await storage.getMenuItemById(kotItem.menuItemId);
    
    if (menuItem.recipe && Array.isArray(menuItem.recipe.ingredients)) {
      // Check each ingredient availability
      const insufficientItems = [];
      
      for (const ingredient of menuItem.recipe.ingredients) {
        const inventoryItem = await storage.getInventoryItemById(ingredient.itemId);
        const requiredQty = ingredient.quantity * kotItem.qty;
        
        if (!inventoryItem || Number(inventoryItem.stockQty) < requiredQty) {
          insufficientItems.push({
            name: inventoryItem?.name || 'Unknown',
            required: requiredQty,
            available: inventoryItem?.stockQty || 0,
            unit: inventoryItem?.unit || ''
          });
        }
      }
      
      if (insufficientItems.length > 0) {
        return res.status(400).json({
          message: "Insufficient inventory to prepare this item",
          insufficientItems,
          suggestion: "Please update inventory or decline the order"
        });
      }
    }
  }
  
  // ... proceed with approval ...
});
```

---

### 6. **No Automatic Inventory Deduction After KOT Completion** ⚠️ HIGH SEVERITY

**Problem:**
When KOT items are marked "ready", inventory is not automatically reduced. Manual consumption entry required.

**Impact:**
- Inventory counts become inaccurate
- Risk of running out without knowing
- Staff may forget to record consumption

**Fix Prompt #6: Auto-Deduct Inventory on KOT Ready**

**File:** `server/routes.ts` (KOT item status update)

**Add after setting status to 'ready':**
```typescript
if (newStatus === 'ready' && previousStatus === 'approved') {
  // Auto-deduct inventory based on recipe
  const menuItem = await storage.getMenuItemById(kotItem.menuItemId);
  
  if (menuItem.recipe && Array.isArray(menuItem.recipe.ingredients)) {
    for (const ingredient of menuItem.recipe.ingredients) {
      const qtyToDeduct = ingredient.quantity * kotItem.qty;
      
      await storage.createInventoryConsumption({
        hotelId: user.hotelId,
        itemId: ingredient.itemId,
        qty: qtyToDeduct,
        unit: ingredient.unit,
        reason: `KOT Item: ${menuItem.name} (x${kotItem.qty})`,
        referenceEntity: `kot_item:${kotItem.id}`,
        createdBy: user.id
      });
      
      // Update inventory stock
      await storage.updateInventoryItemStock(
        ingredient.itemId,
        -qtyToDeduct
      );
    }
    
    // Log inventory deduction
    await storage.createAuditLog({
      hotelId: user.hotelId,
      userId: user.id,
      action: 'auto_inventory_deduction',
      resourceType: 'kot_item',
      resourceId: kotItem.id,
      details: {
        menuItem: menuItem.name,
        quantity: kotItem.qty,
        ingredients: menuItem.recipe.ingredients
      }
    });
  }
}
```

---

## 🔐 STAFF CHEATING OPPORTUNITIES

### 7. **Void Transaction Without Photo Evidence** ⚠️ HIGH SEVERITY

**Problem:**
Staff can void transactions with just a text reason, no photo proof required.

**Cheating Scenario:**
1. Staff creates legitimate cash transaction of 5,000 NPR
2. Pockets the cash
3. Later voids the transaction with reason "Duplicate entry"
4. No way to prove transaction was real

**Fix Prompt #7: Require Photo Evidence for Transaction Voids**

**File:** Create new void transaction modal with camera requirement

**Update transaction void endpoint:**
```typescript
app.put("/api/transactions/:id/void", requireActiveUser, upload.single('evidence_photo'), async (req, res) => {
  const user = req.user as any;
  const { id } = req.params;
  
  // Require photo for cash/high-value voids
  const transaction = await storage.getTransactionById(id);
  
  if (transaction.paymentMethod === 'cash' || Number(transaction.amount) > 1000) {
    if (!req.file) {
      return res.status(400).json({
        message: "Photo evidence required for cash transaction voids or amounts over 1000"
      });
    }
  }
  
  // Store photo with server timestamp
  const photoUrl = await uploadToStorage(req.file.buffer, 'void-evidence');
  
  const voidData = {
    isVoided: true,
    voidedBy: user.id,
    voidedAt: new Date(),
    voidReason: req.body.reason,
    voidEvidencePhotoUrl: photoUrl
  };
  
  // ... update transaction ...
});
```

---

### 8. **Room Service Charges Can Be Added Without Guest Consent** ⚠️ HIGH SEVERITY

**Problem:**
Front desk can add arbitrary charges to room bills without any verification or guest signature.

**Cheating Scenario:**
1. Guest checks into room 101
2. Staff adds fake room service charges (2x Pizza, 3x Beer)
3. Guest receives bill at checkout with charges they didn't order
4. Staff pockets the charged amount

**Current Location:** `client/src/components/modals/room-service-charge-modal.tsx`

**Fix Prompt #8: Require Guest Confirmation for Room Charges**

**Add confirmation requirement:**
```typescript
// Update room service charge schema
export const insertRoomServiceChargeSchema = createInsertSchema(roomServiceCharges).extend({
  guestSignature: z.string().min(1, "Guest signature required"),
  guestPhoneConfirmation: z.string().optional(),
  staffMemberId: z.string().min(1, "Staff member ID required")
});
```

**Update modal to include:**
1. Digital signature canvas
2. SMS confirmation option
3. Photo of guest acknowledgment

**Backend validation:**
```typescript
app.post("/api/hotels/current/room-service-charges", requireActiveUser, async (req, res) => {
  // Validate guest signature exists
  if (!req.body.guestSignature || req.body.guestSignature.length < 100) {
    return res.status(400).json({
      message: "Valid guest signature required for room charges"
    });
  }
  
  // Log the charge addition
  await storage.createAuditLog({
    hotelId: user.hotelId,
    userId: user.id,
    action: 'room_charge_added',
    resourceType: 'room_service_charge',
    resourceId: chargeId,
    details: {
      reservationId: req.body.reservationId,
      amount: req.body.amount,
      hasSignature: true,
      staffMember: user.fullName
    }
  });
  
  // ... create charge ...
});
```

---

### 9. **Multiple Staff Can Simultaneously Process Same Order** ⚠️ MEDIUM SEVERITY

**Problem:**
No locking mechanism. Two kitchen staff can both approve same order item.

**Scenario:**
1. Pending order for "Grilled Salmon" appears
2. Staff A clicks "Approve" button
3. Staff B clicks "Approve" button simultaneously
4. Both requests succeed, order processed twice

**Fix Prompt #9: Add Optimistic Locking for KOT Items**

**File:** `server/routes.ts`

**Add version check:**
```typescript
app.put("/api/kot-items/:id", requireActiveUser, async (req, res) => {
  const { id } = req.params;
  const { status, version } = req.body; // Client sends current version
  
  // Fetch current item with row lock
  const currentItem = await db
    .select()
    .from(kotItems)
    .where(eq(kotItems.id, id))
    .for('update') // Row-level lock
    .limit(1);
  
  if (!currentItem[0]) {
    return res.status(404).json({ message: "KOT item not found" });
  }
  
  // Check if version matches
  if (version && currentItem[0].version !== version) {
    return res.status(409).json({
      message: "This item was modified by another user. Please refresh.",
      currentItem: currentItem[0]
    });
  }
  
  // Update with version increment
  const [updatedItem] = await db
    .update(kotItems)
    .set({
      ...req.body,
      version: (currentItem[0].version || 0) + 1
    })
    .where(eq(kotItems.id, id))
    .returning();
  
  res.json(updatedItem);
});
```

**Schema update needed:**
```typescript
// Add to kotItems table
export const kotItems = pgTable("kot_items", {
  // ... existing fields ...
  version: integer("version").default(0).notNull()
});
```

---

## 🐛 ADDITIONAL BUGS

### 10. **Database Parameter Type Mismatches** ⚠️ LOW-MEDIUM SEVERITY

**Problem:**
The scratchpad mentions "Common Replit AI parameter mismatches need resolution"

**Likely Issues:**
- Passing string IDs where UUID type expected
- Numeric fields passed as strings
- Date format inconsistencies

**Generic Fix Approach:**

**Add type validation middleware:**
```typescript
function validateUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// Use in routes
app.get("/api/kot-items/:id", (req, res) => {
  if (!validateUUID(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }
  // ... continue ...
});
```

---

### 11. **No WebSocket Reconnection Logic** ⚠️ LOW SEVERITY

**Location:** `client/src/hooks/use-websocket.tsx`

**Problem:**
If WebSocket connection drops, no automatic reconnection. Staff miss real-time updates.

**Fix:** Add reconnection with exponential backoff (already common pattern, implementation needed)

---

### 12. **LSP Errors in Maintenance Pages** ⚠️ LOW SEVERITY

**Location:**
- `client/src/pages/dashboard/barista/maintenance.tsx`
- `client/src/pages/dashboard/bartender/maintenance.tsx`
- `client/src/pages/dashboard/kitchen-staff/maintenance.tsx`

**Fix:** Run LSP diagnostics to see specific errors, then fix type/import issues.

---

## 📋 SUMMARY PRIORITY LIST

### 🔴 CRITICAL (Fix Immediately)
1. ✅ **KOT Order Category Filtering** - Departments seeing all orders
2. ✅ **Role-Based KOT Access Control** - Cross-department manipulation
3. ✅ **Transaction Limit Enforcement** - Embezzlement risk
4. ✅ **Room Charge Guest Consent** - Fraudulent billing

### 🟡 HIGH (Fix Soon)
5. ✅ **Auto Inventory Deduction** - Inaccurate stock
6. ✅ **Void Transaction Photo Evidence** - Cash theft risk
7. ✅ **Inventory Check Before Approval** - Customer complaints

### 🟢 MEDIUM (Fix When Possible)
8. ✅ **Optimistic Locking** - Duplicate processing
9. ✅ **Wastage Photo Timestamp** - Date manipulation
10. ✅ **Parameter Type Validation** - Runtime errors

### 🔵 LOW (Nice to Have)
11. ✅ **WebSocket Reconnection** - Real-time reliability
12. ✅ **LSP Errors** - Code quality

---

## 🧪 COMPREHENSIVE TEST SCRIPT

Save as `tests/security-audit.test.ts`:

```typescript
describe('Security Audit - Hotel Management System', () => {
  describe('KOT Category Filtering', () => {
    it('should only show Beverages to Barista', async () => {
      // Test Case 1 from above
    });
    
    it('should only show Drinks to Bartender', async () => {
      // Test Case 2 from above
    });
    
    it('should only show Food to Kitchen Staff', async () => {
      // Test Case 3 from above
    });
    
    it('should prevent cross-department KOT manipulation', async () => {
      // Test Case 4 from above
    });
  });
  
  describe('Role Transaction Limits', () => {
    it('should reject transactions exceeding single limit', async () => {
      // Test case from Fix #4
    });
    
    it('should reject transactions exceeding daily limit', async () => {
      // ...
    });
  });
  
  describe('Inventory Management', () => {
    it('should prevent KOT approval with insufficient stock', async () => {
      // Test case from Fix #5
    });
    
    it('should auto-deduct inventory when KOT ready', async () => {
      // Test case from Fix #6
    });
  });
  
  describe('Anti-Fraud Measures', () => {
    it('should require photo for cash transaction voids', async () => {
      // Test case from Fix #7
    });
    
    it('should require guest signature for room charges', async () => {
      // Test case from Fix #8
    });
  });
});
```

---

## 📝 DEPLOYMENT CHECKLIST

Before deploying fixes:

- [ ] Run full test suite
- [ ] Check LSP diagnostics for errors
- [ ] Verify database migrations work
- [ ] Test on staging environment
- [ ] Backup production database
- [ ] Create rollback plan
- [ ] Update documentation
- [ ] Train staff on new features (signature requirement, etc.)
- [ ] Monitor logs for first 24 hours
- [ ] Review audit logs for suspicious activity

---

## 🎯 VERIFICATION COMMANDS

After applying fixes, run:

```bash
# 1. Check TypeScript errors
npm run type-check

# 2. Run security audit
npm run test:security

# 3. Check database schema sync
npm run db:push

# 4. Verify LSP diagnostics clear
# (Use editor LSP integration)

# 5. Test authentication flows
npm run test:auth

# 6. Load test KOT filtering
npm run test:performance
```

---

**Document Status:** Ready for Implementation  
**Last Updated:** October 24, 2025  
**Next Review:** After implementing critical fixes
