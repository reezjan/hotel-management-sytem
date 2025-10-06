import { db } from './db';
import { roles, roleCreationPermissions, users, hotels, roomTypes, rooms, mealPlans, vouchers, menuCategories, menuItems, restaurantTables } from '@shared/schema';
import { hashPassword } from './auth';
import { eq } from 'drizzle-orm';

const ROLES = [
  { name: 'super_admin', description: 'Full access across hotels' },
  { name: 'owner', description: 'Hotel owner' },
  { name: 'manager', description: 'Hotel manager' },
  { name: 'housekeeping_supervisor', description: 'Housekeeping supervisor' },
  { name: 'housekeeping_staff', description: 'Housekeeping staff' },
  { name: 'restaurant_bar_manager', description: 'Restaurant and bar manager' },
  { name: 'waiter', description: 'Waiter' },
  { name: 'kitchen_staff', description: 'Kitchen staff' },
  { name: 'bartender', description: 'Bartender' },
  { name: 'barista', description: 'Barista' },
  { name: 'security_head', description: 'Security head' },
  { name: 'security_guard', description: 'Security guard' },
  { name: 'surveillance_officer', description: 'Surveillance officer' },
  { name: 'finance', description: 'Finance' },
  { name: 'front_desk', description: 'Front desk' },
  { name: 'cashier', description: 'Cashier' },
  { name: 'storekeeper', description: 'Storekeeper' }
];

const ROLE_PERMISSIONS = [
  // Super admin permissions
  { creatorRole: 'super_admin', createeRole: 'owner' },
  { creatorRole: 'super_admin', createeRole: 'super_admin' },
  
  // Owner permissions
  { creatorRole: 'owner', createeRole: 'manager' },
  { creatorRole: 'owner', createeRole: 'housekeeping_supervisor' },
  { creatorRole: 'owner', createeRole: 'restaurant_bar_manager' },
  { creatorRole: 'owner', createeRole: 'security_head' },
  { creatorRole: 'owner', createeRole: 'finance' },
  
  // Manager permissions
  { creatorRole: 'manager', createeRole: 'housekeeping_supervisor' },
  { creatorRole: 'manager', createeRole: 'restaurant_bar_manager' },
  { creatorRole: 'manager', createeRole: 'security_head' },
  { creatorRole: 'manager', createeRole: 'finance' },
  { creatorRole: 'manager', createeRole: 'front_desk' },
  { creatorRole: 'manager', createeRole: 'storekeeper' },
  
  // Housekeeping supervisor permissions
  { creatorRole: 'housekeeping_supervisor', createeRole: 'housekeeping_staff' },
  
  // Restaurant & Bar manager permissions
  { creatorRole: 'restaurant_bar_manager', createeRole: 'waiter' },
  { creatorRole: 'restaurant_bar_manager', createeRole: 'kitchen_staff' },
  { creatorRole: 'restaurant_bar_manager', createeRole: 'bartender' },
  { creatorRole: 'restaurant_bar_manager', createeRole: 'barista' },
  { creatorRole: 'restaurant_bar_manager', createeRole: 'cashier' },
  
  // Security head permissions
  { creatorRole: 'security_head', createeRole: 'security_guard' },
  { creatorRole: 'security_head', createeRole: 'surveillance_officer' }
];

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Insert roles
    console.log('📝 Creating roles...');
    for (const role of ROLES) {
      const existing = await db
        .select()
        .from(roles)
        .where(eq(roles.name, role.name));
      
      if (existing.length === 0) {
        await db.insert(roles).values(role);
        console.log(`  ✓ Created role: ${role.name}`);
      } else {
        console.log(`  → Role already exists: ${role.name}`);
      }
    }

    // Insert role creation permissions
    console.log('\n🔐 Setting up role creation permissions...');
    for (const permission of ROLE_PERMISSIONS) {
      try {
        await db.insert(roleCreationPermissions).values(permission).onConflictDoNothing();
      } catch (error) {
        // Ignore conflicts
      }
    }
    console.log('  ✓ Role permissions configured');

    // Create superadmin user
    console.log('\n👤 Creating superadmin user...');
    const superAdminRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, 'super_admin'));

    if (superAdminRole.length === 0) {
      console.error('  ✗ Super admin role not found!');
      process.exit(1);
    }

    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.username, 'superadmin'));

    if (existingAdmin.length === 0) {
      const passwordHash = await hashPassword('aef009750905865270b03eb27ceba80e');
      
      await db.insert(users).values({
        username: 'superadmin',
        roleId: superAdminRole[0].id,
        passwordHash,
        isActive: true,
        email: 'superadmin@hotel.local',
        hotelId: null
      });
      
      console.log('  ✓ Superadmin user created');
      console.log('    Username: superadmin');
      console.log('    Password: aef009750905865270b03eb27ceba80e');
    } else {
      console.log('  → Superadmin already exists');
    }

    // Create test hotel
    console.log('\n🏨 Creating test hotel...');
    const existingHotel = await db
      .select()
      .from(hotels)
      .where(eq(hotels.name, 'Test Hotel'));

    let testHotel;
    if (existingHotel.length === 0) {
      const [newHotel] = await db.insert(hotels).values({
        name: 'Test Hotel',
        address: 'Kathmandu, Nepal',
        phone: '+977-1-1234567'
      }).returning();
      testHotel = newHotel;
      console.log('  ✓ Test hotel created');
    } else {
      testHotel = existingHotel[0];
      console.log('  → Test hotel already exists');
    }

    // Get role IDs
    const ownerRole = await db.select().from(roles).where(eq(roles.name, 'owner'));
    const managerRole = await db.select().from(roles).where(eq(roles.name, 'manager'));
    const baristaRole = await db.select().from(roles).where(eq(roles.name, 'barista'));
    const storekeeperRole = await db.select().from(roles).where(eq(roles.name, 'storekeeper'));
    const frontDeskRole = await db.select().from(roles).where(eq(roles.name, 'front_desk'));
    const restaurantBarManagerRole = await db.select().from(roles).where(eq(roles.name, 'restaurant_bar_manager'));
    const waiterRole = await db.select().from(roles).where(eq(roles.name, 'waiter'));
    const bartenderRole = await db.select().from(roles).where(eq(roles.name, 'bartender'));
    const cashierRole = await db.select().from(roles).where(eq(roles.name, 'cashier'));
    const housekeepingSupervisorRole = await db.select().from(roles).where(eq(roles.name, 'housekeeping_supervisor'));
    const housekeepingStaffRole = await db.select().from(roles).where(eq(roles.name, 'housekeeping_staff'));

    // Create test users
    console.log('\n👥 Creating test users...');
    
    const testUsers = [
      {
        username: 'owner',
        password: 'owner123',
        roleId: ownerRole[0].id,
        email: 'owner@testhotel.local'
      },
      {
        username: 'manager',
        password: 'manager',
        roleId: managerRole[0].id,
        email: 'manager@testhotel.local'
      },
      {
        username: 'barista',
        password: 'barista',
        roleId: baristaRole[0].id,
        email: 'barista@testhotel.local'
      },
      {
        username: 'store',
        password: 'storekeeper',
        roleId: storekeeperRole[0].id,
        email: 'storekeeper@testhotel.local'
      },
      {
        username: 'sita',
        password: 'sitasita',
        roleId: frontDeskRole[0].id,
        email: 'sita@testhotel.local'
      },
      {
        username: 'rbmanager',
        password: 'rbmanager',
        roleId: restaurantBarManagerRole[0].id,
        email: 'rbmanager@testhotel.local'
      },
      {
        username: 'waiter',
        password: 'waiter',
        roleId: waiterRole[0].id,
        email: 'waiter@testhotel.local'
      },
      {
        username: 'bartender',
        password: 'bartender',
        roleId: bartenderRole[0].id,
        email: 'bartender@testhotel.local'
      },
      {
        username: 'cashier',
        password: 'cashier',
        roleId: cashierRole[0].id,
        email: 'cashier@testhotel.local'
      },
      {
        username: 'hksupervisor',
        password: 'hksupervisor',
        roleId: housekeepingSupervisorRole[0].id,
        email: 'hksupervisor@testhotel.local'
      },
      {
        username: 'hkstaff',
        password: 'hkstaff',
        roleId: housekeepingStaffRole[0].id,
        email: 'hkstaff@testhotel.local'
      }
    ];

    for (const user of testUsers) {
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.username, user.username));

      if (existing.length === 0) {
        const passwordHash = await hashPassword(user.password);
        await db.insert(users).values({
          username: user.username,
          roleId: user.roleId,
          passwordHash,
          isActive: true,
          email: user.email,
          hotelId: testHotel.id
        });
        console.log(`  ✓ Created user: ${user.username} (password: ${user.password})`);
      } else {
        console.log(`  → User already exists: ${user.username}`);
      }
    }

    // Create room types
    console.log('\n🛏️  Creating room types...');
    const roomTypeData = [
      { name: 'Standard', description: 'Standard room with basic amenities', priceInhouse: '2000', priceWalkin: '2500' },
      { name: 'Deluxe', description: 'Deluxe room with premium amenities', priceInhouse: '3500', priceWalkin: '4000' },
      { name: 'Suite', description: 'Luxury suite with separate living area', priceInhouse: '5000', priceWalkin: '6000' }
    ];

    const createdRoomTypes = [];
    for (const rt of roomTypeData) {
      const existing = await db.select().from(roomTypes).where(eq(roomTypes.name, rt.name));
      if (existing.length === 0) {
        const [created] = await db.insert(roomTypes).values({
          hotelId: testHotel.id,
          ...rt
        }).returning();
        createdRoomTypes.push(created);
        console.log(`  ✓ Created room type: ${rt.name}`);
      } else {
        createdRoomTypes.push(existing[0]);
        console.log(`  → Room type already exists: ${rt.name}`);
      }
    }

    // Create rooms
    console.log('\n🚪 Creating rooms...');
    const roomNumbers = ['101', '102', '103', '201', '202', '301'];
    let roomIndex = 0;
    for (const roomNum of roomNumbers) {
      const existing = await db.select().from(rooms).where(eq(rooms.roomNumber, roomNum));
      if (existing.length === 0) {
        const roomTypeIndex = roomIndex % createdRoomTypes.length;
        await db.insert(rooms).values({
          hotelId: testHotel.id,
          roomNumber: roomNum,
          roomTypeId: createdRoomTypes[roomTypeIndex].id,
          isOccupied: false
        });
        console.log(`  ✓ Created room: ${roomNum}`);
      } else {
        console.log(`  → Room already exists: ${roomNum}`);
      }
      roomIndex++;
    }

    // Create meal plans
    console.log('\n🍽️  Creating meal plans...');
    const mealPlanData = [
      { planType: 'EP', planName: 'European Plan (Room Only)', pricePerPerson: '0', description: 'Room only, no meals included' },
      { planType: 'CP', planName: 'Continental Plan (Bed & Breakfast)', pricePerPerson: '500', description: 'Includes breakfast' },
      { planType: 'MAP', planName: 'Modified American Plan', pricePerPerson: '1200', description: 'Includes breakfast and dinner' },
      { planType: 'AP', planName: 'American Plan (Full Board)', pricePerPerson: '2000', description: 'Includes all three meals' }
    ];

    for (const plan of mealPlanData) {
      const existing = await db.select().from(mealPlans).where(eq(mealPlans.planType, plan.planType));
      if (existing.length === 0) {
        await db.insert(mealPlans).values({
          hotelId: testHotel.id,
          ...plan
        });
        console.log(`  ✓ Created meal plan: ${plan.planType}`);
      } else {
        console.log(`  → Meal plan already exists: ${plan.planType}`);
      }
    }

    // Create discount voucher
    console.log('\n🎟️  Creating discount voucher...');
    const existingVoucher = await db.select().from(vouchers).where(eq(vouchers.code, 'DISCOUNT1000'));
    if (existingVoucher.length === 0) {
      await db.insert(vouchers).values({
        hotelId: testHotel.id,
        code: 'DISCOUNT1000',
        discountAmount: '1000',
        discountType: 'fixed',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        maxUses: 100,
        usedCount: 0
      });
      console.log('  ✓ Created discount voucher: DISCOUNT1000 (Rs. 1000 off)');
    } else {
      console.log('  → Discount voucher already exists: DISCOUNT1000');
    }

    // Create menu categories
    console.log('\n🍴 Creating menu categories...');
    const categoryData = [
      { name: 'Breakfast' },
      { name: 'Main Course' },
      { name: 'Appetizers' },
      { name: 'Beverages' },
      { name: 'Desserts' }
    ];

    const createdCategories = [];
    for (const cat of categoryData) {
      const existing = await db.select().from(menuCategories).where(eq(menuCategories.name, cat.name));
      if (existing.length === 0) {
        const [created] = await db.insert(menuCategories).values({
          hotelId: testHotel.id,
          ...cat
        }).returning();
        createdCategories.push(created);
        console.log(`  ✓ Created category: ${cat.name}`);
      } else {
        createdCategories.push(existing[0]);
        console.log(`  → Category already exists: ${cat.name}`);
      }
    }

    // Create menu items
    console.log('\n📋 Creating menu items...');
    const menuItemsData = [
      { categoryName: 'Breakfast', name: 'Pancakes with Syrup', price: '350', description: 'Fluffy pancakes with maple syrup' },
      { categoryName: 'Breakfast', name: 'Eggs Benedict', price: '450', description: 'Poached eggs with hollandaise sauce' },
      { categoryName: 'Breakfast', name: 'Continental Breakfast', price: '500', description: 'Toast, eggs, juice, and coffee' },
      { categoryName: 'Main Course', name: 'Chicken Tikka Masala', price: '650', description: 'Creamy chicken curry with rice' },
      { categoryName: 'Main Course', name: 'Grilled Salmon', price: '850', description: 'Fresh salmon with vegetables' },
      { categoryName: 'Main Course', name: 'Vegetable Biryani', price: '450', description: 'Aromatic rice with mixed vegetables' },
      { categoryName: 'Appetizers', name: 'Spring Rolls', price: '250', description: 'Crispy vegetable spring rolls' },
      { categoryName: 'Appetizers', name: 'Chicken Wings', price: '400', description: 'Spicy buffalo wings' },
      { categoryName: 'Beverages', name: 'Espresso', price: '150', description: 'Double shot espresso' },
      { categoryName: 'Beverages', name: 'Cappuccino', price: '200', description: 'Espresso with steamed milk' },
      { categoryName: 'Beverages', name: 'Fresh Orange Juice', price: '180', description: 'Freshly squeezed orange juice' },
      { categoryName: 'Desserts', name: 'Chocolate Cake', price: '300', description: 'Rich chocolate layer cake' },
      { categoryName: 'Desserts', name: 'Ice Cream Sundae', price: '250', description: 'Vanilla ice cream with toppings' }
    ];

    for (const item of menuItemsData) {
      const category = createdCategories.find(c => c.name === item.categoryName);
      if (category) {
        const existing = await db.select().from(menuItems).where(eq(menuItems.name, item.name));
        if (existing.length === 0) {
          await db.insert(menuItems).values({
            hotelId: testHotel.id,
            categoryId: category.id,
            name: item.name,
            price: item.price,
            description: item.description,
            active: true
          });
          console.log(`  ✓ Created menu item: ${item.name}`);
        } else {
          console.log(`  → Menu item already exists: ${item.name}`);
        }
      }
    }

    // Create restaurant tables
    console.log('\n🍽️  Creating restaurant tables...');
    const restaurantTableData = [
      { name: 'Table 1', capacity: 2, status: 'available' },
      { name: 'Table 2', capacity: 2, status: 'available' },
      { name: 'Table 3', capacity: 4, status: 'available' },
      { name: 'Table 4', capacity: 4, status: 'available' },
      { name: 'Table 5', capacity: 6, status: 'available' },
      { name: 'Table 6', capacity: 6, status: 'available' },
      { name: 'Table 7', capacity: 8, status: 'available' },
      { name: 'Table 8', capacity: 4, status: 'available' },
      { name: 'VIP Table 1', capacity: 10, status: 'available' },
      { name: 'VIP Table 2', capacity: 12, status: 'available' }
    ];

    for (const table of restaurantTableData) {
      const existing = await db.select().from(restaurantTables).where(eq(restaurantTables.name, table.name));
      if (existing.length === 0) {
        await db.insert(restaurantTables).values({
          hotelId: testHotel.id,
          ...table
        });
        console.log(`  ✓ Created restaurant table: ${table.name} (Capacity: ${table.capacity})`);
      } else {
        console.log(`  → Restaurant table already exists: ${table.name}`);
      }
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Summary:');
    console.log('  - Hotel: Test Hotel');
    console.log('  - Users: owner, manager, barista, store, sita');
    console.log('  - Rooms: 101, 102, 103, 201, 202, 301');
    console.log('  - Meal Plans: EP, CP, MAP, AP');
    console.log('  - Discount Code: DISCOUNT1000 (Rs. 1000 off)');
    console.log('  - Menu Items: 13 items across 5 categories');
    console.log('  - Restaurant Tables: 10 tables (2-12 seating capacity)');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
