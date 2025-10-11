import { db } from './db';
import { roles, roleCreationPermissions, users, hotels, roomTypes, rooms, mealPlans, vouchers, menuCategories, menuItems, restaurantTables, halls, guests, transactions, vendors, maintenanceRequests, leavePolicies } from '@shared/schema';
import { hashPassword } from './auth';
import { eq, and } from 'drizzle-orm';

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
    const financeRole = await db.select().from(roles).where(eq(roles.name, 'finance'));
    const securityHeadRole = await db.select().from(roles).where(eq(roles.name, 'security_head'));
    const surveillanceOfficerRole = await db.select().from(roles).where(eq(roles.name, 'surveillance_officer'));

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
      },
      {
        username: 'finance',
        password: 'finance',
        roleId: financeRole[0].id,
        email: 'finance@testhotel.local'
      },
      {
        username: 'securityhead',
        password: 'securityhead',
        roleId: securityHeadRole[0].id,
        email: 'securityhead@testhotel.local'
      },
      {
        username: 'surveillance',
        password: 'surveillance',
        roleId: surveillanceOfficerRole[0].id,
        email: 'surveillance@testhotel.local'
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

    // Create leave policies
    console.log('\n📋 Creating leave policies...');
    const leavePolicyData = [
      { leaveType: 'sick', displayName: 'Sick Leave', defaultDays: 10 },
      { leaveType: 'vacation', displayName: 'Vacation Leave', defaultDays: 15 },
      { leaveType: 'personal', displayName: 'Personal Leave', defaultDays: 5 },
      { leaveType: 'emergency', displayName: 'Emergency Leave', defaultDays: 5 },
      { leaveType: 'family', displayName: 'Family Leave', defaultDays: 5 }
    ];

    for (const policy of leavePolicyData) {
      const existing = await db
        .select()
        .from(leavePolicies)
        .where(and(
          eq(leavePolicies.hotelId, testHotel.id),
          eq(leavePolicies.leaveType, policy.leaveType)
        ));

      if (existing.length === 0) {
        await db.insert(leavePolicies).values({
          hotelId: testHotel.id,
          ...policy,
          isActive: true
        });
        console.log(`  ✓ Created leave policy: ${policy.displayName} (${policy.defaultDays} days)`);
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

    // Create halls
    console.log('\n🏛️  Creating halls...');
    const hallData = [
      { name: 'Grand Ballroom', capacity: 200, priceInhouse: '15000', priceWalkin: '20000', hourlyRate: '5000' },
      { name: 'Conference Hall A', capacity: 50, priceInhouse: '8000', priceWalkin: '10000', hourlyRate: '3000' },
      { name: 'Conference Hall B', capacity: 50, priceInhouse: '8000', priceWalkin: '10000', hourlyRate: '3000' },
      { name: 'Banquet Hall', capacity: 150, priceInhouse: '12000', priceWalkin: '15000', hourlyRate: '4000' },
      { name: 'Meeting Room 1', capacity: 20, priceInhouse: '3000', priceWalkin: '4000', hourlyRate: '1500' },
      { name: 'Meeting Room 2', capacity: 20, priceInhouse: '3000', priceWalkin: '4000', hourlyRate: '1500' },
      { name: 'Executive Lounge', capacity: 30, priceInhouse: '5000', priceWalkin: '6500', hourlyRate: '2000' }
    ];

    for (const hall of hallData) {
      const existing = await db.select().from(halls).where(eq(halls.name, hall.name));
      if (existing.length === 0) {
        await db.insert(halls).values({
          hotelId: testHotel.id,
          ...hall
        });
        console.log(`  ✓ Created hall: ${hall.name} (Capacity: ${hall.capacity})`);
      } else {
        console.log(`  → Hall already exists: ${hall.name}`);
      }
    }

    // Create guests
    console.log('\n👥 Creating guests...');
    
    // Get front desk user for createdBy field
    const frontDeskUser = await db.select().from(users).where(eq(users.username, 'sita'));
    
    const guestData = [
      { firstName: 'John', lastName: 'Smith', email: 'john.smith@email.com', phone: '+1-555-0101', address: '123 Main St', city: 'New York', country: 'USA', idType: 'Passport', idNumber: 'US123456789', nationality: 'American', dateOfBirth: new Date('1985-03-15') },
      { firstName: 'Emma', lastName: 'Johnson', email: 'emma.j@email.com', phone: '+44-20-1234567', address: '45 Baker Street', city: 'London', country: 'UK', idType: 'Passport', idNumber: 'UK987654321', nationality: 'British', dateOfBirth: new Date('1990-07-22') },
      { firstName: 'Raj', lastName: 'Sharma', email: 'raj.sharma@email.com', phone: '+91-98765-43210', address: '789 MG Road', city: 'Mumbai', country: 'India', idType: 'Passport', idNumber: 'IN456789123', nationality: 'Indian', dateOfBirth: new Date('1988-11-30') },
      { firstName: 'Maria', lastName: 'Garcia', email: 'maria.g@email.com', phone: '+34-91-234-5678', address: 'Calle Mayor 12', city: 'Madrid', country: 'Spain', idType: 'National ID', idNumber: 'ES789456123', nationality: 'Spanish', dateOfBirth: new Date('1992-05-18') },
      { firstName: 'Chen', lastName: 'Wei', email: 'chen.wei@email.com', phone: '+86-10-8765-4321', address: '56 Beijing Road', city: 'Shanghai', country: 'China', idType: 'Passport', idNumber: 'CN147258369', nationality: 'Chinese', dateOfBirth: new Date('1987-09-10') },
      { firstName: 'Sarah', lastName: 'Williams', email: 'sarah.w@email.com', phone: '+1-555-0202', address: '789 Oak Avenue', city: 'Los Angeles', country: 'USA', idType: 'Driver License', idNumber: 'DL987654321', nationality: 'American', dateOfBirth: new Date('1995-12-05') },
      { firstName: 'Mohammed', lastName: 'Al-Rashid', email: 'mohammed.ar@email.com', phone: '+971-4-123-4567', address: 'Sheikh Zayed Road', city: 'Dubai', country: 'UAE', idType: 'Emirates ID', idNumber: 'UAE123456789', nationality: 'Emirati', dateOfBirth: new Date('1983-04-25') },
      { firstName: 'Sophie', lastName: 'Dubois', email: 'sophie.d@email.com', phone: '+33-1-2345-6789', address: '23 Rue de Rivoli', city: 'Paris', country: 'France', idType: 'National ID', idNumber: 'FR456789123', nationality: 'French', dateOfBirth: new Date('1991-08-14') },
      { firstName: 'Yuki', lastName: 'Tanaka', email: 'yuki.t@email.com', phone: '+81-3-1234-5678', address: '1-2-3 Shibuya', city: 'Tokyo', country: 'Japan', idType: 'Passport', idNumber: 'JP789123456', nationality: 'Japanese', dateOfBirth: new Date('1989-02-28') },
      { firstName: 'David', lastName: 'Brown', email: 'david.b@email.com', phone: '+61-2-9876-5432', address: '456 George Street', city: 'Sydney', country: 'Australia', idType: 'Passport', idNumber: 'AU321654987', nationality: 'Australian', dateOfBirth: new Date('1986-10-12') },
      { firstName: 'Anna', lastName: 'Kowalski', email: 'anna.k@email.com', phone: '+48-22-123-4567', address: 'ul. Nowy Świat 15', city: 'Warsaw', country: 'Poland', idType: 'National ID', idNumber: 'PL654987321', nationality: 'Polish', dateOfBirth: new Date('1993-06-20') },
      { firstName: 'Carlos', lastName: 'Rodriguez', email: 'carlos.r@email.com', phone: '+52-55-8765-4321', address: 'Avenida Reforma 100', city: 'Mexico City', country: 'Mexico', idType: 'Passport', idNumber: 'MX852963741', nationality: 'Mexican', dateOfBirth: new Date('1984-01-08') },
      { firstName: 'Lisa', lastName: 'Anderson', email: 'lisa.a@email.com', phone: '+1-555-0303', address: '321 Pine Street', city: 'Chicago', country: 'USA', idType: 'Passport', idNumber: 'US741852963', nationality: 'American', dateOfBirth: new Date('1994-03-17') },
      { firstName: 'Ahmed', lastName: 'Hassan', email: 'ahmed.h@email.com', phone: '+20-2-3456-7890', address: 'Tahrir Square', city: 'Cairo', country: 'Egypt', idType: 'National ID', idNumber: 'EG963852741', nationality: 'Egyptian', dateOfBirth: new Date('1990-09-05') },
      { firstName: 'Olivia', lastName: 'Taylor', email: 'olivia.t@email.com', phone: '+1-416-987-6543', address: '789 King Street', city: 'Toronto', country: 'Canada', idType: 'Passport', idNumber: 'CA159753486', nationality: 'Canadian', dateOfBirth: new Date('1992-11-22') },
      { firstName: 'Lars', lastName: 'Nielsen', email: 'lars.n@email.com', phone: '+45-33-12-34-56', address: 'Strøget 25', city: 'Copenhagen', country: 'Denmark', idType: 'Passport', idNumber: 'DK357159486', nationality: 'Danish', dateOfBirth: new Date('1988-07-30') },
      { firstName: 'Priya', lastName: 'Patel', email: 'priya.p@email.com', phone: '+91-22-9876-5432', address: 'Linking Road', city: 'Mumbai', country: 'India', idType: 'Aadhaar', idNumber: 'IN753951486', nationality: 'Indian', dateOfBirth: new Date('1996-04-12') },
      { firstName: 'Thomas', lastName: 'Mueller', email: 'thomas.m@email.com', phone: '+49-30-1234-5678', address: 'Unter den Linden 10', city: 'Berlin', country: 'Germany', idType: 'Passport', idNumber: 'DE951357486', nationality: 'German', dateOfBirth: new Date('1987-12-03') },
      { firstName: 'Isabella', lastName: 'Rossi', email: 'isabella.r@email.com', phone: '+39-06-8765-4321', address: 'Via Veneto 50', city: 'Rome', country: 'Italy', idType: 'National ID', idNumber: 'IT486159753', nationality: 'Italian', dateOfBirth: new Date('1991-02-14') },
      { firstName: 'Kim', lastName: 'Min-Ho', email: 'kim.minho@email.com', phone: '+82-2-1234-5678', address: 'Gangnam-gu', city: 'Seoul', country: 'South Korea', idType: 'Passport', idNumber: 'KR753486159', nationality: 'Korean', dateOfBirth: new Date('1989-08-25') }
    ];

    for (const guest of guestData) {
      const existing = await db.select().from(guests).where(eq(guests.email, guest.email || ''));
      if (existing.length === 0) {
        await db.insert(guests).values({
          hotelId: testHotel.id,
          ...guest,
          createdBy: frontDeskUser[0].id
        });
        console.log(`  ✓ Created guest: ${guest.firstName} ${guest.lastName} (${guest.nationality})`);
      } else {
        console.log(`  → Guest already exists: ${guest.firstName} ${guest.lastName}`);
      }
    }

    // Create vendors
    console.log('\n🏢 Creating vendors...');
    const vendorData = [
      { name: 'Nepal Electricity Authority', contact: { phone: '+977-1-4150220', email: 'nea@nea.org.np', address: 'Kathmandu' } },
      { name: 'Fresh Foods Pvt Ltd', contact: { phone: '+977-1-4567890', email: 'sales@freshfoods.com.np', address: 'Baneshwor, Kathmandu' } },
      { name: 'Cleaning Supplies Co', contact: { phone: '+977-1-7654321', email: 'info@cleaningsupplies.com.np', address: 'Teku, Kathmandu' } },
      { name: 'Linens & More', contact: { phone: '+977-1-3456789', email: 'orders@linensmore.com.np', address: 'Putalisadak, Kathmandu' } },
      { name: 'Tech Solutions Nepal', contact: { phone: '+977-1-2345678', email: 'support@techsolutions.com.np', address: 'Durbarmarg, Kathmandu' } }
    ];

    const createdVendors = [];
    for (const vendor of vendorData) {
      const existing = await db.select().from(vendors).where(eq(vendors.name, vendor.name));
      if (existing.length === 0) {
        const [created] = await db.insert(vendors).values({
          hotelId: testHotel.id,
          ...vendor
        }).returning();
        createdVendors.push(created);
        console.log(`  ✓ Created vendor: ${vendor.name}`);
      } else {
        createdVendors.push(existing[0]);
        console.log(`  → Vendor already exists: ${vendor.name}`);
      }
    }

    // Create financial transactions
    console.log('\n💰 Creating financial transactions...');
    
    // Get finance user for createdBy field
    const financeUser = await db.select().from(users).where(eq(users.username, 'finance'));
    const managerUser = await db.select().from(users).where(eq(users.username, 'manager'));
    
    const transactionData = [
      // Revenue transactions
      { txnType: 'revenue', amount: '15000', paymentMethod: 'cash', purpose: 'Room Booking Payment', reference: 'ROOM-001', details: { roomNumber: '101', guestName: 'John Smith', nights: 5 }, createdBy: frontDeskUser[0].id, createdAt: new Date('2025-10-05') },
      { txnType: 'revenue', amount: '8500', paymentMethod: 'credit_card', purpose: 'Restaurant Bill', reference: 'REST-045', details: { tableNumber: 'Table 5', items: 7 }, createdBy: cashierRole[0] ? financeUser[0].id : frontDeskUser[0].id, createdAt: new Date('2025-10-06') },
      { txnType: 'revenue', amount: '12000', paymentMethod: 'bank_transfer', purpose: 'Hall Booking', reference: 'HALL-023', details: { hallName: 'Conference Hall A', duration: '4 hours' }, createdBy: frontDeskUser[0].id, createdAt: new Date('2025-10-07') },
      { txnType: 'revenue', amount: '20000', paymentMethod: 'cash', purpose: 'Room Booking Payment', reference: 'ROOM-002', details: { roomNumber: '301', guestName: 'Emma Johnson', nights: 4 }, createdBy: frontDeskUser[0].id, createdAt: new Date('2025-10-07') },
      { txnType: 'revenue', amount: '4500', paymentMethod: 'credit_card', purpose: 'Restaurant Bill', reference: 'REST-046', details: { tableNumber: 'Table 3' }, createdBy: financeUser[0].id, createdAt: new Date('2025-10-08') },
      
      // Expense transactions
      { txnType: 'expense', amount: '25000', paymentMethod: 'bank_transfer', vendorId: createdVendors[0].id, purpose: 'Electricity Bill - September', reference: 'INV-NEA-202509', details: { billingMonth: 'September 2025', units: 5000 }, createdBy: financeUser[0].id, createdAt: new Date('2025-10-01') },
      { txnType: 'expense', amount: '45000', paymentMethod: 'cash', vendorId: createdVendors[1].id, purpose: 'Fresh Food Supplies', reference: 'INV-FF-1234', details: { items: ['Vegetables', 'Fruits', 'Meat', 'Dairy'] }, createdBy: managerUser[0].id, createdAt: new Date('2025-10-03') },
      { txnType: 'expense', amount: '12000', paymentMethod: 'cash', vendorId: createdVendors[2].id, purpose: 'Cleaning Supplies Monthly Stock', reference: 'INV-CS-567', details: { items: ['Detergent', 'Floor Cleaner', 'Disinfectant'] }, createdBy: managerUser[0].id, createdAt: new Date('2025-10-04') },
      { txnType: 'expense', amount: '35000', paymentMethod: 'bank_transfer', vendorId: createdVendors[3].id, purpose: 'Bed Linens and Towels', reference: 'INV-LM-890', details: { items: ['Bed Sheets - 50', 'Towels - 100', 'Pillow Covers - 80'] }, createdBy: financeUser[0].id, createdAt: new Date('2025-10-05') },
      { txnType: 'expense', amount: '18000', paymentMethod: 'bank_transfer', vendorId: createdVendors[4].id, purpose: 'IT Support & Maintenance', reference: 'INV-TS-456', details: { service: 'Monthly maintenance', duration: 'October 2025' }, createdBy: financeUser[0].id, createdAt: new Date('2025-10-06') },
      
      // Salary payments
      { txnType: 'expense', amount: '40000', paymentMethod: 'bank_transfer', purpose: 'Salary - Manager', reference: 'SAL-202509-MGR', details: { month: 'September 2025', employeeName: 'Manager' }, createdBy: financeUser[0].id, createdAt: new Date('2025-10-01') },
      { txnType: 'expense', amount: '25000', paymentMethod: 'bank_transfer', purpose: 'Salary - Finance Officer', reference: 'SAL-202509-FIN', details: { month: 'September 2025', employeeName: 'Finance' }, createdBy: financeUser[0].id, createdAt: new Date('2025-10-01') },
      
      // Refund
      { txnType: 'refund', amount: '3000', paymentMethod: 'cash', purpose: 'Guest Complaint - Room Service Issue', reference: 'REF-001', details: { guestName: 'David Brown', roomNumber: '201', reason: 'Delayed room service' }, createdBy: managerUser[0].id, createdAt: new Date('2025-10-08') },
      
      // Miscellaneous
      { txnType: 'miscellaneous', amount: '8000', paymentMethod: 'cash', purpose: 'Office Supplies Purchase', reference: 'MISC-123', details: { items: ['Stationery', 'Printer Paper', 'Ink Cartridges'] }, createdBy: managerUser[0].id, createdAt: new Date('2025-10-02') },
      { txnType: 'miscellaneous', amount: '5000', paymentMethod: 'cash', purpose: 'Minor Repairs - Plumbing', reference: 'MISC-124', details: { location: 'Room 102 bathroom', issue: 'Leaking faucet' }, createdBy: managerUser[0].id, createdAt: new Date('2025-10-06') }
    ];

    let transactionCount = 0;
    for (const txn of transactionData) {
      const [created] = await db.insert(transactions).values({
        hotelId: testHotel.id,
        ...txn
      }).returning();
      transactionCount++;
      console.log(`  ✓ Created transaction: ${txn.txnType} - ${txn.purpose} (Rs. ${txn.amount})`);
    }

    // Create maintenance requests
    console.log('\n🔧 Creating maintenance requests...');
    
    const hkSupervisorUser = await db.select().from(users).where(eq(users.username, 'hksupervisor'));
    const hkStaffUser = await db.select().from(users).where(eq(users.username, 'hkstaff'));
    
    const maintenanceRequestData = [
      {
        reportedBy: hkStaffUser[0].id,
        title: 'Air Conditioner Not Working',
        location: 'Room 201',
        description: 'The air conditioning unit in room 201 is not cooling properly. Guest complained about the room being too warm.',
        photo: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800',
        priority: 'high',
        status: 'approved',
        assignedTo: hkSupervisorUser[0].id,
        createdAt: new Date('2025-10-06T09:30:00'),
        updatedAt: new Date('2025-10-06T10:15:00')
      },
      {
        reportedBy: frontDeskUser[0].id,
        title: 'Leaking Faucet in Bathroom',
        location: 'Room 102',
        description: 'Water is continuously dripping from the bathroom sink faucet. Needs immediate attention to avoid water wastage.',
        photo: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800',
        priority: 'medium',
        status: 'approved',
        assignedTo: hkSupervisorUser[0].id,
        createdAt: new Date('2025-10-07T14:20:00'),
        updatedAt: new Date('2025-10-07T15:00:00')
      },
      {
        reportedBy: hkStaffUser[0].id,
        title: 'Broken Window Latch',
        location: 'Room 301',
        description: 'The window latch is broken and the window cannot be secured properly. This is a security concern.',
        photo: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800',
        priority: 'high',
        status: 'approved',
        assignedTo: hkSupervisorUser[0].id,
        createdAt: new Date('2025-10-08T08:45:00'),
        updatedAt: new Date('2025-10-08T09:30:00')
      },
      {
        reportedBy: managerUser[0].id,
        title: 'Damaged Carpet in Lobby',
        location: 'Main Lobby',
        description: 'Section of carpet near the entrance is torn and frayed. Needs replacement for aesthetic and safety reasons.',
        photo: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=800',
        priority: 'medium',
        status: 'approved',
        assignedTo: hkSupervisorUser[0].id,
        createdAt: new Date('2025-10-05T11:00:00'),
        updatedAt: new Date('2025-10-05T12:00:00')
      },
      {
        reportedBy: hkStaffUser[0].id,
        title: 'Malfunctioning Door Lock',
        location: 'Room 103',
        description: 'Electronic door lock is not responding properly. Guest had difficulty entering the room.',
        photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        priority: 'high',
        status: 'approved',
        assignedTo: hkSupervisorUser[0].id,
        createdAt: new Date('2025-10-08T16:30:00'),
        updatedAt: new Date('2025-10-08T17:00:00')
      },
      {
        reportedBy: frontDeskUser[0].id,
        title: 'Faulty Light Fixtures',
        location: 'Conference Hall A',
        description: 'Several ceiling light fixtures are flickering and some are completely non-functional. Affects meeting room ambiance.',
        photo: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800',
        priority: 'medium',
        status: 'approved',
        assignedTo: hkSupervisorUser[0].id,
        createdAt: new Date('2025-10-07T10:00:00'),
        updatedAt: new Date('2025-10-07T11:30:00')
      }
    ];

    let maintenanceCount = 0;
    for (const request of maintenanceRequestData) {
      await db.insert(maintenanceRequests).values({
        hotelId: testHotel.id,
        ...request
      });
      maintenanceCount++;
      console.log(`  ✓ Created maintenance request: ${request.title} (${request.location}) - Status: ${request.status}`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Summary:');
    console.log('  - Hotel: Test Hotel');
    console.log('  - Users: 14 users (including securityhead, surveillance)');
    console.log('  - Guests: 20 international guests');
    console.log('  - Rooms: 101, 102, 103, 201, 202, 301');
    console.log('  - Meal Plans: EP, CP, MAP, AP');
    console.log('  - Discount Code: DISCOUNT1000 (Rs. 1000 off)');
    console.log('  - Menu Items: 13 items across 5 categories');
    console.log('  - Restaurant Tables: 10 tables (2-12 seating capacity)');
    console.log('  - Halls: 7 halls (20-200 capacity)');
    console.log('  - Vendors: 5 vendors');
    console.log(`  - Financial Transactions: ${transactionCount} transactions (revenue, expenses, refunds)`);
    console.log(`  - Maintenance Requests: ${maintenanceCount} approved requests with photos`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
